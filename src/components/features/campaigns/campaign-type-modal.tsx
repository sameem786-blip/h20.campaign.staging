"use client"

import { useState, useCallback, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { CampaignType } from "@/types"

interface ConversationStageForm {
  id?: number
  name: string
  details: string
  order: number
  slug: string
  isNew?: boolean
}

interface DragItem {
  id: string
  index: number
}

interface CampaignTypeModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  campaignType?: CampaignType
  onSuccess?: (campaignType: CampaignType) => void
}

function DraggableStage({ 
  stage, 
  index, 
  moveStage, 
  updateStage, 
  removeStage 
}: {
  stage: ConversationStageForm
  index: number
  moveStage: (dragIndex: number, hoverIndex: number) => void
  updateStage: (index: number, field: 'name' | 'details', value: string) => void
  removeStage: (index: number) => void
}) {
  const stageId = stage.id?.toString() || `temp-${index}`
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'stage',
    item: () => ({ id: stageId, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => true,
  })

  const [, drop] = useDrop({
    accept: 'stage',
    hover: (item: DragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      moveStage(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const ref = (node: HTMLDivElement | null) => {
    preview(node)
    drop(node)
  }

  return (
    <div ref={ref} className={`mb-4 transition-opacity duration-200 ${isDragging ? 'opacity-50' : ''}`}>
      <Card className={isDragging ? 'shadow-lg' : ''}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {/* @ts-expect-error - drag is not typed */}
            <div ref={drag} className="cursor-move p-1 hover:bg-gray-100 rounded transition-colors">
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Stage Name
                </label>
                <Input
                  placeholder="Enter stage name"
                  value={stage.name}
                  onChange={(e) => updateStage(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  When the conversation moves to this stage?
                </label>
                <Textarea
                  placeholder="Enter stage details"
                  value={stage.details}
                  onChange={(e) => updateStage(index, 'details', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeStage(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '')
}

export default function CampaignTypeModal({ 
  isOpen, 
  onOpenChange, 
  mode, 
  campaignType, 
  onSuccess 
}: CampaignTypeModalProps) {
  const [typeName, setTypeName] = useState(campaignType?.name || "")
  const [typeDetails, setTypeDetails] = useState(campaignType?.details || "")
  const [conversationStages, setConversationStages] = useState<ConversationStageForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load campaign type stages when modal opens in edit mode
  const loadCampaignTypeStages = async (campaignTypeId: number) => {
    try {
      const supabase = createClient();
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

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && campaignType) {
        setTypeName(campaignType.name)
        setTypeDetails(campaignType.details || '')
        loadCampaignTypeStages(campaignType.id).then(setConversationStages)
      } else {
        setTypeName('')
        setTypeDetails('')
        setConversationStages([])
      }
    }
  }, [isOpen, mode, campaignType])

  const addNewStage = () => {
    const newStage: ConversationStageForm = {
      name: "",
      details: "",
      order: conversationStages.length,
      slug: "",
      isNew: true
    }
    setConversationStages([...conversationStages, newStage])
  }

  const moveStage = useCallback((dragIndex: number, hoverIndex: number) => {
    setConversationStages(prevStages => {
      const newStages = [...prevStages]
      const draggedStage = newStages[dragIndex]
      
      newStages.splice(dragIndex, 1)
      newStages.splice(hoverIndex, 0, draggedStage)
      
      return newStages.map((stage, index) => ({
        ...stage,
        order: index
      }))
    })
  }, [])

  const updateStage = useCallback((index: number, field: 'name' | 'details', value: string) => {
    setConversationStages(stages =>
      stages.map((stage, i) =>
        i === index ? { 
          ...stage, 
          [field]: value,
          ...(field === 'name' ? { slug: generateSlug(value) } : {})
        } : stage
      )
    )
  }, [])

  const removeStage = useCallback((index: number) => {
    setConversationStages(prevStages => {
      const newStages = prevStages
        .filter((_, i) => i !== index)
        .map((stage, i) => ({ ...stage, order: i }))
      return newStages
    })
  }, [])

  const handleSubmit = async () => {
    if (!(typeName ?? "").trim()) {
      alert('Please enter a campaign type name')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient();
      if (mode === 'create') {
        // Create campaign type
        const { data: campaignTypeData, error: typeError } = await supabase
          .from('campaign_types')
          .insert({
            name: (typeName ?? "").trim(),
            details: (typeDetails ?? "").trim() || null
          })
          .select('id, name, details')
          .single()

        if (typeError) throw typeError

        // Create conversation stages
        if (conversationStages.length > 0 && campaignTypeData) {
          const stagesData = conversationStages.map(stage => ({
            name: (stage.name ?? "").trim(),
            details: (stage.details ?? "").trim() || null,
            slug: generateSlug((stage.name ?? "").trim()),
            campaign_type_id: campaignTypeData.id,
            order: stage.order
          }))

          const { error: stagesError } = await supabase
            .from('conversation_stages')
            .insert(stagesData)

          if (stagesError) throw stagesError
        }

        onSuccess?.(campaignTypeData)
      } else {
        // Update campaign type
        const { error: typeError } = await supabase
          .from('campaign_types')
          .update({
            name: (typeName ?? "").trim(),
            details: (typeDetails ?? "").trim() || null
          })
          .eq('id', campaignType!.id)

        if (typeError) throw typeError

        // Delete existing stages
        const { error: deleteError } = await supabase
          .from('conversation_stages')
          .delete()
          .eq('campaign_type_id', campaignType!.id)

        if (deleteError) throw deleteError

        // Insert updated stages
        if (conversationStages.length > 0) {
          const stagesData = conversationStages.map(stage => ({
            name: (stage.name ?? "").trim(),
            details: (stage.details ?? "").trim() || null,
            slug: generateSlug((stage.name ?? "").trim()),
            campaign_type_id: campaignType!.id,
            order: stage.order
          }))

          const { error: insertError } = await supabase
            .from('conversation_stages')
            .insert(stagesData)

          if (insertError) throw insertError
        }

        onSuccess?.({
          ...campaignType!,
          name: (typeName ?? "").trim(),
          details: (typeDetails ?? "").trim() || undefined
        })
      }

      // Close modal
      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} campaign type:`, error)
      alert(`Error ${mode === 'create' ? 'creating' : 'updating'} campaign type. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Campaign Type' : 'Edit Campaign Type'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Create a new campaign type with its conversation stages.' 
                : 'Update the campaign type and its conversation stages.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type Name
                </label>
                <Input
                  placeholder="Enter campaign type name"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <Textarea
                  placeholder="Enter campaign type details"
                  value={typeDetails}
                  onChange={(e) => setTypeDetails(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Conversation Stages</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewStage}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Stage
                </Button>
              </div>

              {conversationStages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No conversation stages added yet. Click &quot;Add Stage&quot; to get started.
                </div>
              ) : (
                <div>
                  {conversationStages.map((stage, index) => (
                    <DraggableStage
                      key={`${stage.id || 'new'}-${index}`}
                      stage={stage}
                      index={index}
                      moveStage={moveStage}
                      updateStage={updateStage}
                      removeStage={removeStage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  )
} 