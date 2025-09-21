from pydantic import BaseModel, Field, ConfigDict
from typing import List
import statistics

class CPMCheatSheet(BaseModel):
    low_cpm: float = Field(description="Lowest CPM value found in the analysis")
    high_cpm: float = Field(description="Highest CPM value found in the analysis")
    median_cpm: float = Field(description="Median CPM value")
    average_cpm: float = Field(description="Average CPM value")

class CPMPerformerEntry(BaseModel):
    creator: str = Field(description="Creator's social handle")
    cpm_usd: float = Field(description="Cost per mille (CPM) in USD")
    note: str = Field(description="Brief explanation of why this creator is in this category")

class CPMKeyTakeaways(BaseModel):
    cheatsheet: CPMCheatSheet = Field(description="Summary statistics of CPM values")
    top_performers: List[CPMPerformerEntry] = Field(description="Handles with best reach and value")
    solid_value: List[CPMPerformerEntry] = Field(description="Handles with good cost-benefit balance")
    caution_zone: List[CPMPerformerEntry] = Field(description="Handles with high CPM and low efficiency")

class CPMTableEntry(BaseModel):
    rank: int = Field(description="Ranking position")
    handle: str = Field(description="Creator's social handle")
    brand_fit: int = Field(description="Brand fit score (e.g., 1-5)")
    rate_usd: float = Field(description="Rate in USD")
    mean_views: int = Field(description="Mean views per post or campaign")
    cpm_usd: float = Field(description="Cost per mille (CPM) in USD")
    outlier_rate_pct: float = Field(description="Percentage rate above typical CPM range")

class CPMAnalysisResponse(BaseModel):
    key_takeaways: CPMKeyTakeaways = Field(description="Key insights based on CPM analysis")
    table: List[CPMTableEntry] = Field(description="Ranked list of creators based on CPM")

    def to_dict(self) -> dict:
        return self.model_dump()

    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)
    
    @staticmethod
    def generate_key_takeaways(creator_ranking: List[CPMTableEntry]) -> CPMKeyTakeaways:
        """
        Generate key takeaways from the creator ranking data.
        
        Args:
            creator_ranking: List of CPMTableEntry objects
            
        Returns:
            CPMKeyTakeaways object with analysis insights
        """
        if not creator_ranking:
            return CPMKeyTakeaways(
                cheatsheet=CPMCheatSheet(low_cpm=0, high_cpm=0, median_cpm=0, average_cpm=0),
                top_performers=[],
                solid_value=[],
                caution_zone=[]
            )
        
        # Calculate cheatsheet statistics
        cpm_values = [entry.cpm_usd for entry in creator_ranking]
        low_cpm = min(cpm_values)
        high_cpm = max(cpm_values)
        median_cpm = statistics.median(cpm_values)
        average_cpm = statistics.mean(cpm_values)
        
        cheatsheet = CPMCheatSheet(
            low_cpm=round(low_cpm, 2),
            high_cpm=round(high_cpm, 2),
            median_cpm=round(median_cpm, 2),
            average_cpm=round(average_cpm, 2)
        )
        
        # Categorize creators based on CPM performance
        # Top performers: CPM <= median and high views or good brand fit
        # Solid value: CPM around median with balanced metrics
        # Caution zone: CPM significantly above median or poor efficiency
        
        top_performers = []
        solid_value = []
        caution_zone = []
        
        # Define thresholds
        median_threshold = median_cpm
        high_threshold = median_cpm * 2  # 2x median is considered high
        very_high_threshold = median_cpm * 4  # 4x median is caution zone
        
        for entry in creator_ranking:
            creator_entry = CPMPerformerEntry(
                creator=entry.handle,
                cpm_usd=round(entry.cpm_usd, 2),
                note=""
            )
            
            # Categorize based on CPM and other metrics
            if entry.cpm_usd <= median_threshold:
                # Top performers: low CPM
                if entry.mean_views >= 100000:
                    creator_entry.note = "Top reach, best value"
                elif entry.brand_fit >= 3:
                    creator_entry.note = "Great fit, strong value"
                else:
                    creator_entry.note = "Engaged micro, low cost"
                
                if len(top_performers) < 3:  # Limit to top 3
                    top_performers.append(creator_entry)
                    
            elif entry.cpm_usd <= high_threshold:
                # Solid value: moderate CPM
                if entry.mean_views >= 50000:
                    creator_entry.note = "High views, solid cost"
                elif entry.brand_fit >= 3:
                    creator_entry.note = "Balanced cost and fit"
                else:
                    creator_entry.note = "Fair cost, decent reach"
                
                if len(solid_value) < 3:  # Limit to top 3
                    solid_value.append(creator_entry)
                    
            elif entry.cpm_usd >= very_high_threshold:
                # Caution zone: very high CPM
                if entry.mean_views < 20000:
                    creator_entry.note = "Costly, poor efficiency"
                elif entry.mean_views < 50000:
                    creator_entry.note = "High cost, low reach"
                else:
                    creator_entry.note = "Limited ROI despite fit"
                
                if len(caution_zone) < 3:  # Limit to top 3 worst
                    caution_zone.append(creator_entry)
        
        # If we don't have enough in each category, fill from remaining creators
        remaining_creators = [entry for entry in creator_ranking 
                            if entry.cpm_usd > median_threshold and entry.cpm_usd <= high_threshold]
        
        # Fill solid_value if needed
        for entry in remaining_creators:
            if len(solid_value) >= 3:
                break
            if not any(sv.creator == entry.handle for sv in solid_value):
                creator_entry = CPMPerformerEntry(
                    creator=entry.handle,
                    cpm_usd=round(entry.cpm_usd, 2),
                    note="Balanced cost and performance"
                )
                solid_value.append(creator_entry)
        
        # Fill caution_zone from highest CPM if needed
        high_cpm_creators = [entry for entry in creator_ranking 
                           if entry.cpm_usd > high_threshold]
        high_cpm_creators.sort(key=lambda x: x.cpm_usd, reverse=True)
        
        for entry in high_cpm_creators:
            if len(caution_zone) >= 3:
                break
            if not any(cz.creator == entry.handle for cz in caution_zone):
                creator_entry = CPMPerformerEntry(
                    creator=entry.handle,
                    cpm_usd=round(entry.cpm_usd, 2),
                    note="High CPM, review efficiency"
                )
                caution_zone.append(creator_entry)
        
        return CPMKeyTakeaways(
            cheatsheet=cheatsheet,
            top_performers=top_performers,
            solid_value=solid_value,
            caution_zone=caution_zone
        )
    
    model_config = ConfigDict(extra="forbid")
