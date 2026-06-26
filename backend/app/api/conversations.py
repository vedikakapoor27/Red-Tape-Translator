from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, Conversation, Message, GovernmentScheme, SchemeMatch
from app.schemas.schemas import MessageCreate, ConversationOut, ClaudeResponse
from app.core.security import verify_clerk_token
from app.core.rate_limit import limiter
from app.services.claude_service import call_claude, build_schemes_context, format_messages_for_claude

router = APIRouter(prefix="/conversations", tags=["conversations"])

def get_current_user(payload: dict = Depends(verify_clerk_token), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.clerk_id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not synced. Call /auth/sync.")
    return user

@router.get("/", response_model=List[ConversationOut])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

@router.get("/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/message", response_model=ClaudeResponse)
@limiter.limit("10/minute")
async def send_message(
    request: Request,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get or create conversation
    if body.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == body.conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(
            user_id=current_user.id,
            title=body.content[:60] + ("..." if len(body.content) > 60 else ""),
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(conversation_id=conv.id, role="user", content=body.content)
    db.add(user_msg)
    db.commit()

    # Build history for Claude
    all_messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    claude_messages = format_messages_for_claude(all_messages)

    # Load all active schemes
    schemes = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True).all()
    schemes_context = build_schemes_context(schemes)

    # Call Claude (with retry)
    try:
        claude_result = call_claude(claude_messages, schemes_context)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    # Build assistant reply text
    reply_text = claude_result.get("summary", "")
    if claude_result.get("follow_up_question"):
        reply_text += f"\n\n{claude_result['follow_up_question']}"

    # Save assistant message
    assistant_msg = Message(conversation_id=conv.id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    # Save scheme matches
    saved_matches = []
    matched = claude_result.get("matched_schemes", [])
    draft_letter = claude_result.get("draft_letter", "")

    for i, match in enumerate(matched):
        scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == match["scheme_id"]).first()
        if not scheme:
            continue
        sm = SchemeMatch(
            conversation_id=conv.id,
            scheme_id=scheme.id,
            confidence_score=match.get("confidence_score"),
            reason=match.get("reason"),
            draft_letter=draft_letter if i == 0 else None,  # only top match gets the letter
        )
        db.add(sm)
        db.commit()
        db.refresh(sm)
        saved_matches.append(sm)

    return ClaudeResponse(
        conversation_id=conv.id,
        assistant_message=assistant_msg,
        scheme_matches=saved_matches,
    )

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Deleted"}