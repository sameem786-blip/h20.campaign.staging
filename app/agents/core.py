"""
AI Agent Factory Module

This module provides factory functions for creating specialized AI agents
used in the Kiko email processing pipeline. Each agent has a specific role
in analyzing emails, planning responses, and executing actions.

Agent Types:
- Metadata Agent: Extracts structured data from emails
- Planning Agent: Creates response strategies for inbound emails
- Execution Agent: Implements response plans using available tools
- Action Agent: Handles specific email actions
- Analytics Agents: Provide campaign and audience insights
"""

from agents import Agent, ModelSettings
from app.tracing import langfuse
from app.models.metadata import MetadataResponse
from app.models.planning import PlanningResponse
from app.models.execution import ExecutionResponse
from app.models.action import ActionResponse
from app.models.audience_analysis import AudienceAnalysisResponse
from app.models.cpm_analysis import CPMAnalysisResponse
from app.agents.tools import (
    get_campaign_conversation_stages,
    get_campaign_details,
    find_rates_in_email,
    parse_pricing_from_email,
    get_creator_engagement_metrics_MOCK,
    assess_creator_campaign_fit_MOCK,
    generate_email_draft,
    verify_draft_quality,
    share_campaign_brief_link,
    get_email_thread_by_id,
    get_creator_details_by_id,
)
from app.config import settings
from app.constants import (
    AgentNames,
    PromptNames,
    DefaultValues
)

def create_metadata_agent() -> Agent:
    """
    Create an agent specialized in extracting metadata from email conversations.
    
    This agent analyzes email content to extract structured information such as:
    - Email sender and recipient details
    - Conversation stage and intent
    - Key topics and action items
    
    Returns:
        Agent: Configured metadata extraction agent
    """
    metadata_prompt = langfuse.get_prompt(PromptNames.EMAIL_METADATA)
    metadata_instructions = metadata_prompt.prompt
    
    return Agent(
        name=AgentNames.METADATA,
        instructions=metadata_instructions,
        output_type=MetadataResponse,
        tools=[get_campaign_conversation_stages],
        model=settings.metadata_model
    )

def create_planning_agent() -> Agent:
    """
    Create an agent specialized in planning email responses.
    
    This agent analyzes inbound emails and creates strategic response plans
    including:
    - Response tone and approach
    - Key points to address
    - Negotiation strategy (if applicable)
    - Follow-up requirements
    
    Returns:
        Agent: Configured email planning agent
    """
    planning_prompt = langfuse.get_prompt(PromptNames.EMAIL_PLANNER)
    planning_instructions = planning_prompt.prompt
    
    return Agent(
        name=AgentNames.PLANNING,
        instructions=planning_instructions,
        output_type=PlanningResponse,
        model=settings.planning_model
    )

def create_execution_agent() -> Agent:
    execution_prompt = langfuse.get_prompt("email_execution")
    execution_instructions = execution_prompt.prompt
    
    return Agent(
        name="Email Execution Agent",
        instructions=execution_instructions,
        model=settings.execution_model,
        model_settings=ModelSettings(
            temperature=0.5,
            tool_choice="required",
        ),
        tools=[
            get_campaign_details,
            find_rates,
            extract_rates,
            find_engagement,
            profile_assessment,
            draft_writing,
            verify_draft,
            share_brief_link
        ],
        output_type=ExecutionResponse,
    )
    
def create_action_agent() -> Agent:
    action_prompt = langfuse.get_prompt("action_agent")
    action_instructions = action_prompt.prompt
    
    return Agent(
        name="Email Action Agent",
        instructions=action_instructions,
        model=settings.action_model,
        model_settings=ModelSettings(
            temperature=0.5,
            tool_choice="required",
        ),
        tools=[
            get_campaign_details,
            get_creator_details,
            get_email_thread,
            draft_writing
        ],
        output_type=ActionResponse,
    )
    
def create_audience_analysis_agent() -> Agent:
    audience_analysis_prompt = langfuse.get_prompt("Audience_Sketch")
    audience_analysis_instructions = audience_analysis_prompt.prompt
    
    return Agent(
        name="Audience Analysis Agent",
        instructions=audience_analysis_instructions,
        model=settings.audience_analysis_model,
        output_type=AudienceAnalysisResponse,
    )
    
def create_cpm_analysis_agent() -> Agent:
    cpm_analysis_prompt = langfuse.get_prompt("CPM_Dashbaord")
    cpm_analysis_instructions = cpm_analysis_prompt.prompt
    
    return Agent(
        name="CPM Analysis Agent",
        instructions=cpm_analysis_instructions,
        model=settings.cpm_analysis_model,
        output_type=CPMAnalysisResponse,
    )