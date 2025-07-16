export type RunDetails = {
  run_id: number;
  run_name: string;
  platform: "instagram" | "tiktok" | "youtube";
  discovery_method: string;
  current_processing_step: string;
  current_step_status: "active" | "error" | "completed";
  error_details?: {
    step_where_error_occurred: string;
    error_message: string;
    error_code?: string;
  };
  total_research_time_seconds: number;
  current_action_description: string;
  last_updated_timestamp: number;
  dropoff_metrics: {
    good_creators_found: number;
    total_profiles_from_network: number;
    brands_removed: { count: number; profiles_remaining: number };
    evaluation_removed: { count: number; profiles_remaining: number };
    no_email_accounts_removed: { count: number; profiles_remaining: number };
    follower_count_removed: { count: number; profiles_remaining: number };
  };
};
export type Run = {
  discovery_method?: string;
  overall_status?: string;
  platform?: string;
  run_id?: number;
  run_name?: string;
};
