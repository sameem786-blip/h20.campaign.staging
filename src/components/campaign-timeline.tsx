import React from "react";
import { Campaign, ConversationStageSlug } from "@/types/campaign";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select2";
import { useRouter } from "next/navigation";
import { PremiumTestimonials } from "@/components/ui/premium-testimonials";
import { GradientButton } from "@/components/ui/gradient-button";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs2";

// Default stage labels for fallback
const DEFAULT_STAGE_LABELS: Record<string, string> = {
  share_creative_brief: "Share Creative Brief",
  questions: "Questions",
  rates_received: "Rates Received",
  negotiate_rates: "Negotiate Rates",
  send_contract: "Send Contract",
  contract_signed: "Contract Signed",
  content_draft: "Content Draft",
  content_posted: "Content Posted",
  pass: "Pass",
  none: "None",
};

type CampaignTimelineProps = {
  stages: {
    stage: ConversationStageSlug;
    count: number;
  }[];
  currentStage: ConversationStageSlug;
  campaigns: Campaign[];
  currentCampaign: Campaign;
  onStageClick: (stage: ConversationStageSlug) => void;
  onCampaignChange: (campaign: Campaign) => void;
};

export function CampaignTimeline({
  stages,
  currentStage,
  campaigns,
  currentCampaign,
  onStageClick,
  onCampaignChange,
}: CampaignTimelineProps) {
  const router = useRouter();
  // Create timeline stages directly from the provided stages data
  const timelineStages = stages.map((stage) => ({
    value: stage.stage,
    label: DEFAULT_STAGE_LABELS[stage.stage] || stage.stage,
    count: stage.count,
  }));

  return (
    <div className="w-full border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <div
          className="relative"
          style={{ minWidth: "260px", maxWidth: "340px", width: "100%" }}
        >
          <Select
            selectedKey={currentCampaign.id.toString()}
            onSelectionChange={(key) => {
              const selected = campaigns.find((c) => c.id.toString() === key);
              if (selected) onCampaignChange(selected);
            }}
          >
            <SelectTrigger
              className="w-full"
              style={{ minWidth: "260px", maxWidth: "340px" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectPopover>
              <SelectListBox>
                {campaigns.map((campaign) => (
                  <SelectItem
                    key={campaign.id.toString()}
                    id={campaign.id.toString()}
                  >
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectListBox>
            </SelectPopover>
          </Select>
        </div>

        <div style={{ minWidth: "180px" }} className="flex gap-2">
          <GradientButton
            className="gradient-button"
            onClick={() =>
              router.push(`/campaign-analysis/${currentCampaign.id}`)
            }
          >
            Campaign Analysis
          </GradientButton>
          <GradientButton
            className="gradient-button"
            onClick={() => router.push("/campaigns-management")}
          >
            Campaign Management
          </GradientButton>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <Tabs
            selectedKey={currentStage}
            onSelectionChange={(key) =>
              onStageClick(key as ConversationStageSlug)
            }
          >
            <TabList className="flex h-12 w-full items-center justify-between rounded-lg bg-gray-100 p-1 text-gray-500 gap-0.5">
              {timelineStages.map((stage) => (
                <Tab
                  key={stage.value}
                  id={stage.value}
                  className="flex-1 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium ring-offset-background transition-all hover:bg-white/80 hover:z-10 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-[#FFA87D] data-[selected]:text-[#1C1C1E] data-[selected]:shadow-sm data-[selected]:z-20"
                >
                  <span className="truncate">{stage.label}</span>
                  <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium data-[selected]:bg-gray-100 flex-shrink-0 text-[#FF9A63]">
                    {stage.count}
                  </span>
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
