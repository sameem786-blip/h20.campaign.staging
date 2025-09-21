from typing import List, Dict, Any, Optional
from app.db.supabase import supabase
import json
from app.models.cpm_analysis import CPMTableEntry

async def get_campaign_creators_details(campaign_id: int, limit: int = None) -> str:
    """
    Fetch detailed creator information for a specific campaign.
    
    Args:
        campaign_id: The parent campaign ID to fetch creators for
        limit: Optional limit on number of creators to return (default: all)
        
    Returns:
        JSON string with structured creator data array
    """
    try:
        # First, get all smartlead campaign IDs associated with this parent campaign
        smartlead_campaigns_query = supabase.table("smartlead_campaigns").select("id").eq("parent_campaign_id", campaign_id).execute()
        
        if not smartlead_campaigns_query.data:
            return json.dumps({"error": f"No smartlead campaigns found for campaign {campaign_id}", "creators": []})
        
        # Extract smartlead campaign IDs
        smartlead_campaign_ids = [sc['id'] for sc in smartlead_campaigns_query.data]
        
        # Then, get all creator IDs associated with these smartlead campaigns
        conversations_query = supabase.table("conversations").select("creator_id").in_("smartlead_campaign_id", smartlead_campaign_ids).execute()
        
        if not conversations_query.data:
            return json.dumps({"error": f"No creators found for campaign {campaign_id}", "creators": []})
        
        # Extract unique creator IDs
        creator_ids = list(set([conv['creator_id'] for conv in conversations_query.data if conv['creator_id']]))
        
        if not creator_ids:
            return json.dumps({"error": f"No valid creator IDs found for campaign {campaign_id}", "creators": []})
        
        # Apply limit if specified
        if limit and limit > 0:
            creator_ids = creator_ids[:limit]
        
        # Get main creator data with platform information
        creators_query = supabase.table("creators").select("""
            *,
            creators_platform (
                network,
                followers,
                bio,
                video_analysis,
                metadata
            )
        """).in_("id", creator_ids).execute()

        if not creators_query.data:
            return json.dumps({"error": f"Creator details not found for campaign {campaign_id}", "creators": []})

        # Get deliverables data for pricing information
        deliverables_query = supabase.table("deliverables").select("*").in_("creator_id", creator_ids).execute()
        
        # Create deliverables lookup by creator_id
        deliverables_by_creator = {}
        for deliverable in deliverables_query.data or []:
            creator_id = deliverable['creator_id']
            if creator_id not in deliverables_by_creator:
                deliverables_by_creator[creator_id] = []
            deliverables_by_creator[creator_id].append(deliverable)

        # Process creators data
        processed_creators = []
        for creator in creators_query.data:
            creator_id = creator['id']
            platform_data = creator.get('creators_platform', [{}])[0] if creator.get('creators_platform') else {}
            
            # Determine pricing information
            has_formal_rates = creator_id in deliverables_by_creator
            pricing_type = "formal_rates" if has_formal_rates else "message_rates"
            
            # Calculate rate range for formal rates
            rate_range = None
            if has_formal_rates:
                prices = [float(d['price']) for d in deliverables_by_creator[creator_id] if d.get('price')]
                if prices:
                    min_price = min(prices)
                    max_price = max(prices)
                    currency = deliverables_by_creator[creator_id][0].get('currency', 'USD')
                    rate_range = f"${int(min_price)}-{int(max_price)} {currency}"

            # Process video analysis data
            video_analysis = platform_data.get('video_analysis', {})
            processed_video_analysis = _process_video_analysis(video_analysis, platform_data.get('network'))

            # Structure the creator data
            creator_data = {
                "core_information": {
                    "id": creator['id'],
                    "username": creator['username'],
                    "core_platform": creator['core_platform'],
                    "primary_email": creator['primary_email'],
                    "created_at": creator['created_at'],
                    "evaluation_score": creator['evaluation_score'],
                    "evaluation_reasoning": creator['evaluation_reasoning'],
                    "brand": creator['brand'],
                    "source": creator['source'],
                    "screenshot_path": creator['screenshot_path']
                },
                "platform_data": {
                    "network": platform_data.get('network'),
                    "followers": platform_data.get('followers'),
                    "bio": platform_data.get('bio'),
                    "video_analysis": processed_video_analysis
                },
                "business_data": {
                    "pricing_type": pricing_type,
                    "has_formal_deliverable_rates": has_formal_rates
                }
            }
            
            # Add rate range if available
            if rate_range:
                creator_data["business_data"]["rate_range"] = rate_range
                
            processed_creators.append(creator_data)

        # Return only the creators array
        return json.dumps(processed_creators, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Database error: {str(e)}", "creators": []})

def _process_video_analysis(video_analysis: Dict[str, Any], network: Optional[str]) -> Dict[str, Any]:
    """Process and standardize video analysis data based on platform."""
    if not video_analysis:
        return {}
    
    processed = {"platform": network}
    
    # Handle different video analysis formats
    if network == "youtube":
        # YouTube format from the examples
        if "views" in video_analysis:
            processed["views"] = video_analysis["views"]
        if "subscribers" in video_analysis:
            processed["subscribers"] = video_analysis["subscribers"]
        if "estimated_revenue_usd" in video_analysis:
            processed["estimated_revenue_usd"] = video_analysis["estimated_revenue_usd"]
        if "report_period" in video_analysis:
            processed["report_period"] = video_analysis["report_period"]
            
        # Handle detailed video analysis
        if "last_15_videos_summary" in video_analysis:
            processed["sample_size_videos"] = 15
            processed["last_15_videos_summary"] = video_analysis["last_15_videos_summary"]
            
        if "last_15_videos_distribution_relative_to_median" in video_analysis:
            # Convert to the performance_distribution format
            distribution = video_analysis["last_15_videos_distribution_relative_to_median"]
            performance_distribution = []
            for item in distribution:
                if item.get("count", 0) > 0:  # Only include non-zero counts
                    performance_distribution.append({
                        "range": item["range"],
                        "count": item["count"],
                        "percentage": item["percentage"]
                    })
            processed["performance_distribution"] = performance_distribution
            
        if "Data Summary" in video_analysis:
            processed["data_summary"] = video_analysis["Data Summary"]
            
    elif network == "instagram":
        # Instagram format
        if "last_15_videos_summary" in video_analysis:
            processed["sample_size_videos"] = video_analysis.get("sample_size_videos", 24)
            processed["last_15_videos_summary"] = video_analysis["last_15_videos_summary"]
            
        if "last_15_videos_distribution_relative_to_median" in video_analysis:
            # Convert to performance_distribution format for Instagram
            distribution = video_analysis["last_15_videos_distribution_relative_to_median"]
            performance_distribution = []
            for item in distribution:
                if item.get("count", 0) > 0:
                    performance_distribution.append({
                        "range": item["range"],
                        "count": item["count"],
                        "percentage": item["percentage"]
                    })
            processed["performance_distribution"] = performance_distribution
    
    return processed


async def get_campaign_creators_ranked_by_cpm(campaign_id: int) -> List[CPMTableEntry]:
    """
    Fetch rankings of creators for a specific campaign based on CPM.
    
    Args:
        campaign_id: The parent campaign ID to fetch rankings for
        
    Returns:
        List of CPMTableEntry objects with creator rankings
    """
    try:
        # First, get all smartlead campaign IDs associated with this parent campaign
        smartlead_campaigns_query = supabase.table("smartlead_campaigns").select("id").eq("parent_campaign_id", campaign_id).execute()
        
        if not smartlead_campaigns_query.data:
            return []
        
        # Extract smartlead campaign IDs
        smartlead_campaign_ids = [sc['id'] for sc in smartlead_campaigns_query.data]
        
        # Get all creator IDs associated with these smartlead campaigns
        conversations_query = supabase.table("conversations").select("creator_id").in_("smartlead_campaign_id", smartlead_campaign_ids).execute()
        
        if not conversations_query.data:
            return []
        
        # Extract unique creator IDs
        creator_ids = list(set([conv['creator_id'] for conv in conversations_query.data if conv['creator_id']]))
        
        if not creator_ids:
            return []
        
        # Get main creator data with platform information
        creators_query = supabase.table("creators").select("""
            *,
            creators_platform (
                network,
                followers,
                video_analysis
            )
        """).in_("id", creator_ids).execute()

        if not creators_query.data:
            return []

        # Get deliverables data for pricing information
        deliverables_query = supabase.table("deliverables").select("*").in_("creator_id", creator_ids).execute()
        
        # Create deliverables lookup by creator_id
        deliverables_by_creator = {}
        for deliverable in deliverables_query.data or []:
            creator_id = deliverable['creator_id']
            if creator_id not in deliverables_by_creator:
                deliverables_by_creator[creator_id] = []
            deliverables_by_creator[creator_id].append(deliverable)

        # Process creators and calculate CPM data
        cpm_entries = []
        
        for creator in creators_query.data:
            creator_id = creator['id']
            username = creator['username']
            platform_data = creator.get('creators_platform', [{}])[0] if creator.get('creators_platform') else {}
            
            # Get video analysis data for views
            video_analysis = platform_data.get('video_analysis', {})
            mean_views = _extract_mean_views(video_analysis, platform_data.get('network'))
            
            # Skip creators without view data
            if mean_views is None or mean_views <= 0:
                continue
            
            # Get pricing data
            rate_usd = _calculate_creator_rate_usd(creator_id, deliverables_by_creator)
            
            # Skip creators without pricing data
            if rate_usd is None or rate_usd <= 0:
                continue
            
            # Calculate CPM (Cost Per Mille = Cost per 1000 views)
            cpm_usd = (rate_usd / mean_views) * 1000
            
            # Calculate brand fit score (based on evaluation_score, 1-5 scale)
            brand_fit = creator.get('evaluation_score', 3) or 3
            
            cpm_entries.append({
                'creator_id': creator_id,
                'handle': username,
                'brand_fit': brand_fit,
                'rate_usd': rate_usd,
                'mean_views': int(mean_views),
                'cpm_usd': cpm_usd
            })
        
        # Sort by CPM (ascending - lower CPM is better)
        cpm_entries.sort(key=lambda x: x['cpm_usd'])
        
        # Calculate outlier rates (percentage above typical CPM range)
        # First calculate median CPM for comparison
        if len(cpm_entries) > 0:
            cpm_values = [entry['cpm_usd'] for entry in cpm_entries]
            median_cpm = sorted(cpm_values)[len(cpm_values) // 2]
            
            # Define "typical" range as within 2x of median
            typical_upper_bound = median_cpm * 2
        else:
            typical_upper_bound = 0
        
        # Create final CPMTableEntry objects with rankings
        result = []
        for rank, entry in enumerate(cpm_entries, 1):
            # Calculate outlier rate percentage
            if typical_upper_bound > 0:
                outlier_rate_pct = max(0, ((entry['cpm_usd'] - typical_upper_bound) / typical_upper_bound) * 100)
            else:
                outlier_rate_pct = 0.0
            
            cpm_table_entry = CPMTableEntry(
                rank=rank,
                handle=entry['handle'],
                brand_fit=entry['brand_fit'],
                rate_usd=entry['rate_usd'],
                mean_views=entry['mean_views'],
                cpm_usd=entry['cpm_usd'],
                outlier_rate_pct=outlier_rate_pct
            )
            result.append(cpm_table_entry)
        
        return result

    except Exception as e:
        print(f"Error in get_campaign_creators_ranked_by_cpm: {str(e)}")
        return []


def _extract_mean_views(video_analysis: Dict[str, Any], network: Optional[str]) -> Optional[float]:
    """Extract mean views from video analysis data."""
    if not video_analysis:
        return None
    
    # Handle YouTube format
    if network == "youtube":
        if "views" in video_analysis and "current" in video_analysis["views"]:
            return float(video_analysis["views"]["current"])
    
    # Handle Instagram format
    elif network == "instagram":
        if "last_15_videos_summary" in video_analysis:
            summary = video_analysis["last_15_videos_summary"]
            if "mean_views" in summary:
                return float(summary["mean_views"])
            elif "median_views" in summary:
                # Fall back to median if mean not available
                return float(summary["median_views"])
    
    return None


def _calculate_creator_rate_usd(creator_id: int, deliverables_by_creator: Dict[int, List[Dict]]) -> Optional[float]:
    """Calculate average rate in USD for a creator."""
    if creator_id not in deliverables_by_creator:
        return None
    
    deliverables = deliverables_by_creator[creator_id]
    valid_prices = []
    
    for deliverable in deliverables:
        price = deliverable.get('price')
        currency = deliverable.get('currency', 'USD')
        
        if price is None:
            continue
        
        if currency is None:
            currency = 'USD'
        else:
            currency = currency.upper()
        
        try:
            price_float = float(price)
            
            # Convert to USD (simplified conversion rates)
            if currency == 'USD':
                usd_price = price_float
            elif currency == 'INR':
                usd_price = price_float / 83.0  # Approximate INR to USD
            elif currency == 'EUR':
                usd_price = price_float * 1.08  # Approximate EUR to USD
            elif currency == 'GBP':
                usd_price = price_float * 1.26  # Approximate GBP to USD
            else:
                # Default to treating as USD if currency not recognized
                usd_price = price_float
            
            valid_prices.append(usd_price)
        
        except (ValueError, TypeError):
            continue
    
    if not valid_prices:
        return None
    
    # Return average price
    return sum(valid_prices) / len(valid_prices)