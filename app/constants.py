"""
Kiko Application Constants

This module contains all constants, enums, and magic strings used throughout
the Kiko email processing application. Centralizing these values makes the
codebase more maintainable and easier for LLMs to understand.
"""

from enum import Enum


class MessageDirection(str, Enum):
    """Direction of email message flow."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class AgentModel(str, Enum):
    """Available AI models for different agent types."""
    GPT_4O = "gpt-4o"
    GPT_41 = "gpt-4.1"
    O3 = "o3"


class AgentNames:
    """Standard names for AI agents in the system."""
    METADATA = "Metadata Agent"
    PLANNING = "Email Planning Agent"
    EXECUTION = "Email Execution Agent"
    ACTION = "Email Action Agent"
    AUDIENCE_ANALYSIS = "Audience Analysis Agent"
    CPM_ANALYSIS = "CPM Analysis Agent"


class PromptNames:
    """Langfuse prompt names for different agent types."""
    EMAIL_METADATA = "email_metadata"
    EMAIL_PLANNER = "email_planner"
    EMAIL_EXECUTION = "email_execution"
    ACTION_AGENT = "action_agent"
    AUDIENCE_SKETCH = "Audience_Sketch"
    CPM_DASHBOARD = "CPM_Dashbaord"  # Note: keeping original typo for compatibility
    
    # Tool prompts
    EXTRACT_RATES_MOCK = "ExtractRates_Mock_Response"
    FIND_ENGAGEMENT_MOCK = "FindEngagement_Mock_Response"
    PROFILE_ASSESSMENT_MOCK = "ProfileAssessment_Mock_Response"


class DatabaseTables:
    """Supabase database table names."""
    CONVERSATIONS = "conversations"
    MESSAGES = "messages"
    CREATORS_MAIN_PLATFORMS = "creators_main_platforms"
    CREATORS_PLATFORM = "creators_platform"
    DELIVERABLES = "deliverables"
    AGENT_RUNS = "agent_runs"


class ServiceNames:
    """OpenTelemetry service names for tracing."""
    EMAIL_AI_AGENT = "email_ai_agent"


class SpanNames:
    """OpenTelemetry span names for different workflows."""
    EMAIL_PROCESSING = "Email-Processing-Workflow"
    ACTION_WORKFLOW = "Action-Workflow"
    AUDIENCE_ANALYSIS = "Audience-Analysis-Workflow"
    CPM_ANALYSIS = "CPM-Analysis-Workflow"
    AGENT_WORKFLOW = "Agent Workflow"


class DefaultValues:
    """Default values used throughout the application."""
    MOCK_LEAD_ID = "LEAD-2023-001"
    MAX_AGENT_TURNS = 20
    EXECUTION_AGENT_TEMPERATURE = 0.5


class HttpHeaders:
    """HTTP header constants."""
    CONTENT_TYPE = "Content-Type"
    APPLICATION_JSON = "application/json"


class ErrorMessages:
    """Standard error messages."""
    CONVERSATION_NOT_FOUND = "Conversation not found"
    CREATOR_NOT_FOUND = "Creator not found"
    METADATA_PROCESSING_FAILED = "Metadata processing failed"
    PLANNING_FAILED = "Email planning failed"
    EXECUTION_FAILED = "Email execution failed"
    ACTION_PROCESSING_FAILED = "Action processing failed"
    DATABASE_ERROR = "Database operation failed"