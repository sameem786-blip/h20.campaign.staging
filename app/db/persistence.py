import json
from typing import Dict, List, Optional
from agents import RunResult, RunItem
from app.models.agent import AgentRun, AgentToolCall
from app.models.metadata import MetadataResponse, MessageMetadata, Deliverable
from app.db.supabase import supabase

def save_agent_run_and_tool_calls(agent_run: AgentRun, env: str) -> AgentRun:
    schema = "public"
    if env == "labeling":
        schema = "labeling"
    
    # Convert the AgentRun to a dict for Supabase
    agent_run_dict = agent_run.to_dict()
    
    # Insert the AgentRun record
    agent_run_response = supabase.schema(schema).table("agent_runs").insert(agent_run_dict).execute()
    
    # Get the inserted record ID
    agent_run_id = agent_run_response.data[0]["id"]
    
    # Process all tool calls
    tool_calls_dicts = []
    for tool_call in agent_run.tool_calls:
        # Convert the tool call to a dict for Supabase
        tool_call_dict = tool_call.model_dump()
        
        # Add the agent_run_id
        tool_call_dict["agent_run_id"] = agent_run_id
        
        # Convert arguments and output to JSON strings if they're dicts
        if isinstance(tool_call_dict["arguments"], dict):
            tool_call_dict["arguments"] = json.dumps(tool_call_dict["arguments"])
        if isinstance(tool_call_dict["output"], dict):
            tool_call_dict["output"] = json.dumps(tool_call_dict["output"])
        
        tool_calls_dicts.append(tool_call_dict)
    
    # Insert all tool calls if there are any
    if tool_calls_dicts:
        supabase.schema(schema).table("agent_tool_calls").insert(tool_calls_dicts).execute()

def save_message_metadata(message_metadata: MessageMetadata):
    # Find the message by id
    query_result = supabase.table("messages").select("*").eq("id", message_metadata.message_id).execute()
    
    message_id = query_result.data[0]["id"]
    
    update_data = {
        "tags": message_metadata.email_tags,
        "stage": message_metadata.email_stage,
        "negotiation_summary": message_metadata.email_negotiation_summary,
        "follow_up_needed": message_metadata.email_follow_up_needed,
        "follow_up_date": message_metadata.email_follow_up_date if message_metadata.email_follow_up_date else None
    }
    
    supabase.table("messages").update(update_data).eq("id", message_id).execute()

def save_deliverable(deliverable: Deliverable):
    # Check if a deliverable with the same creator_id, media_type, platform, and unit already exists
    existing_query = supabase.table("deliverables").select("id").eq("creator_id", deliverable.creator_id).eq("media_type", deliverable.media_type).eq("platform", deliverable.platform).eq("unit", deliverable.unit).execute()

    deliverable_data = {
        "creator_id": deliverable.creator_id,
        "name": deliverable.name,
        "media_type": deliverable.media_type,
        "platform": deliverable.platform,
        "duration_sec": deliverable.duration_sec,
        "cross_posted": deliverable.cross_posted,
        "price": float(deliverable.price) if deliverable.price is not None else None,
        "currency": deliverable.currency,
        "unit": deliverable.unit,
        "notes": deliverable.notes,
        "raw_text": deliverable.raw_text
    }
    if existing_query.data and len(existing_query.data) > 0:
        # Update the existing deliverable
        existing_id = existing_query.data[0]["id"]
        supabase.table("deliverables").update(deliverable_data).eq("id", existing_id).execute()
    else:
        # Insert a new deliverable
        supabase.table("deliverables").insert(deliverable_data).execute()

def save_metadata(metadata: MetadataResponse):
    if metadata.message_metadata:
        save_message_metadata(metadata.message_metadata)
    if metadata.deliverables:
        for deliverable in metadata.deliverables:
            save_deliverable(deliverable)
    print(metadata.to_json_str())

def get_tool_calls(new_items: List[RunItem]) -> List[AgentToolCall]:
    """
    Extracts tool calls and their outputs from agent execution result new_items.
    Returns a list of AgentToolCall objects with all required attributes.
    """
    call_map = {}
    order = []
    for item in new_items:
        if item.type == "tool_call_item":
            call_id = getattr(item.raw_item, "call_id", "")
            arguments = getattr(item.raw_item, "arguments", {})
            # Convert arguments to Dict if it's not already
            if not isinstance(arguments, dict):
                try:
                    arguments = json.loads(arguments) if arguments else {}
                except:
                    arguments = {"raw_arguments": arguments}
                    
            tool_call = {
                "tool_name": getattr(item.raw_item, "name", ""),
                "arguments": arguments,
                "call_id": call_id,
                "output": {},  # Will be populated later if available
            }
            call_map[call_id] = tool_call
            order.append(call_id)
        elif item.type == "tool_call_output_item":
            call_id = item.raw_item.get("call_id", "") if isinstance(item.raw_item, dict) else ""
            output = item.output
            # Ensure output is a dictionary
            if not isinstance(output, dict):
                try:
                    output = json.loads(output) if isinstance(output, str) else {"value": output}
                except:
                    output = {"value": output}
                    
            if call_id in call_map:
                call_map[call_id]["output"] = output
            else:
                # Output before call: create a stub and fill later
                call_map[call_id] = {
                    "call_id": call_id, 
                    "output": output,
                    "tool_name": "",
                    "arguments": {}
                }
                order.append(call_id)
    
    # Convert to AgentToolCall objects
    result = []
    for idx, call_id in enumerate(order):
        if "tool_name" in call_map[call_id]:
            call_data = call_map[call_id]
            tool_call = AgentToolCall(
                call_id=call_id,
                tool_name=call_data["tool_name"],
                arguments=call_data["arguments"],
                output=call_data["output"],
                execution_order=idx + 1,  # 1-based indexing for execution order
            )
            result.append(tool_call)
            
    return result

def persist_agent_run(
    input: str,
    message_id: int,
    metadata_agent_result: RunResult = None,
    planning_agent_result: RunResult = None,
    execution_agent_result: RunResult = None,
    action_agent_result: RunResult = None,
    trace_id: str = None,
    processing_time: int = None,
    batch_name: Optional[str] = None,
    env: str = "production"
) -> AgentRun:    
    metadata_agent_output = metadata_agent_result.final_output if metadata_agent_result else None
    planning_agent_output = planning_agent_result.final_output if planning_agent_result else None
    execution_agent_output = execution_agent_result.final_output if execution_agent_result else None
    action_agent_output = action_agent_result.final_output if action_agent_result else None
    
    suggested_email_body = None
    if execution_agent_output:
        suggested_email_body = execution_agent_output.email_body
    elif action_agent_output:
        suggested_email_body = action_agent_output.email_body
    
    tool_calls = []
    if execution_agent_result and execution_agent_result.new_items:
        tool_calls.extend(get_tool_calls(execution_agent_result.new_items))
    if action_agent_result and action_agent_result.new_items:
        tool_calls.extend(get_tool_calls(action_agent_result.new_items))
    
    agent_run = AgentRun(
        input=input,
        message_id=message_id,
        metadata_agent_output=metadata_agent_output,
        planning_agent_output=planning_agent_output,
        execution_agent_output=execution_agent_output,
        action_agent_output=action_agent_output,
        suggested_email_body=suggested_email_body,
        trace_id=trace_id,
        processing_time=processing_time,
        batch_name=batch_name,
        tool_calls=tool_calls
    )
    
    print(f"agent_run: {agent_run.to_json_str()}")
    
    if env == "production" and metadata_agent_output:
        save_metadata(metadata_agent_output)
    
    save_agent_run_and_tool_calls(agent_run, env)

    return agent_run