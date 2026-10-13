import React, { useState, useEffect } from 'react';
import { Activity, Wheat, ScanLine, Droplets, Filter, Calendar } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export const Predictions = () => {
  const [activeTab, setActiveTab] = useState('crop');
  const [cropRecs, setCropRecs] = useState([]);
  const [diseaseScans, setDiseaseScans] = useState([]);
  const [irrigAdvisories, setIrrigAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crops, diseases, irrigs] = await Promise.all([
        adminService.getCropRecommendations({ limit: 100 }),
        adminService.getDiseasePredictions({ limit: 100 }),
        adminService.getIrrigationAdvisories({ limit: 100 }),
      ]);
      setCropRecs(crops);
      setDiseaseScans(diseases);
      setIrrigAdvisories(irrigs);
    } catch (err) {
      setError('Failed to fetch system prediction logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Predictions & Advisories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs of all AI model outputs delivered to Tamil Nadu farmers.
          </p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Tabs */}
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
          <span>Crop Recommendations ({cropRecs.length})</span>
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
          <span>Disease Scans ({diseaseScans.length})</span>
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
          <span>Irrigation Schedules ({irrigAdvisories.length})</span>
        </button>
      </div>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Loading global prediction logs..." />
            </div>
          ) : activeTab === 'crop' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Farmer Name</th>
                    <th className="p-3.5 font-bold">District</th>
                    <th className="p-3.5 font-bold">Soil Type</th>
                    <th className="p-3.5 font-bold">Recommended Crop</th>
                    <th className="p-3.5 font-bold">Confidence</th>
                    <th className="p-3.5 font-bold">Model Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cropRecs.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 text-slate-400">{c.created_at}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{c.farmer_name}</td>
                      <td className="p-3.5 text-slate-600">{c.district}</td>
                      <td className="p-3.5 text-slate-600">{c.soil_type || 'N/A'}</td>
                      <td className="p-3.5 font-bold text-agri-700">{c.recommended_crop}</td>
                      <td className="p-3.5 font-bold text-slate-800">{c.confidence}</td>
                      <td className="p-3.5">
                        <Badge variant={c.model_type === 'trained_model' ? 'success' : 'warning'} size="sm">
                          {c.model_type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'disease' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Farmer</th>
                    <th className="p-3.5 font-bold">Crop</th>
                    <th className="p-3.5 font-bold">Diagnosed Disease</th>
                    <th className="p-3.5 font-bold">Confidence</th>
                    <th className="p-3.5 font-bold">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diseaseScans.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 text-slate-400">{d.created_at}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{d.farmer_name}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{d.crop}</td>
                      <td className="p-3.5 font-bold text-amber-900">{d.predicted_disease}</td>
                      <td className="p-3.5 text-slate-700">{d.confidence}</td>
                      <td className="p-3.5">
                        <Badge variant={d.severity === 'Severe' || d.severity === 'High' ? 'error' : d.severity === 'Moderate' ? 'warning' : 'success'} size="sm">
                          {d.severity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Farmer</th>
                    <th className="p-3.5 font-bold">Crop & Stage</th>
                    <th className="p-3.5 font-bold">Soil Moisture</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold">Water Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {irrigAdvisories.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 text-slate-400">{i.created_at}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{i.farmer_name}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{i.crop} ({i.growth_stage})</td>
                      <td className="p-3.5 font-bold text-slate-700">{i.soil_moisture}</td>
                      <td className="p-3.5">
                        <Badge variant={i.irrigation_status === 'NEEDS IRRIGATION' ? 'error' : i.irrigation_status === 'MONITOR' ? 'warning' : 'success'} size="sm">
                          {i.irrigation_status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-blue-900 font-semibold">{i.water_estimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
