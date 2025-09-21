"""
AI Agent Tools Module

This module provides tools that AI agents can use to interact with external systems,
databases, and services. Tools are decorated with @function_tool to make them
available to agents during execution.

Tool Categories:
- Database Operations: Query conversations, creators, campaigns
- Content Analysis: Extract rates, analyze engagement (MOCK)
- Content Generation: Draft emails, verify quality
- External Integrations: Share links, access campaign data
"""

import json
from typing import List
from agents import function_tool
from app.tracing import langfuse
from app.db.supabase import supabase
from app.config import settings
from app.constants import (
    DatabaseTables,
    PromptNames,
    DefaultValues,
    ErrorMessages
)
from openai import OpenAI

openai_client = OpenAI(api_key=settings.openai_api_key)

@function_tool
def get_email_thread_by_id(conversation_id: int) -> str:
    """
    Retrieves a complete email conversation thread by conversation ID.
    
    Fetches all messages in chronological order with full metadata including
    sender, timestamps, subjects, and follow-up information.
    
    Args:
        conversation_id: The unique ID of the conversation to retrieve
        
    Returns:
        JSON string containing conversation data or error message
    """
    conversation_query = supabase.table(DatabaseTables.CONVERSATIONS).select(
        "messages(id, body, sender, sent_at, subject, direction, opened_at, recipient, created_at, follow_up_date, follow_up_needed, external_message_id, negotiation_summary).order(sent_at)"
    ).eq("id", conversation_id).execute()
    
    if not conversation_query.data:
        return ErrorMessages.CONVERSATION_NOT_FOUND
    
    return json.dumps(conversation_query.data[0])

@function_tool
def get_creator_details_by_id(creator_id: int) -> str:
    """
    Retrieves comprehensive details of a creator by their unique ID.
    
    Fetches creator profile information including platform data, engagement
    metrics, and campaign history from the main platforms table.
    
    Args:
        creator_id: The unique ID of the creator to retrieve
        
    Returns:
        JSON string containing creator details or error message
    """
    creator_query = supabase.table(DatabaseTables.CREATORS_MAIN_PLATFORMS).select("*").eq("creator_id", creator_id).execute()

    if not creator_query.data:
        return ErrorMessages.CREATOR_NOT_FOUND
    
    return json.dumps(creator_query.data[0])

@function_tool
def get_campaign_conversation_stages(campaign_id: str) -> str:
    """
    Retrieves the conversation stages for a campaign.
    
    Args:
        campaign_id: The ID of the campaign
        
    Returns:
        A list of conversation stages for the campaign
    """
    # First get the campaign_type_id from the campaigns table
    campaign_query = supabase.table("campaigns").select("campaign_type_id").eq("id", campaign_id).execute()
    
    if not campaign_query.data or not campaign_query.data[0].get('campaign_type_id'):
        return "No conversation stages found for this campaign (no campaign type assigned)"
    
    campaign_type_id = campaign_query.data[0]['campaign_type_id']
    
    # Now get the conversation stages for this campaign type
    stages_query = supabase.table("conversation_stages").select("slug, details").eq("campaign_type_id", campaign_type_id).order("order").execute()
    
    if stages_query.data:
        return "\n\n".join([f"{stage['slug']}: {stage['details']}" for stage in stages_query.data])
    return "No conversation stages found for this campaign"

@function_tool
def get_campaign_details(campaign_id: str) -> str:
    """
    Retrieves information about which campaign this email is part of.
    
    Args:
        campaign_id: The ID of the campaign
        
    Returns:
        Details about the campaign associated with this email
    """
    # Get campaign details along with campaign type details
    query = supabase.table("campaigns").select("name, company_details, creative_brief, campaign_types(id, name, details)").eq("id", campaign_id).execute()
    
    if not query.data:
        return "Campaign not found"
    
    campaign_data = query.data[0]
    
    # Get conversation stages separately to ensure proper ordering
    stages_query = supabase.table("conversation_stages").select("slug, details").eq("campaign_type_id", campaign_data.get("campaign_types", {}).get("id")).order("order").execute()
    
    # Restructure the data to include campaign type details as 'blueprint' for backward compatibility
    result = {
        "name": campaign_data.get("name"),
        "company_details": campaign_data.get("company_details"),
        "details": campaign_data.get("campaign_types", {}).get("details") if campaign_data.get("campaign_types") else None,
        "creative_brief": campaign_data.get("creative_brief"),
        "conversation_stages": "\n\n".join([f"{stage['slug']}: {stage['details']}" for stage in stages_query.data]) if stages_query.data else None
    }
    
    return json.dumps(result)

@function_tool
def find_rates(creator_email: str, creator_name: str) -> str:
    """
    If there are known rates for this person, retrieve and add them to the context.
    
    Args:
        creator_email: Email address of the creator
        creator_name: Name of the creator
        
    Returns:
        Any existing rate information for this creator
    """
    lead_id = "LEAD-2023-001"
    
    prompt = langfuse.get_prompt("FindRates_Mock_Response")
    compiled_prompt = prompt.compile(LEAD_ID=lead_id)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def extract_rates(email_body: str) -> str:
    """
    When someone shares their rates, extract and store them in a database.
    
    Args:
        email_body: The text content of the email
        
    Returns:
        Extracted rate information
    """
    prompt = langfuse.get_prompt("ExtractRates_Mock_Response")
    compiled_prompt = prompt.compile(RATE_TEXT=email_body)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def find_engagement(creator_name: str, platforms: List[str]) -> str:
    """
    Provides engagement data on the creator (e.g., audience size, average views).
    
    Args:
        creator_name: Name of the creator
        platforms: List of platforms to check (e.g., Instagram, TikTok)
        
    Returns:
        Engagement data for the creator
    """
    lead_id = "LEAD-2023-001"
    
    prompt = langfuse.get_prompt("FindEngagement_Mock_Response")
    compiled_prompt = prompt.compile(LEAD_ID=lead_id)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def profile_assessment(creator_name: str, campaign_id: str) -> str:
    """
    Assesses how good of a fit this creator is for the brand's campaign or objectives.
    
    Args:
        creator_name: Name of the creator
        campaign_id: ID of the campaign
        
    Returns:
        Assessment of creator's fit for the campaign
    """
    lead_id = "LEAD-2023-001"
    
    prompt = langfuse.get_prompt("ProfileAssessment_Mock_Response")
    compiled_prompt = prompt.compile(LEAD_ID=lead_id)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def draft_writing(email_thread: str, campaign_id: str, fit_score: float) -> str:
    """
    Writes the first version of an email response based on the plan.
    
    Args:
        email_thread: The full email thread
        campaign_id: ID of the campaign
        fit_score: Score indicating how good a fit the creator is
        
    Returns:
        Draft of the email response
    """
    plan = f"- Respond to rate proposal\n- Explain budget constraints\n- Suggest alternative compensation\n- Request availability for call"
    
    prompt = langfuse.get_prompt("DraftWriting_Mock_Response")
    compiled_prompt = prompt.compile(PLAN=plan)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def verify_draft(subject: str, body: str, tone: str) -> str:
    """
    Reviews and finalizes the drafted email before sending.
    
    Args:
        subject: Subject line of the email
        body: Body text of the email
        tone: Intended tone of the email
        
    Returns:
        Verified and possibly revised email draft
    """
    context = f"Tone: {tone}\nKey points to cover: Rate negotiation, alternative compensation options"
    
    prompt = langfuse.get_prompt("VerifyDraft_Mock_Response")
    compiled_prompt = prompt.compile(DRAFT_EMAIL=body, Context=context)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content

@function_tool
def share_brief_link(campaign_id: str) -> str:
    """
    Returns a hyperlink to the campaign's creative brief.
    
    Args:
        campaign_id: ID of the campaign
        
    Returns:
        Hyperlink to the campaign's creative brief
    """
    prompt = langfuse.get_prompt("ShareCreativeBrief_Mock_Response")
    compiled_prompt = prompt.compile(CAMPAIGN_ID=campaign_id)
    
    response = openai_client.chat.completions.create(
        model=settings.tool_model,
        messages=[{"role": "user", "content": compiled_prompt}]
    )
    
    return response.choices[0].message.content
