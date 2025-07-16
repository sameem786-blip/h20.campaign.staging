"use client"

import { useParams } from "next/navigation"
import CampaignForm from "@/components/campaign-form"

export default function EditCampaignPage() {
  const params = useParams()
  const campaignId = params.id as string

  return (
    <CampaignForm 
      mode="edit" 
      campaignId={campaignId}
      title="Edit Campaign" 
    />
  )
} 