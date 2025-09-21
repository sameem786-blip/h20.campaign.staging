"""
Observability and Tracing Configuration Module

This module sets up comprehensive observability for the Kiko application using:
- Langfuse: AI agent tracing and prompt management
- OpenTelemetry: Distributed tracing across services
- Logfire: Structured logging and monitoring

The configuration enables end-to-end visibility into AI agent workflows,
database operations, and API request/response cycles.
"""

import os
import base64
import logfire
from langfuse import Langfuse
from app.config import settings
from app.constants import ServiceNames
from opentelemetry import trace as otel_trace

auth_token = f"{settings.langfuse_public_key}:{settings.langfuse_secret_key}"
LANGFUSE_AUTH = base64.b64encode(auth_token.encode()).decode()

os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = settings.langfuse_host + "/api/public/otel"
os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {LANGFUSE_AUTH}"

langfuse = Langfuse(
    public_key=settings.langfuse_public_key,
    secret_key=settings.langfuse_secret_key,
    host=settings.langfuse_host,
    environment=settings.langfuse_environment,
)

# Configure Logfire for structured logging
logfire.configure(
    service_name=ServiceNames.EMAIL_AI_AGENT,
    send_to_logfire=False,
    environment=settings.langfuse_environment,
)
logfire.instrument_openai_agents()

# Create OpenTelemetry tracer for distributed tracing
tracer = otel_trace.get_tracer(__name__)