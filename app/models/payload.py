from pydantic import BaseModel
from typing import Optional
from app.models.conversation import Conversation

class ProcessEmailPayload(BaseModel):
    conversation: Conversation
    env: str = "production"
    batch_name: Optional[str] = None
    
    @property
    def conversation_last_message_direction(self) -> str:
        return self.conversation.last_message_direction

    def conversation_to_json_str(self) -> str:
        import json
        return json.dumps(self.conversation.model_dump(), indent=2, default=str)
        
class ActionPayload(BaseModel):
    creator_id: Optional[int] = None
    conversation_id: Optional[int] = None
    campaign_id: Optional[int] = None
    instructions: str
    
    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)