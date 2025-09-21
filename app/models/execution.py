from pydantic import BaseModel, Field, ConfigDict

class ExecutionResponse(BaseModel):
    """Model for processed email response metadata"""
    reasoning: str = Field(
        description="Reasoning for the email response"
    )
    most_recent_message: str = Field(
        description="Most recent message in the conversation verbatim"
    )
    email_body: str = Field(
        description="Body of the email response left blank if no response is needed"
    )

    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)

    model_config = ConfigDict(extra="forbid")
