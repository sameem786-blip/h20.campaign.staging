from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

class ActionResponse(BaseModel):
    """Model for processed email response metadata"""
    last_message_id: int = Field(
        description="The ID of the last message in the conversation"
    )
    action: Literal["email_response"] = Field(
        description="Action to take based on the email thread"
    )
    reasoning: str = Field(
        description="Reasoning for the email response"
    )
    email_body: str = Field(
        description="Body of the email response left blank if no response is needed"
    )

    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)

    model_config = ConfigDict(extra="forbid")
