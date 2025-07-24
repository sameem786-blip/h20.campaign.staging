// interface Deliverable {
//   id: number;
//   name: string;
//   media_type: string;
//   platform: string;
//   duration_sec: number;
//   cross_posted: boolean;
//   price: number;
//   currency: string;
//   unit: string;
//   notes: string;
//   raw_text: string;
//   created_at: string;
// }

// interface Message {
//   id: number;
//   conversation_id: number;
//   external_message_id: string | null;
//   direction: 'inbound' | 'outbound';
//   sender: string | null;
//   recipient: string | null;
//   subject: string | null;
//   body: string | null;
//   sent_at: string | null;
//   opened_at: string | null;
//   stage: string | null;
//   ai_response_used: boolean;
//   tags: string[];
//   negotiation_summary: string | null;
//   follow_up_needed: boolean;
//   follow_up_date: string | null;
//   smartlead_stats_id: number;
//   created_at: string;
// }

// interface AgentRun {
//   id: number;
//   message_id: number;
//   planning_agent_output: string | null;
//   execution_agent_output: string | null;
//   suggested_email_body: string | null;
//   email_body_approved: boolean;
//   trace_id: string | null;
//   processing_time: number;
//   created_at: string;
//   smartlead_reply_sent: boolean;
// }

// interface AgentToolCall {
//   id: number;
//   agent_run_id: number;
//   call_id: number;
//   tool_name: string;
//   arguments: string;
//   output: string;
//   execution_order: number;
//   created_at: string;
// }

// interface SmartLeadCampaign {
//   id: number;
//   parent_campaign_id: number;
//   created_at: string;
//   smartlead_campaign_id: number;
//   user_id: number;
//   status: string;
//   campaign_name: string;
//   pydantic_model: string;
//   get_leads_automatically: boolean;
//   visible: boolean;
// }

// interface SmartLeadCampaignLead {
//   id: number;
//   campaign_id: number;
//   lead_id: number;
// }

// interface Creators {
//   id: number;
//   username: string;
//   email: string;
// }

export interface Conversation {
  conversation_id: number;
  campaign_id: number;
  campaign_name: string;
  smartlead_campaign_id: number;
  smartlead_campaign_name: string;
  creator_id: number;
  creator_username: string;
  primary_email: string;
  last_message_stage: string;
  last_message_sent_at: string;
  last_message_tags: string[];
  last_message_follow_up_needed: boolean;
  email_body_approved: string | null;
  last_agent_run_created_at: string | null;
}

export interface ConversationFilters {
  search: string;
  notApproved: boolean;
  tags: string[];
  followUpNeeded: boolean;
  campaignId: number | null;
} 