from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional, Dict, Any

class Deliverable(BaseModel):
    name: str = Field(
        description="Name of the deliverable"
    )
    creator_id: int = Field(
        description="ID of the creator"
    )
    media_type: str = Field(
        description="Media type of the deliverable (e.g. video, story, reel, post, etc.)"
    )
    platform: Literal[
        "instagram",
        "tiktok",
        "youtube",
        "multi"
    ] = Field(
        description="Platform of the deliverable"
    )
    duration_sec: Optional[int] = Field(
        description="Duration of the deliverable in seconds"
    )
    cross_posted: Optional[bool] = Field(
        description="Whether the deliverable is cross-posted to other platforms"
    )
    price: Optional[float] = Field(
        description="Price of the deliverable"
    )
    currency: Optional[str] = Field(
        description="Currency of the deliverable (e.g. USD, EUR, etc.)"
    )
    unit: Optional[Literal[
        "per_post",
        "per_package",
        "per_month"
    ]] = Field(
        description="Unit of the deliverable (e.g. per_post, per_package, per_month, etc.)"
    )
    notes: Optional[str] = Field(
        description="Any additional notes about the deliverable"
    )
    raw_text: Optional[str] = Field(
        description="The original email text that was used to generate the deliverable"
    )

class MessageMetadata(BaseModel):
    message_id: int = Field(
        description="ID of the message to add metadata to"
    )
    email_stage: str = Field(
        description="Stage of the email thread from the last previous inbound message"
    )
    email_tags: List[Literal[
        "review",
        "notify",
        "question",
        "unknown"
    ]] = Field(
        description="List of tags to categorize the email thread from the last previous inbound message"
    )
    email_negotiation_summary: str = Field(
        description="Summary of the negotiation process from the last previous inbound message"
    )
    email_follow_up_needed: bool = Field( 
        description="Whether a follow-up is required (True/False)"
    )
    email_follow_up_date: str = Field(
        default="",
        description="Date for follow-up, if applicable (format: YYYY-MM-DD)"
    )

class MetadataResponse(BaseModel):
    """Model for processed email response metadata"""
    message_metadata: MessageMetadata = Field(
        description="Metadata for the message"
    )
    deliverables: Optional[List[Deliverable]] = Field(
        description="List of deliverables for the campaign if applicable"
    )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "message_metadata": self.message_metadata.model_dump(),
            "deliverables": [deliverable.model_dump() for deliverable in self.deliverables] if self.deliverables else None
        }
    
    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)
    
    model_config = ConfigDict(extra="forbid")
