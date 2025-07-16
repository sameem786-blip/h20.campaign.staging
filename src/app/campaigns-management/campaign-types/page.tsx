"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, ArrowLeft, Edit, Eye } from "lucide-react"
import { CampaignType } from "@/types/campaign"
import CampaignTypeModal from "@/components/campaign-type-modal"

interface ConversationStage {
  id: number
  name: string
  details: string | null
  order: number
  slug: string
}

export default function CampaignTypesPage() {
  const router = useRouter()
  const [campaignTypes, setCampaignTypes] = useState<CampaignType[]>([])
  const [selectedCampaignType, setSelectedCampaignType] = useState<CampaignType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [loading, setLoading] = useState(true)
  const [conversationStages, setConversationStages] = useState<ConversationStage[]>([])

  // Load campaign types on mount
  useEffect(() => {
    fetchCampaignTypes()
  }, [])

  const fetchCampaignTypes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaign_types')
        .select('id, name, details, created_at')
        .order('name')

      if (error) throw error

      if (data) {
        setCampaignTypes(data)
      }
    } catch (error) {
      console.error('Error fetching campaign types:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignTypeStages = async (campaignTypeId: number) => {
    try {
      const { data, error } = await supabase
        .from('conversation_stages')
        .select('id, name, details, slug, "order"')
        .eq('campaign_type_id', campaignTypeId)
        .order('order')

      if (error) throw error

      return data?.map(stage => ({
        id: stage.id,
        name: stage.name,
        details: stage.details || '',
        order: stage.order,
        slug: stage.slug
      })) || []
    } catch (error) {
      console.error('Error loading stages:', error)
      return []
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedCampaignType(null)
    setIsFormOpen(true)
  }

  const openEditForm = async (campaignType: CampaignType) => {
    setFormMode('edit')
    setSelectedCampaignType(campaignType)
    setIsFormOpen(true)
  }

  const openViewDialog = async (campaignType: CampaignType) => {
    setSelectedCampaignType(campaignType)
    const stages = await loadCampaignTypeStages(campaignType.id)
    setConversationStages(stages)
    setIsViewDialogOpen(true)
  }

  const handleSuccess = () => {
    fetchCampaignTypes()
  }

  const deleteCampaignType = async (campaignType: CampaignType) => {
    if (!confirm(`Are you sure you want to delete "${campaignType.name}"? This will also delete all associated conversation stages.`)) {
      return
    }

    try {
      // First delete associated stages
      const { error: stagesError } = await supabase
        .from('conversation_stages')
        .delete()
        .eq('campaign_type_id', campaignType.id)

      if (stagesError) throw stagesError

      // Then delete the campaign type
      const { error: typeError } = await supabase
        .from('campaign_types')
        .delete()
        .eq('id', campaignType.id)

      if (typeError) throw typeError

      await fetchCampaignTypes()
    } catch (error) {
      console.error('Error deleting campaign type:', error)
      alert('Error deleting campaign type. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/campaigns-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
            <h1 className="text-2xl font-bold">Campaign Types</h1>
          </div>
          <Button onClick={openCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign Type
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignTypes.map((campaignType) => (
            <Card key={campaignType.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaignType.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {campaignType.details && campaignType.details.length > 100 
                        ? `${campaignType.details.substring(0, 100)}...` 
                        : campaignType.details || 'No description'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(campaignType)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(campaignType)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCampaignType(campaignType)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Form Modal */}
        <CampaignTypeModal
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          mode={formMode}
          campaignType={selectedCampaignType || undefined}
          onSuccess={handleSuccess}
        />

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCampaignType?.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedCampaignType?.details && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Details:</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedCampaignType.details}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Conversation Stages:</h4>
                {conversationStages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No conversation stages defined.</p>
                ) : (
                  <div className="space-y-3">
                    {conversationStages
                      .sort((a, b) => a.order - b.order)
                      .map((stage, index) => (
                        <div key={stage.id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <h5 className="font-medium">{stage.name}</h5>
                          </div>
                          {stage.details && (
                            <p className="text-sm text-gray-600">{stage.details}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
} 