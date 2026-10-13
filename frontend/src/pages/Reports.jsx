import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, Download, Sprout, Wheat, ScanLine, 
  Droplets, MapPin, Calendar, CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import { farmService } from '../services/farmService';
import { cropService } from '../services/cropService';
import { diseaseService } from '../services/diseaseService';
import { irrigationService } from '../services/irrigationService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export const Reports = () => {
  const [reportType, setReportType] = useState('summary');
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [irrigs, setIrrigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('tn_agri_user') || '{}');

  useEffect(() => {
    loadAllReportData();
  }, []);

  const loadAllReportData = async () => {
    setLoading(true);
    try {
      const [farmList, cropList, diseaseList, irrigList] = await Promise.all([
        farmService.getFarms(),
        cropService.getHistory(20),
        diseaseService.getHistory(20),
        irrigationService.getHistory(20),
      ]);
      setFarms(farmList);
      setCrops(cropList);
      setDiseases(diseaseList);
      setIrrigs(irrigList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Agricultural Advisory Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export printable agronomic dossiers, soil test audits, and irrigation budgets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'summary', label: 'Complete Farm Summary Report' },
              { value: 'crops', label: 'Crop Recommendations Report' },
              { value: 'diseases', label: 'Plant Disease Diagnostic Report' },
              { value: 'irrigation', label: 'Irrigation & Water Budget Report' },
            ]}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-64"
          />

          <Button onClick={handlePrint} icon={Printer} size="md">
            Print / Save PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center no-print">
          <Spinner size="lg" label="Compiling report data..." />
        </div>
      ) : (
        /* Printable Report Sheet */
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-agri-700 flex items-center justify-center text-white font-bold">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    TAMIL NADU SMART FARMING ASSISTANT
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  AI-Powered Precision Decision Support System &bull; TNAU Agronomic Standards
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p><strong>Report Date:</strong> {new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Document ID:</strong> TN-AGRI-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>

            {/* Farmer Profile Info in Header */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Farmer Name:</span>
                <span className="font-bold text-slate-900">{currentUser.name || 'Muthuvel K'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">District:</span>
                <span className="font-bold text-slate-900">{currentUser.district || 'Thanjavur'}, TN</span>
              </div>
              <div>
                <span className="text-slate-400 block">Village / Taluk:</span>
                <span className="font-bold text-slate-900">{currentUser.village || 'Papanasam'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Registered Parcels:</span>
                <span className="font-bold text-slate-900">{farms.length} Plots</span>
              </div>
            </div>
          </div>

          {/* Section: Farm Parcels */}
          {(reportType === 'summary' || reportType === 'farms') && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-agri-600" />
                <span>1. Registered Agricultural Holdings</span>
              </h3>
              {farms.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No farm parcels recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 font-bold text-slate-700">Farm Name</th>
                        <th className="p-2.5 font-bold text-slate-700">District / Taluk</th>
                        <th className="p-2.5 font-bold text-slate-700">Area</th>
                        <th className="p-2.5 font-bold text-slate-700">Soil Type</th>
                        <th className="p-2.5 font-bold text-slate-700">Water Source</th>
                        <th className="p-2.5 font-bold text-slate-700">Standing Crop</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {farms.map((f) => (
                        <tr key={f.id}>
                          <td className="p-2.5 font-semibold text-slate-900">{f.farm_name}</td>
                          <td className="p-2.5 text-slate-600">{f.taluk ? `${f.taluk}, ` : ''}{f.district}</td>
                          <td className="p-2.5 text-slate-900 font-bold">{f.area} {f.area_unit}</td>
                          <td className="p-2.5 text-slate-600">{f.soil_type || 'Red Loam'}</td>
                          <td className="p-2.5 text-slate-600">{f.water_source || 'Borewell'}</td>
                          <td className="p-2.5 text-agri-700 font-semibold">{f.current_crop || 'Unspecified'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section: Crop Recommendations */}
          {(reportType === 'summary' || reportType === 'crops') && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-agri-600" />
                <span>2. AI Crop Recommendations & Fertilizer Schedules</span>
              </h3>
              {crops.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No crop recommendations generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {crops.slice(0, 3).map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-extrabold text-sm text-slate-900">
                          Recommended: {c.recommended_crop} ({c.confidence_display} Confidence)
                        </span>
                        <span className="text-slate-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-2 leading-relaxed"><strong>Agronomic Rationale:</strong> {c.reason}</p>
                      <p className="text-slate-700 mt-1 leading-relaxed"><strong>Fertilizer Protocol:</strong> {c.fertilizer_guidance}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Disease Diagnoses */}
          {(reportType === 'summary' || reportType === 'diseases') && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-amber-600" />
                <span>3. Plant Disease Diagnostic Log</span>
              </h3>
              {diseases.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No disease detections recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 font-bold text-slate-700">Date</th>
                        <th className="p-2.5 font-bold text-slate-700">Crop</th>
                        <th className="p-2.5 font-bold text-slate-700">Diagnosis</th>
                        <th className="p-2.5 font-bold text-slate-700">Severity</th>
                        <th className="p-2.5 font-bold text-slate-700">Prescribed Bio-Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {diseases.slice(0, 5).map((d) => (
                        <tr key={d.id}>
                          <td className="p-2.5 text-slate-500">{new Date(d.created_at).toLocaleDateString()}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{d.crop}</td>
                          <td className="p-2.5 font-bold text-amber-900">{d.predicted_disease}</td>
                          <td className="p-2.5 font-semibold text-slate-700">{d.severity}</td>
                          <td className="p-2.5 text-slate-600 max-w-xs truncate">{d.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section: Irrigation Advisories */}
          {(reportType === 'summary' || reportType === 'irrigation') && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>4. Irrigation Schedules & Water Budget</span>
              </h3>
              {irrigs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No irrigation schedules on record.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 font-bold text-slate-700">Date</th>
                        <th className="p-2.5 font-bold text-slate-700">Crop & Stage</th>
                        <th className="p-2.5 font-bold text-slate-700">Status</th>
                        <th className="p-2.5 font-bold text-slate-700">Volume</th>
                        <th className="p-2.5 font-bold text-slate-700">Optimal Window</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {irrigs.slice(0, 5).map((i) => (
                        <tr key={i.id}>
                          <td className="p-2.5 text-slate-500">{new Date(i.created_at).toLocaleDateString()}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{i.crop} ({i.growth_stage})</td>
                          <td className="p-2.5 font-bold text-slate-900">{i.irrigation_status}</td>
                          <td className="p-2.5 text-blue-800 font-bold">{i.water_estimate}</td>
                          <td className="p-2.5 text-slate-600">{i.recommended_timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Report Footer & Official Disclaimer */}
          <div className="border-t-2 border-slate-900 pt-6 mt-12 text-[11px] text-slate-500 space-y-2">
            <p>
              <strong>Notice:</strong> This report is machine-generated by the AI-Based Tamil Nadu Smart Farming Assistant based on farmer-submitted field inputs, sensor telemetry, and regional agronomic rules. It serves as an advisory decision support instrument.
            </p>
            <div className="flex items-center justify-between pt-4">
              <span>Generated via TN Smart Farming Portal</span>
              <span>Authorized System Signature &bull; Verified Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
