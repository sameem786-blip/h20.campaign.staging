import { ConversationStageSlug } from './campaign';

export type Creator = {
  id: number
  creator_campaign_id: number
  conversation_id: number
  username: string
  stage: ConversationStageSlug
  screenshot_path: string | null
  core_platform: string | null
  evaluation_score: number | null
  platform_info: {
    followers: number | null
    bio: string | null
    video_analysis: Record<string, unknown> | null
  } | null
}