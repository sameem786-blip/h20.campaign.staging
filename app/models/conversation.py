from pydantic import BaseModel
from typing import Optional, List, Union, Dict, Any
from datetime import datetime

class Message(BaseModel):
    id: int
    body: str
    tags: Optional[List[str]] = None
    stage: Optional[str] = None
    sender: str
    sent_at: Optional[datetime] = None
    subject: Optional[str] = None
    direction: Optional[str] = None
    opened_at: Optional[datetime] = None
    recipient: Optional[str] = None
    created_at: Optional[datetime] = None
    conversation_id: Optional[int] = None
    ai_response_used: Optional[bool] = None
    external_message_id: Optional[str] = None
    negotiation_summary: Optional[str] = None
    follow_up_needed: Optional[bool] = None
    follow_up_date: Optional[datetime] = None

class Conversation(BaseModel):
    id: int
    campaign_id: Optional[int] = None
    campaign_name: Optional[str] = None
    creator_id: Optional[int] = None
    creator_name: Optional[str] = None
    smartlead_campaign_id: Optional[int] = None
    smartlead_campaign_name: Optional[str] = None
    last_message_id: Optional[int] = None
    last_message_direction: Optional[str] = None
    messages: List[Message]
