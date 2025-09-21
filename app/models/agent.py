from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.models.metadata import MetadataResponse
from app.models.planning import PlanningResponse
from app.models.execution import ExecutionResponse
from app.models.action import ActionResponse

class AgentToolCall(BaseModel):
    call_id: str
    tool_name: str
    arguments: Dict[str, Any]
    output: Dict[str, Any]
    execution_order: int

class AgentRun(BaseModel):
    message_id: int
    input: str
    batch_name: Optional[str] = None
    metadata_agent_output: Optional[MetadataResponse] = None
    planning_agent_output: Optional[PlanningResponse] = None
    execution_agent_output: Optional[ExecutionResponse] = None
    action_agent_output: Optional[ActionResponse] = None
    suggested_email_body: Optional[str] = None
    trace_id: Optional[str]
    processing_time: Optional[float]
    tool_calls: Optional[List[AgentToolCall]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **self.model_dump(exclude_none=True, exclude={"tool_calls"}),
            "metadata_agent_output": self.metadata_agent_output.to_dict() if self.metadata_agent_output else None,
            "planning_agent_output": self.planning_agent_output.model_dump() if self.planning_agent_output else None,
            "execution_agent_output": self.execution_agent_output.model_dump() if self.execution_agent_output else None,
            "action_agent_output": self.action_agent_output.model_dump() if self.action_agent_output else None,
        }
    
    def to_json_str(self) -> str:
        import json
        return json.dumps(self.model_dump(), indent=2, default=str)
