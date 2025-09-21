"""
Application Configuration Module

This module manages all configuration settings for the Kiko application,
including API keys, model selections, and environment-specific settings.
Settings are loaded from environment variables and .env files using Pydantic.

Configuration Categories:
- Langfuse: Observability and prompt management
- Supabase: Database connection and authentication  
- OpenAI: AI model API access
- Model Selection: Agent-specific model configuration
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from app.constants import AgentModel


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class defines all configuration parameters needed for the application
    to run, including API credentials and model selections for different agents.
    """
    
    # Langfuse Configuration (Observability & Prompt Management)
    langfuse_public_key: str
    langfuse_secret_key: str  
    langfuse_host: str
    langfuse_environment: str
    
    # Supabase Configuration (Database)
    supabase_url: str
    supabase_key: str
    
    # OpenAI Configuration (AI Models)
    openai_api_key: str
    
    # Agent Model Configuration
    planning_model: str = AgentModel.O3
    execution_model: str = AgentModel.GPT_41
    tool_model: str = AgentModel.GPT_41
    metadata_model: str = AgentModel.GPT_4O
    action_model: str = AgentModel.GPT_4O
    audience_analysis_model: str = AgentModel.O3
    cpm_analysis_model: str = AgentModel.O3
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()