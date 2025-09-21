from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Literal, Optional

class MicroSegment(BaseModel):
    segment: str = Field(description="Name of the micro-segment")
    views_pool_share_percent: float = Field(description="Percentage share of views this segment holds")
    core_interests: List[str] = Field(description="List of core interests for this micro-segment")
    creator_ids: List[int] = Field(description="List of creator IDs associated with this micro-segment")

class ViewPoolShareRank(BaseModel):
    segment: str = Field(description="Name of the segment")
    share_percent: float = Field(description="Percentage of the total view pool")

class NetworkBreakdown(BaseModel):
    instagram_only: int = Field(description="Number of creators who post only on Instagram")
    cross_post_bundles: int = Field(description="Number of creators who post cross-platform bundles")
    tiktok_only: int = Field(description="Number of creators who post only on TikTok")
    youtube_only: int = Field(description="Number of creators who post only on YouTube")

class NetworkCheatSheet(BaseModel):
    views_pool_share_ranked: List[ViewPoolShareRank] = Field(description="Ranked list of view pool share by segment")
    rate_bands: str = Field(description="Pricing tiers across the network")
    network_breakdown: NetworkBreakdown = Field(description="Breakdown of the creator platforms used")

class AudienceAnalysisResponse(BaseModel):
    title: str = Field(description="Title of the macro persona analysis")
    macro_persona: str = Field(description="High-level description of the audience persona")
    micro_segments: List[MicroSegment] = Field(description="List of micro-segments with their traits")
    network_cheatsheet: NetworkCheatSheet = Field(description="Summary of network structure and pricing")

    def to_dict(self) -> dict:
        return self.model_dump()

    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)

    model_config = ConfigDict(extra="forbid")