# Kiko Architecture Documentation

## Overview

Kiko is an AI-powered email processing and campaign management system designed for influencer marketing platforms. It automates email workflows, analyzes campaigns, and manages creator relationships using a multi-agent AI architecture.

## System Architecture

### High-Level Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │◄──►│   AI Agents     │◄──►│   Database      │
│   (main.py)     │    │   (core.py)     │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Agent Tools   │    │   Data Models   │
│   (endpoints)   │    │   (tools.py)    │    │   (models/)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **API Framework**: FastAPI with async/await support
- **AI/ML**: OpenAI API integration (GPT-4, O3 models)
- **Agent Framework**: `openai-agents` and `pydantic-ai`
- **Database**: Supabase (PostgreSQL)
- **Observability**: Langfuse for tracing, OpenTelemetry
- **Data Validation**: Pydantic models with type safety

## Core Workflows

### 1. Email Processing Pipeline (`/process-email`)

```
Email Input → Metadata Agent → Planning Agent → Execution Agent → Response
     │              │               │                │              │
     ▼              ▼               ▼                ▼              ▼
Extract metadata  Create plan   Execute with    Generate      Store in DB
from email       for response   available tools  final draft   with tracing
```

**Agent Flow:**
1. **Metadata Agent**: Extracts structured data (sender, intent, stage)
2. **Planning Agent**: Creates response strategy (only for inbound emails)
3. **Execution Agent**: Implements plan using tools (rates, engagement, drafting)

### 2. Action Processing (`/action`)

```
Action Request → Action Agent → Tools Execution → Response Generation
       │             │              │                    │
       ▼             ▼              ▼                    ▼
Parse action    Determine       Execute specific      Generate
payload         required tools  database/API calls    response
```

### 3. Analytics Workflows

**Audience Analysis** (`/audience-analysis`):
- Retrieves campaign creator data
- Analyzes demographics and platform distribution
- Generates audience insights

**CPM Analysis** (`/cpm-analysis`):
- Calculates cost-per-mille for creators
- Ranks creators by efficiency
- Provides cost optimization insights

## Data Models

### Core Entities

```
Conversation
├── id: int
├── campaign_id: int
├── creator_id: int
├── messages: List[Message]
└── last_message_direction: str

Message
├── id: int
├── body: str
├── sender: str
├── direction: str (inbound/outbound)
├── sent_at: datetime
└── conversation_id: int
```

### Agent Response Models

- `MetadataResponse`: Structured email metadata
- `PlanningResponse`: Response strategy plan
- `ExecutionResponse`: Final email draft
- `ActionResponse`: Action execution results
- `AudienceAnalysisResponse`: Creator audience insights
- `CPMAnalysisResponse`: Cost analysis data

## Database Schema

### Key Tables

- **conversations**: Email thread containers
- **messages**: Individual email messages
- **creators_main_platforms**: Creator profile data
- **creators_platform**: Platform-specific metrics
- **deliverables**: Campaign deliverable tracking
- **agent_runs**: AI agent execution logs

## Agent Architecture

### Agent Types

1. **Metadata Agent**
   - Model: GPT-4o
   - Purpose: Extract structured data from emails
   - Tools: Campaign stage lookup

2. **Planning Agent**
   - Model: O3
   - Purpose: Create response strategies
   - Output: Detailed response plan

3. **Execution Agent**
   - Model: GPT-4.1
   - Purpose: Implement response plans
   - Tools: Rate extraction, engagement analysis, drafting

4. **Action Agent**
   - Model: GPT-4o
   - Purpose: Handle specific email actions
   - Tools: Campaign details, creator info, drafting

5. **Analytics Agents**
   - Models: O3
   - Purpose: Generate campaign insights
   - Tools: Database queries, statistical analysis

### Tool System

```
Agent Tools (tools.py)
├── Database Operations
│   ├── get_email_thread()
│   ├── get_creator_details()
│   └── get_campaign_conversation_stages()
├── AI-Powered Analysis
│   ├── extract_pricing_from_email()
│   ├── get_creator_engagement_metrics() [MOCK]
│   └── assess_creator_campaign_fit() [MOCK]
└── Content Generation
    ├── generate_email_draft()
    ├── verify_draft()
    └── share_brief_link()
```

## Integration Points

### External Services

- **OpenAI API**: AI model inference
- **Supabase**: Database and authentication
- **Langfuse**: Prompt management and tracing
- **OpenTelemetry**: Distributed tracing

### Configuration Management

```python
Settings (config.py)
├── AI Model Configuration
├── Database Credentials
├── API Keys (OpenAI, Langfuse)
└── Environment-specific Settings
```

## Observability

### Tracing Strategy

- **Langfuse**: Prompt versioning, agent performance
- **OpenTelemetry**: Distributed tracing across services
- **Logfire**: Structured logging and monitoring

### Span Hierarchy

```
Email-Processing-Workflow
└── Agent Workflow
    ├── Metadata Agent Execution
    ├── Planning Agent Execution (if inbound)
    └── Execution Agent Execution
```

## Development Setup

1. **Environment Setup**:
   ```bash
   python -m venv venv
   source ./venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configuration**:
   - Copy `.env.example` to `.env`
   - Configure API keys and database credentials

3. **Running the Application**:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Testing**:
   ```bash
   curl -X POST http://localhost:8000/process-email \
     -H "Content-Type: application/json" \
     -d @input.json
   ```

## Security Considerations

- API keys managed through environment variables
- Database access through authenticated Supabase client
- CORS middleware configured for cross-origin requests
- Input validation through Pydantic models

## Performance Characteristics

- **Async Operations**: All database and AI calls are asynchronous
- **Concurrent Agent Execution**: Multiple agents can run in parallel
- **Connection Pooling**: Supabase handles database connection management
- **Caching**: Langfuse provides prompt caching

## Future Enhancements

1. **Real Social Media Integration**: Replace mock engagement tools
2. **Advanced Analytics**: More sophisticated campaign insights
3. **Multi-Language Support**: International campaign management
4. **Real-time Notifications**: WebSocket-based live updates
5. **A/B Testing**: Email response optimization