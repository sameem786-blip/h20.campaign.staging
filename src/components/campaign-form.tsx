"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft } from "lucide-react"
import { CampaignType, ConversationStage } from "@/types/campaign"
import CampaignTypeModal from "@/components/campaign-type-modal"

interface CampaignFormProps {
  mode: 'create' | 'edit'
  campaignId?: string
  title: string
}

export default function CampaignForm({ mode, campaignId, title }: CampaignFormProps) {
  const router = useRouter()
  const [campaignName, setCampaignName] = useState("")
  const [companyDetails, setCompanyDetails] = useState("")
  const [creativeBrief, setCreativeBrief] = useState("")
  const [selectedCampaignTypeId, setSelectedCampaignTypeId] = useState<string>("")
  const [campaignTypes, setCampaignTypes] = useState<CampaignType[]>([])
  const [selectedCampaignTypeStages, setSelectedCampaignTypeStages] = useState<ConversationStage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [error, setError] = useState<string | null>(null)

  // Campaign Type Creation Modal state
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)

  // Load campaign types on mount
  useEffect(() => {
    async function fetchCampaignTypes() {
      try {
        const { data, error } = await supabase
          .from('campaign_types')
          .select('id, name, details')
          .order('name')

        if (error) throw error

        if (data) {
          setCampaignTypes(data)
        }
      } catch (error) {
        console.error('Error fetching campaign types:', error)
        setError('Failed to load campaign types')
      }
    }

    fetchCampaignTypes()
  }, [])

  // Load stages when campaign type is selected
  useEffect(() => {
    if (selectedCampaignTypeId) {
      loadCampaignTypeStages(parseInt(selectedCampaignTypeId))
    } else {
      setSelectedCampaignTypeStages([])
    }
  }, [selectedCampaignTypeId])

  const loadCampaignTypeStages = async (campaignTypeId: number) => {
    try {
      const { data, error } = await supabase
        .from('conversation_stages')
        .select('id, campaign_type_id, order, name, slug, details, created_at')
        .eq('campaign_type_id', campaignTypeId)
        .order('order')

      if (error) throw error

      if (data) {
        setSelectedCampaignTypeStages(data)
      }
    } catch (error) {
      console.error('Error loading stages:', error)
      setSelectedCampaignTypeStages([])
    }
  }

  const loadCampaignData = useCallback(async () => {
    if (!campaignId) return

    try {
      setIsLoading(true)
      setError(null)

      // Load campaign basic info
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name, company_details, creative_brief, campaign_type_id')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      if (campaignData) {
        setCampaignName(campaignData.name)
        setCompanyDetails(campaignData.company_details || '')
        setCreativeBrief(campaignData.creative_brief || '')
        setSelectedCampaignTypeId(campaignData.campaign_type_id?.toString() || '')
      }
    } catch (error) {
      console.error('Error loading campaign data:', error)
      setError('Failed to load campaign data')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  // Load campaign data on mount for edit mode
  useEffect(() => {
    if (mode === 'edit' && campaignId) {
      loadCampaignData()
    }
  }, [mode, campaignId, loadCampaignData])

  const handleCampaignTypeCreated = async (newCampaignType: CampaignType) => {
    // Refresh campaign types list
    const { data: updatedTypes, error: fetchError } = await supabase
      .from('campaign_types')
      .select('id, name, details')
      .order('name')

    if (!fetchError && updatedTypes) {
      setCampaignTypes(updatedTypes)
      // Auto-select the newly created campaign type
      setSelectedCampaignTypeId(newCampaignType.id.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!campaignName.trim()) {
      alert('Please enter a campaign name')
      return
    }

    if (!selectedCampaignTypeId) {
      alert('Please select a campaign type')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        // Create the campaign
        const { error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            name: campaignName.trim(),
            company_details: companyDetails.trim() || null,
            creative_brief: creativeBrief.trim() || null,
            campaign_type_id: parseInt(selectedCampaignTypeId)
          })

        if (campaignError) throw campaignError
      } else {
        // Update campaign basic info
        const { error: campaignError } = await supabase
          .from('campaigns')
          .update({
            name: campaignName.trim(),
            company_details: companyDetails.trim() || null,
            creative_brief: creativeBrief.trim() || null,
            campaign_type_id: parseInt(selectedCampaignTypeId)
          })
          .eq('id', campaignId)

        if (campaignError) throw campaignError
      }

      // Redirect back to campaigns management
      router.push('/campaigns-management')
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} campaign:`, error)
      alert(`Error ${mode === 'create' ? 'creating' : 'updating'} campaign. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/campaigns-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/campaigns-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <Input
                  id="campaignName"
                  placeholder="Enter campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="campaignType" className="block text-sm font-medium text-gray-700">
                    Campaign Type
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateTypeModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create new campaign type
                  </Button>
                </div>
                <Select 
                  value={selectedCampaignTypeId} 
                  onValueChange={setSelectedCampaignTypeId}
                  required
                >
                  <SelectTrigger id="campaignType">
                    <SelectValue placeholder="Select a campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCampaignTypeId && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Campaign Type Details:</h4>
                    <p className="text-sm text-gray-600">
                      {campaignTypes.find(t => t.id.toString() === selectedCampaignTypeId)?.details || 'No details available'}
                    </p>
                  </div>
                )}
              </div>

              {selectedCampaignTypeStages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Conversation Stages:</h4>
                  <div className="space-y-2">
                    {selectedCampaignTypeStages
                      .sort((a, b) => a.order - b.order)
                      .map((stage, index) => (
                        <div key={stage.id} className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h5 className="font-medium text-gray-900">{stage.name}</h5>
                          </div>
                          {stage.details && (
                            <p className="text-sm text-gray-600 mt-1">{stage.details}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="companyDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Details (Optional)
                </label>
                <Textarea
                  id="companyDetails"
                  placeholder="Enter company specific details for this campaign"
                  value={companyDetails}
                  onChange={(e) => setCompanyDetails(e.target.value)}
                  rows={4}
                  className="resize-y"
                />
              </div>

              <div>
                <label htmlFor="creativeBrief" className="block text-sm font-medium text-gray-700 mb-2">
                  Creative Brief (Optional)
                </label>
                <Input
                  id="creativeBrief"
                  placeholder="Enter creative brief for this campaign"
                  value={creativeBrief}
                  onChange={(e) => setCreativeBrief(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/campaigns-management')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Campaign' : 'Update Campaign')
              }
            </Button>
          </div>
        </form>

        {/* Campaign Type Creation Modal */}
        <CampaignTypeModal
          isOpen={isCreateTypeModalOpen}
          onOpenChange={setIsCreateTypeModalOpen}
          mode="create"
          onSuccess={handleCampaignTypeCreated}
        />
      </div>
    </main>
  )
} 