import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Message {
  id: number;
  conversation_id: number;
  external_message_id: string | null;
  direction: 'inbound' | 'outbound';
  sender: string | null;
  recipient: string | null;
  subject: string | null;
  body: string | null;
  sent_at: string | null;
  opened_at: string | null;
  stage: string | null;
  ai_response_used: boolean;
  created_at: string;
}

export interface AgentRun {
  id: number;
  message_id: number;
  planning_agent_output: string | null;
  execution_agent_output: string | null;
  suggested_email_body: string | null;
  email_body_approved: string | null;
  email_body_feedback: string | null;
  follow_up_needed: boolean;
  follow_up_date: string | null;
  review: boolean;
  tags: string[] | null;
  trace_id: string | null;
  processing_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface AgentToolCall {
  id: number;
  agent_run_id: number;
  call_id: string | null;
  tool_name: string | null;
  arguments: Record<string, unknown>;
  output: Record<string, unknown>;
  execution_order: number | null;
  created_at: string;
}