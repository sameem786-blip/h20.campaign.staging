"""
Kiko Email Processing Service

A FastAPI application that processes influencer marketing emails using AI agents.
This service handles email analysis, response planning, execution, and campaign analytics
through a multi-agent AI architecture.

Main endpoints:
- POST /process-email: Analyzes and responds to email conversations
- POST /action: Handles specific email actions  
- POST /audience-analysis: Analyzes campaign audience demographics
- POST /cpm-analysis: Calculates creator cost-per-mille rankings

The application uses OpenAI models, Supabase for data persistence, and Langfuse
for observability and prompt management.
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from agents import Runner, trace
import json
import logging
from typing import Dict, Any
from app.models.payload import ProcessEmailPayload, ActionPayload
from app.models.cpm_analysis import CPMAnalysisResponse
from app.agents.core import (
    create_metadata_agent,
    create_planning_agent,
    create_execution_agent,
    create_action_agent,
    create_audience_analysis_agent,
    create_cpm_analysis_agent,
)
from app.db.persistence import persist_agent_run
from app.db.queries import get_campaign_creators_details, get_campaign_creators_ranked_by_cpm
from app.tracing import tracer
from app.config import settings
from app.constants import (
    MessageDirection,
    SpanNames,
    ErrorMessages,
    DefaultValues
)
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Health Check", tags=["health"])
def read_root() -> Dict[str, str]:
    """Health check endpoint that returns service status."""
    return {"message": "This is the email processing service", "status": "healthy"}

@app.post(
    "/process-email",
    summary="Process Email Conversation", 
    description="Analyzes email thread and generates AI-powered response plan and execution",
    response_description="Agent run results with metadata, planning, and execution outputs",
    tags=["email-processing"]
)
async def process_email_endpoint(payload: ProcessEmailPayload) -> Dict[str, Any]:
    """
    Process an email conversation through the AI agent pipeline.
    
    For inbound emails, creates a response plan and executes it.
    For outbound emails, only extracts metadata.
    
    Args:
        payload: Email conversation data including messages and metadata
        
    Returns:
        Dictionary containing agent run information and results
        
    Raises:
        HTTPException: If agent processing fails
    """
    with tracer.start_as_current_span(SpanNames.EMAIL_PROCESSING) as span:
        conversation_json = payload.conversation_to_json_str()
        span.set_attribute("input.value", conversation_json)
        
        try:
            with trace(SpanNames.AGENT_WORKFLOW):
                # Step 1: Extract metadata from email
                metadata_agent = create_metadata_agent()
                metadata_result = await Runner.run(metadata_agent, conversation_json)
                logger.info("Metadata extraction completed successfully")

                planning_result = None
                execution_result = None
                
                # Step 2: For inbound emails, create response plan and execute
                if payload.conversation_last_message_direction == MessageDirection.INBOUND:
                    logger.info("Processing inbound email - creating response plan")
                    
                    planning_agent = create_planning_agent()
                    planning_result = await Runner.run(planning_agent, conversation_json)
                    response_plan = planning_result.final_output.plan
                    logger.info("Response plan created successfully")

                    # Step 3: Execute the response plan
                    execution_agent = create_execution_agent()
                    execution_input = f"""
                        I need you to execute the following plan for responding to this email thread:
                        {response_plan}
                        Email Thread:
                        {conversation_json}
                        Please follow the plan step by step and generate an appropriate response.
                    """
                    execution_result = await Runner.run(
                        execution_agent, 
                        execution_input, 
                        max_turns=DefaultValues.MAX_AGENT_TURNS
                    )
                    logger.info("Response execution completed successfully")
                else:
                    logger.info("Processing outbound email - metadata only")
        
        except Exception as e:
            logger.error(f"Agent processing failed: {e}")
            raise HTTPException(status_code=500, detail=ErrorMessages.METADATA_PROCESSING_FAILED)

        # Persist agent run results to database
        agent_run = persist_agent_run(
            conversation_json,
            message_id=payload.conversation.last_message_id,
            metadata_agent_result=metadata_result,
            planning_agent_result=planning_result,
            execution_agent_result=execution_result,
            batch_name=payload.batch_name,
            env=payload.env,
        )
        
        combined_output = {
            "metadata": metadata_result.final_output.to_json_str() if metadata_result and metadata_result.final_output else None,
            "planning": planning_result.final_output.to_json_str() if planning_result and planning_result.final_output else None,
            "execution": execution_result.final_output.to_json_str() if execution_result and execution_result.final_output else None,
        }
        
        span.set_attribute("output.value", json.dumps(combined_output))

    return {
        "agent_run": agent_run,
    }
    
@app.post(
    "/action",
    summary="Process Email Action",
    description="Handles specific email-related actions through AI agent processing",
    response_description="Action processing results with agent run information",
    tags=["email-processing"]
)
async def action_endpoint(payload: ActionPayload) -> Dict[str, Any]:
    """
    Process a specific email action through the action agent.
    
    Args:
        payload: Action request data containing action details
        
    Returns:
        Dictionary containing agent run information and action results
        
    Raises:
        HTTPException: If action processing fails
    """
    with tracer.start_as_current_span(SpanNames.ACTION_WORKFLOW) as span:
        span.set_attribute("langfuse.environment", settings.langfuse_environment)
        action_data = payload.to_json_str()
        span.set_attribute("input.value", action_data)
        
        try:
            logger.info("Processing email action request")
            action_agent = create_action_agent()
            action_result = await Runner.run(
                action_agent, 
                action_data, 
                max_turns=DefaultValues.MAX_AGENT_TURNS
            )
            logger.info("Action processing completed successfully")
            
            message_id = action_result.final_output.last_message_id
            
            # Persist action results
            agent_run = persist_agent_run(
                action_data,
                message_id=message_id,
                action_agent_result=action_result,
            )
            
            span.set_attribute("output.value", action_result.final_output.to_json_str())
        
        except Exception as e:
            logger.error(f"Action processing failed: {e}")
            raise HTTPException(status_code=500, detail=ErrorMessages.ACTION_PROCESSING_FAILED)
    
    return {
        "agent_run": agent_run,
    }
    
@app.post(
    "/audience-analysis",
    summary="Analyze Campaign Audience",
    description="Analyzes campaign creator demographics and audience characteristics",
    response_description="Detailed audience analysis with demographics and insights",
    tags=["analytics"]
)
async def audience_analysis_endpoint(campaign_id: int) -> JSONResponse:
    """
    Analyze the audience characteristics for a campaign's creators.
    
    Args:
        campaign_id: ID of the campaign to analyze
        
    Returns:
        JSONResponse containing audience analysis results
        
    Raises:
        HTTPException: If audience analysis fails
    """
    with tracer.start_as_current_span(SpanNames.AUDIENCE_ANALYSIS) as span:
        span.set_attribute("langfuse.environment", settings.langfuse_environment)
        
        try:
            logger.info(f"Starting audience analysis for campaign {campaign_id}")
            creator_details = await get_campaign_creators_details(campaign_id)
            span.set_attribute("input.value", creator_details)
            
            audience_analysis_agent = create_audience_analysis_agent()
            audience_analysis_result = await Runner.run(
                audience_analysis_agent, 
                creator_details, 
                max_turns=DefaultValues.MAX_AGENT_TURNS
            )
            logger.info("Audience analysis completed successfully")
            
            span.set_attribute("output.value", audience_analysis_result.final_output.to_json_str())
        
        except Exception as e:
            logger.error(f"Audience analysis failed for campaign {campaign_id}: {e}")
            raise HTTPException(status_code=500, detail="Audience analysis failed")
    
    return JSONResponse(audience_analysis_result.final_output.to_dict())
    
@app.post(
    "/cpm-analysis",
    summary="Analyze Campaign CPM",
    description="Calculates and ranks creators by cost-per-mille efficiency",
    response_description="CPM analysis with creator rankings and key insights",
    tags=["analytics"]
)
async def cpm_analysis_endpoint(campaign_id: int) -> JSONResponse:
    """
    Analyze cost-per-mille efficiency for a campaign's creators.
    
    Args:
        campaign_id: ID of the campaign to analyze
        
    Returns:
        JSONResponse containing CPM analysis with creator rankings
        
    Raises:
        HTTPException: If CPM analysis fails
    """
    with tracer.start_as_current_span(SpanNames.CPM_ANALYSIS) as span:
        span.set_attribute("langfuse.environment", settings.langfuse_environment)
        span.set_attribute("input.value", campaign_id)
        
        try:
            logger.info(f"Starting CPM analysis for campaign {campaign_id}")
            creator_ranking = await get_campaign_creators_ranked_by_cpm(campaign_id)
            
            key_takeaways = CPMAnalysisResponse.generate_key_takeaways(creator_ranking)
            
            cpm_analysis_response = CPMAnalysisResponse(
                key_takeaways=key_takeaways,
                table=creator_ranking
            )
            logger.info("CPM analysis completed successfully")
            
            span.set_attribute("output.value", cpm_analysis_response.to_json_str())
        
        except Exception as e:
            logger.error(f"CPM analysis failed for campaign {campaign_id}: {e}")
            raise HTTPException(status_code=500, detail="CPM analysis failed")
    
    return JSONResponse(cpm_analysis_response.to_dict())