import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"

type DistributionItem = {
  count: number
  range: string
  percentage: number
}

type VideoSummary = {
  mean_views?: number
  most_viewed?: number
  total_views?: number
  median_views?: number
}

type VideoPerformanceProps = {
  videoAnalysis: Record<string, unknown> | null
  isOpen: boolean
  onClose: () => void
}

export function VideoPerformanceModal({
  videoAnalysis,
  isOpen,
  onClose
}: VideoPerformanceProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !videoAnalysis || !mounted) return null
  
  // Extract distribution data
  const distributionData = (videoAnalysis.last_15_videos_distribution_relative_to_median as DistributionItem[]) || []
  
  // Get summary data
  const summary = (videoAnalysis.last_15_videos_summary as VideoSummary) || {}
  const sampleSize = (videoAnalysis.sample_size_videos as number) || 0
  
  // Use createPortal to render the modal outside of the creator card component
  return createPortal(
    <div 
      className="fixed inset-0 bg-opacity-30 backdrop-blur-[1px] z-[9999] flex items-center justify-center p-4" 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Video Performance Distribution</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Distribution of the last {sampleSize} videos relative to median views
          </p>
        </div>
        
        <div className="p-4">
          <h4 className="uppercase text-xs font-medium text-gray-500 mb-2">
            LAST {sampleSize} VIDEOS DISTRIBUTION
          </h4>
          <p className="text-xs text-gray-500 mb-4">Relative to median views</p>
          
          {/* Chart */}
          <div className="space-y-4">
            {distributionData.map((item: DistributionItem, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.range}</span>
                  <span>{item.count} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Video Performance Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Median Views</p>
                <p className="font-medium">{summary.median_views?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mean Views</p>
                <p className="font-medium">{summary.mean_views?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Most Viewed</p>
                <p className="font-medium">{summary.most_viewed?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Views</p>
                <p className="font-medium">{summary.total_views?.toLocaleString() || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body // Render directly to the document body
  )
} 