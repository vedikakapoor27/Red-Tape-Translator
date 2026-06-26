from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    clerk_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    name = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    conversations = relationship("Conversation", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")
    scheme_matches = relationship("SchemeMatch", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    conversation = relationship("Conversation", back_populates="messages")

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    ministry = Column(String)
    category = Column(String)           # health, education, agriculture, etc.
    description = Column(Text)
    eligibility = Column(Text)
    benefits = Column(Text)
    how_to_apply = Column(Text)
    documents_required = Column(JSON)   # list of strings
    official_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SchemeMatch(Base):
    __tablename__ = "scheme_matches"
    id = Column(String, primary_key=True, default=gen_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    scheme_id = Column(String, ForeignKey("government_schemes.id"), nullable=False)
    confidence_score = Column(Float)
    reason = Column(Text)
    draft_letter = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    conversation = relationship("Conversation", back_populates="scheme_matches")
    scheme = relationship("GovernmentScheme")