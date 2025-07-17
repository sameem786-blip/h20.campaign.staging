'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Types for the API responses - all fields are optional
interface AudienceAnalysis {
  title?: string;
  macro_persona?: string;
  micro_segments?: {
    segment?: string;
    views_pool_share_percent?: number;
    core_interests?: string[];
    creator_ids?: number[];
  }[];
  network_cheatsheet?: {
    views_pool_share_ranked?: {
      segment?: string;
      share_percent?: number;
    }[];
    rate_bands?: string;
    network_breakdown?: {
      instagram_only?: number;
      cross_post_bundles?: number;
      tiktok_only?: number;
      youtube_only?: number;
    };
  };
}

interface CPMPerformerEntry {
  creator?: string;
  cpm_usd?: number;
  note?: string;
}

interface CPMAnalysis {
  key_takeaways?: {
    cheatsheet?: {
      low_cpm?: number;
      high_cpm?: number;
      median_cpm?: number;
      average_cpm?: number;
    };
    top_performers?: CPMPerformerEntry[];
    solid_value?: CPMPerformerEntry[];
    caution_zone?: CPMPerformerEntry[];
  };
  table?: {
    rank?: number;
    handle?: string;
    brand_fit?: number;
    rate_usd?: number;
    mean_views?: number;
    cpm_usd?: number;
    outlier_rate_pct?: number;
  }[];
}

export default function CampaignAnalysisPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'qualitative' | 'quantitative'>('qualitative');
  const [audienceData, setAudienceData] = useState<AudienceAnalysis | null>(null);
  const [cpmData, setCpmData] = useState<CPMAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [audienceResponse, cpmResponse] = await Promise.all([
        fetch(`https://kiko-test.replit.app/audience-analysis?campaign_id=${campaignId}`, {
          method: 'POST',
        }),
        fetch(`https://kiko-test.replit.app/cpm-analysis?campaign_id=${campaignId}`, {
          method: 'POST',
        })
      ]);

      if (!audienceResponse.ok || !cpmResponse.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const audienceResult = await audienceResponse.json();
      const cpmResult = await cpmResponse.json();

      setAudienceData(audienceResult);
      setCpmData(cpmResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (campaignId) {
      fetchAnalysisData();
    }
  }, [campaignId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'qualitative'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('qualitative')}
            >
              Qualitative
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'quantitative'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('quantitative')}
            >
              Quantitative
            </button>
          </div>
          <button
            onClick={fetchAnalysisData}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Run Analysis
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'qualitative' && audienceData && (
          <div className="space-y-8">
            {/* Macro Persona */}
            <div className="text-center max-w-4xl mx-auto">
              {audienceData.title && (
                <h1 className="text-2xl font-bold mb-4">{audienceData.title}</h1>
              )}
              {audienceData.macro_persona && (
                <p className="text-gray-700 leading-relaxed">
                  {audienceData.macro_persona}
                </p>
              )}
            </div>
              
            {/* Micro Personas */}
            {audienceData.micro_segments && audienceData.micro_segments.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6">
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Micro Personas
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {audienceData.micro_segments.map((segment, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-2">{segment?.segment || 'Unknown Segment'}</h3>
                      <div className="text-sm text-gray-600 mb-4">
                        {segment?.views_pool_share_percent || 0}% Views Pool Share
                      </div>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {(segment?.core_interests || []).map((interest, idx) => (
                          <li key={idx}>{interest}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Bands */}
            {audienceData.network_cheatsheet?.rate_bands && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">Rate Bands</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-600">{audienceData.network_cheatsheet.rate_bands}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deliverable Breakdown */}
            {audienceData.network_cheatsheet?.network_breakdown && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">Deliverable Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Instagram Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.instagram_only || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cross Post Bundles:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.cross_post_bundles || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tiktok Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.tiktok_only || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Youtube Only:</span>
                    <span className="font-medium">{audienceData.network_cheatsheet.network_breakdown.youtube_only || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!audienceData.macro_persona && (!audienceData.micro_segments || audienceData.micro_segments.length === 0) && !audienceData.network_cheatsheet && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No qualitative analysis data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quantitative' && cpmData && (
          <div className="space-y-8">
            {/* Cheatsheet */}
            {cpmData.key_takeaways?.cheatsheet && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Cheatsheet</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Low CPM</div>
                    <div className="text-2xl font-bold">{formatCurrency(cpmData.key_takeaways.cheatsheet.low_cpm || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">High CPM</div>
                    <div className="text-2xl font-bold">{formatCurrency(cpmData.key_takeaways.cheatsheet.high_cpm || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Median CPM</div>
                    <div className="text-2xl font-bold">{formatCurrency(cpmData.key_takeaways.cheatsheet.median_cpm || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Average CPM</div>
                    <div className="text-2xl font-bold">{formatCurrency(cpmData.key_takeaways.cheatsheet.average_cpm || 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {cpmData.key_takeaways && (
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-bold mb-6">Key Takeaways</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Top Performers */}
                  {cpmData.key_takeaways.top_performers && cpmData.key_takeaways.top_performers.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">Top Performers</h4>
                      <div className="space-y-3">
                        {cpmData.key_takeaways.top_performers.map((performer, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-green-800">{performer?.creator || 'Unknown'}</div>
                            <div className="text-green-700">CPM: {formatCurrency(performer?.cpm_usd || 0)}</div>
                            <div className="text-green-600 text-xs mt-1">{performer?.note || ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Solid Value */}
                  {cpmData.key_takeaways.solid_value && cpmData.key_takeaways.solid_value.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">Solid Value</h4>
                      <div className="space-y-3">
                        {cpmData.key_takeaways.solid_value.map((performer, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-blue-800">{performer?.creator || 'Unknown'}</div>
                            <div className="text-blue-700">CPM: {formatCurrency(performer?.cpm_usd || 0)}</div>
                            <div className="text-blue-600 text-xs mt-1">{performer?.note || ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caution Zone */}
                  {cpmData.key_takeaways.caution_zone && cpmData.key_takeaways.caution_zone.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-3">Caution Zone</h4>
                      <div className="space-y-3">
                        {cpmData.key_takeaways.caution_zone.map((performer, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-red-800">{performer?.creator || 'Unknown'}</div>
                            <div className="text-red-700">CPM: {formatCurrency(performer?.cpm_usd || 0)}</div>
                            <div className="text-red-600 text-xs mt-1">{performer?.note || ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Creator Performance Table */}
            {cpmData.table && cpmData.table.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-bold mb-6">Creator Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Rank</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Handle</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Rate (USD)</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">CPM (USD)</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Mean Views</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Brand Fit</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Outlier Rate %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cpmData.table.map((creator, index) => (
                        <tr key={creator?.rank || index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">{creator?.rank || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2 font-medium">{creator?.handle || 'Unknown'}</td>
                          <td className="border border-gray-200 px-4 py-2">${creator?.rate_usd || 0}</td>
                          <td className="border border-gray-200 px-4 py-2">{formatCurrency(creator?.cpm_usd || 0)}</td>
                          <td className="border border-gray-200 px-4 py-2">{formatNumber(creator?.mean_views || 0)}</td>
                          <td className="border border-gray-200 px-4 py-2">{creator?.brand_fit || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2">{creator?.outlier_rate_pct || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!cpmData.key_takeaways && (!cpmData.table || cpmData.table.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No quantitative analysis data available</p>
              </div>
            )}
          </div>
        )}

        {/* No data at all message */}
        {activeTab === 'qualitative' && !audienceData && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No qualitative analysis data available</p>
            <p className="text-gray-400 text-sm mt-2">Click &quot;Run Analysis&quot; to generate analysis data</p>
          </div>
        )}

        {activeTab === 'quantitative' && !cpmData && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quantitative analysis data available</p>
            <p className="text-gray-400 text-sm mt-2">Click &quot;Run Analysis&quot; to generate analysis data</p>
          </div>
        )}
      </div>
    </div>
  );
} 