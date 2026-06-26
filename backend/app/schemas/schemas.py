from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[str] = None

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class SchemeOut(BaseModel):
    id: str
    name: str
    ministry: Optional[str]
    category: Optional[str]
    description: Optional[str]
    eligibility: Optional[str]
    benefits: Optional[str]
    how_to_apply: Optional[str]
    documents_required: Optional[List[str]]
    official_url: Optional[str]
    class Config:
        from_attributes = True

class SchemeMatchOut(BaseModel):
    id: str
    scheme: SchemeOut
    confidence_score: Optional[float]
    reason: Optional[str]
    draft_letter: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[MessageOut] = []
    scheme_matches: List[SchemeMatchOut] = []
    class Config:
        from_attributes = True

class ClaudeResponse(BaseModel):
    conversation_id: str
    assistant_message: MessageOut
    scheme_matches: List[SchemeMatchOut]

class UserOut(BaseModel):
    id: str
    clerk_id: str
    email: str
    name: Optional[str]
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AdminStatsOut(BaseModel):
    total_users: int
    total_conversations: int
    total_messages: int
    total_scheme_matches: int