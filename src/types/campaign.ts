import { Run } from "./run_details";

export type Campaign = {
  id: number;
  campaign_id?: number;
  campaign_name?: string;
  name?: string;
  campaign_type_id?: number;
  company_details?: string;
  creative_brief?: string;
  campaign_status_by_platform?: [];
  research_overview?: [];
  runs_summary_list?: Run[];
  created_at?: number;
  total_good_fit_creators_identified_all_time?: number;
};

export type CampaignType = {
  id: number;
  name: string;
  details?: string;
  created_at?: string;
};

export type ConversationStage = {
  id: number;
  campaign_type_id: number;
  order: number;
  name: string;
  slug: string;
  details?: string;
  created_at?: string;
};

export type ConversationStageSlug = string;

export type StageCount = {
  stage: ConversationStageSlug;
  count: number;
};

export type CampaignWithStages = Campaign & {
  stages: StageCount[];
};
