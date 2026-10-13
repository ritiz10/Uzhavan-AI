import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Wheat, ScanLine, Droplets, Calendar, 
  Search, Eye, Clock, FileText 
} from 'lucide-react';
import { cropService } from '../services/cropService';
import { diseaseService } from '../services/diseaseService';
import { irrigationService } from '../services/irrigationService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';

export const History = () => {
  const [activeTab, setActiveTab] = useState('crop');
  const [cropHistory, setCropHistory] = useState([]);
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [irrigHistory, setIrrigHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadAllHistory();
  }, []);

  const loadAllHistory = async () => {
    setLoading(true);
    try {
      const [crops, diseases, irrigs] = await Promise.all([
        cropService.getHistory(50),
        diseaseService.getHistory(50),
        irrigationService.getHistory(50),
      ]);
      setCropHistory(crops);
      setDiseaseHistory(diseases);
      setIrrigHistory(irrigs);
    } catch (err) {
      console.error("Error loading historical predictions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prediction & Advisory History</h1>
          <Badge variant="primary" size="sm">Audit Records</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect your past AI crop recommendations, plant disease scans, and irrigation advisory schedules.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'crop'
              ? 'border-agri-600 text-agri-700 bg-agri-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Crop Recommendations ({cropHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disease')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'disease'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>Disease Detection ({diseaseHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('irrigation')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'irrigation'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Irrigation Advisories ({irrigHistory.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading historical predictions..." />
        </div>
      ) : (
        <div>
          {/* TAB 1: CROP RECOMMENDATIONS */}
          {activeTab === 'crop' && (
            cropHistory.length === 0 ? (
              <EmptyState
                icon={Wheat}
                title="No crop recommendations on record"
                description="Run an AI soil analysis to see historical recommendations here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cropHistory.map((item) => (
                  <Card key={item.id} hover className="p-5 flex flex-col justify-between" onClick={() => setSelectedItem({ type: 'crop', data: item })}>
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Badge variant="primary" size="sm">{item.confidence_display}</Badge>
                      </div>

                      <div className="my-3">
                        <h4 className="text-xl font-bold text-slate-900">{item.recommended_crop}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.reason}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Season: <strong>{item.expected_growing_season?.slice(0, 18)}</strong></span>
                      <span className="text-agri-600 font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* TAB 2: DISEASE SCANS */}
          {activeTab === 'disease' && (
            diseaseHistory.length === 0 ? (
              <EmptyState
                icon={ScanLine}
                title="No disease inspection scans found"
                description="Upload an infected leaf photograph in Disease Detection to view diagnoses here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diseaseHistory.map((item) => (
                  <Card key={item.id} hover className="p-5 flex flex-col justify-between" onClick={() => setSelectedItem({ type: 'disease', data: item })}>
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Badge
                          variant={item.severity === 'Severe' || item.severity === 'High' ? 'error' : item.severity === 'Moderate' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {item.severity}
                        </Badge>
                      </div>

                      <div className="my-3">
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          {item.crop}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-2">{item.predicted_disease}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.symptoms}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confidence: <strong>{item.confidence_display}</strong></span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* TAB 3: IRRIGATION ADVISORIES */}
          {activeTab === 'irrigation' && (
            irrigHistory.length === 0 ? (
              <EmptyState
                icon={Droplets}
                title="No irrigation advisories recorded"
                description="Run an irrigation evaluation based on soil moisture to build your irrigation history."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {irrigHistory.map((item) => (
                  <Card key={item.id} hover className="p-5 flex flex-col justify-between" onClick={() => setSelectedItem({ type: 'irrigation', data: item })}>
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Badge
                          variant={item.status_color === 'red' ? 'error' : item.status_color === 'yellow' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {item.irrigation_status}
                        </Badge>
                      </div>

                      <div className="my-3">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {item.crop} &bull; {item.growth_stage}
                        </span>
                        <p className="text-xs font-medium text-slate-700 mt-2">{item.recommended_action}</p>
                        <p className="text-xs text-blue-800 font-bold mt-1">{item.water_estimate}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Timing: <strong>{item.recommended_timing?.slice(0, 15)}</strong></span>
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={
            selectedItem.type === 'crop'
              ? `Crop Recommendation: ${selectedItem.data.recommended_crop}`
              : selectedItem.type === 'disease'
              ? `Plant Disease Diagnostic: ${selectedItem.data.predicted_disease}`
              : `Irrigation Advisory: ${selectedItem.data.crop}`
          }
          subtitle={`Recorded on ${new Date(selectedItem.data.created_at).toLocaleString()}`}
        >
          {selectedItem.type === 'crop' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm mb-1">Recommended Crop</span>
                <span className="text-2xl font-black text-agri-700">{selectedItem.data.recommended_crop}</span>
                <span className="ml-3 font-semibold text-slate-600">({selectedItem.data.confidence_display} Match)</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Agronomic Reason:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedItem.data.reason}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Fertilizer Guidance:</span>
                <p className="text-slate-600 leading-relaxed bg-earth-50/60 p-3 rounded-lg border border-earth-200/60">{selectedItem.data.fertilizer_guidance}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Season:</span>
                  <span className="font-semibold text-slate-800">{selectedItem.data.expected_growing_season}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Water Requirement:</span>
                  <span className="font-semibold text-slate-800">{selectedItem.data.water_requirement}</span>
                </div>
              </div>
            </div>
          )}

          {selectedItem.type === 'disease' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-xs">Diagnosed Disease:</span>
                  <span className="text-xl font-bold text-slate-900">{selectedItem.data.predicted_disease}</span>
                  <span className="text-slate-500 block mt-0.5">Crop: {selectedItem.data.crop}</span>
                </div>
                <Badge variant={selectedItem.data.severity === 'None' ? 'success' : 'error'} size="md">
                  {selectedItem.data.severity}
                </Badge>
              </div>

              {selectedItem.data.image_url && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img src={selectedItem.data.image_url} alt="Specimen" className="w-full h-48 object-contain" />
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Symptoms:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedItem.data.symptoms}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Recommended Treatment:</span>
                <p className="text-slate-700 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 font-medium leading-relaxed">{selectedItem.data.recommendation}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Expert Advice:</span>
                <p className="text-slate-600 bg-earth-50/70 p-3 rounded-lg border border-earth-200/60">{selectedItem.data.expert_advisory}</p>
              </div>
            </div>
          )}

          {selectedItem.type === 'irrigation' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-xs">Irrigation Status:</span>
                <span className="text-2xl font-black text-slate-900">{selectedItem.data.irrigation_status}</span>
                <span className="text-blue-800 font-bold block mt-1">{selectedItem.data.water_estimate}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Recommended Action:</span>
                <p className="text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 font-medium leading-relaxed">{selectedItem.data.recommended_action}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Optimal Timing:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selectedItem.data.recommended_timing}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Weather & Soil Consideration:</span>
                <p className="text-slate-600 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">{selectedItem.data.weather_consideration}</p>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
