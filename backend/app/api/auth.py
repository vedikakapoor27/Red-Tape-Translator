from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserOut
from app.core.security import verify_clerk_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/sync", response_model=UserOut)
async def sync_user(
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    """Called after Clerk login to upsert user into our DB."""
    clerk_id = payload.get("sub")
    email = payload.get("email", "") or (payload.get("email_addresses") or [{}])[0].get("email_address", "")
    name = f"{payload.get('first_name', '')} {payload.get('last_name', '')}".strip()

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        user = User(clerk_id=clerk_id, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = email
        user.name = name
        db.commit()
        db.refresh(user)

    return user

@router.get("/me", response_model=UserOut)
async def get_me(
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    clerk_id = payload.get("sub")
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Call /auth/sync first.")
    return user