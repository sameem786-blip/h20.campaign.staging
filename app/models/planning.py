from pydantic import BaseModel, Field, ConfigDict

class PlanningResponse(BaseModel):
    """Model for planning response"""
    plan: str = Field(
        description="Plan for the email response"
    )
    
    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)
    
    model_config = ConfigDict(extra="forbid")