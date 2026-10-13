import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Droplets, CloudRain, Clock, AlertTriangle, CheckCircle2, 
  Info, Sparkles, Thermometer, Wind, Compass
} from 'lucide-react';
import { irrigationService } from '../services/irrigationService';
import { farmService } from '../services/farmService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { 
  TN_CROPS, CROP_GROWTH_STAGES, TN_SOIL_TYPES, TN_IRRIGATION_TYPES 
} from '../constants/tn_data';

export const IrrigationAdvisory = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFarmId = queryParams.get('farm_id');

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(initialFarmId || '');

  const [formData, setFormData] = useState({
    crop: 'Paddy',
    growth_stage: 'Tillering',
    soil_type: 'Alluvial Soil',
    soil_moisture: 32,
    temperature: 32.0,
    humidity: 68.0,
    rainfall: 0.0,
    rain_probability: 15.0,
    land_area: 2.0,
    irrigation_type: 'Canal / River Irrigation',
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const farmList = await farmService.getFarms();
      setFarms(farmList);
      if (initialFarmId) {
        const found = farmList.find((f) => f.id === parseInt(initialFarmId));
        if (found) applyFarmDefaults(found);
      } else if (farmList.length > 0) {
        setSelectedFarmId(farmList[0].id.toString());
        applyFarmDefaults(farmList[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyFarmDefaults = (farm) => {
    setFormData((prev) => ({
      ...prev,
      crop: farm.current_crop || prev.crop,
      soil_type: farm.soil_type || prev.soil_type,
      land_area: farm.area || prev.land_area,
      irrigation_type: farm.irrigation_type || prev.irrigation_type,
    }));
  };

  const handleFarmSelect = (e) => {
    const id = e.target.value;
    setSelectedFarmId(id);
    const farm = farms.find((f) => f.id === parseInt(id));
    if (farm) applyFarmDefaults(farm);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePreset = (scenario) => {
    if (scenario === 'dry_stress') {
      setFormData({
        ...formData,
        crop: 'Paddy',
        growth_stage: 'Tillering',
        soil_moisture: 26,
        rain_probability: 10,
        temperature: 34,
      });
    } else if (scenario === 'rain_delay') {
      setFormData({
        ...formData,
        crop: 'Tomato',
        growth_stage: 'Flowering',
        soil_moisture: 42,
        rain_probability: 75,
        rainfall: 8,
        temperature: 28,
      });
    } else if (scenario === 'adequate') {
      setFormData({
        ...formData,
        crop: 'Sugarcane',
        growth_stage: 'Vegetative',
        soil_moisture: 68,
        rain_probability: 20,
        temperature: 31,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        farm_id: selectedFarmId ? parseInt(selectedFarmId) : null,
        crop: formData.crop,
        growth_stage: formData.growth_stage,
        soil_type: formData.soil_type,
        soil_moisture: formData.soil_moisture,
        temperature: formData.temperature,
        humidity: formData.humidity,
        rainfall: formData.rainfall,
        rain_probability: formData.rain_probability,
        land_area: formData.land_area,
        irrigation_type: formData.irrigation_type,
      };

      const resp = await irrigationService.generateAdvisory(payload);
      setResult(resp);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compute irrigation schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Irrigation Advisory</h1>
            <Badge variant="info" size="sm">Rule/AI Hybrid Engine</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize agricultural water usage based on soil moisture thresholds, crop phenological stage, and rain forecasts.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              placeholder="Autofill from registered farm..."
              options={farms.map((f) => ({ value: f.id, label: `${f.farm_name} (${f.crop || 'Farm'})` }))}
              value={selectedFarmId}
              onChange={handleFarmSelect}
            />
          </div>
        )}
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Preset Pills */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2">Scenario Presets:</span>
        <button
          type="button"
          onClick={() => handlePreset('dry_stress')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors"
        >
          Depleted Moisture (&lt; 30%)
        </button>
        <button
          type="button"
          onClick={() => handlePreset('rain_delay')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 transition-colors"
        >
          Heavy Rain Impending (&gt; 70%)
        </button>
        <button
          type="button"
          onClick={() => handlePreset('adequate')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 border border-slate-200 transition-colors"
        >
          Adequate Moisture Reserve
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Crop & Soil Moisture Monitoring Inputs"
              subtitle="Current readings from in-situ tensiometers or localized farm observation"
            />
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Current Crop"
                    name="crop"
                    required
                    options={TN_CROPS}
                    value={formData.crop}
                    onChange={handleInputChange}
                  />

                  <Select
                    label="Phenological Growth Stage"
                    name="growth_stage"
                    required
                    options={CROP_GROWTH_STAGES}
                    value={formData.growth_stage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Soil Type"
                    name="soil_type"
                    options={TN_SOIL_TYPES}
                    value={formData.soil_type}
                    onChange={handleInputChange}
                  />

                  <Select
                    label="Irrigation System"
                    name="irrigation_type"
                    options={TN_IRRIGATION_TYPES}
                    value={formData.irrigation_type}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Soil Moisture Slider + Numeric Input */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Volumetric Soil Moisture (%)
                    </label>
                    <span className="text-sm font-bold text-agri-700 px-2.5 py-0.5 bg-agri-100 rounded-lg">
                      {formData.soil_moisture}%
                    </span>
                  </div>
                  <input
                    type="range"
                    name="soil_moisture"
                    min="5"
                    max="95"
                    step="1"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-agri-600"
                    value={formData.soil_moisture}
                    onChange={handleInputChange}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Critical Stress (&lt;30%)</span>
                    <span>Allowable Depletion (35-55%)</span>
                    <span>Field Capacity (&gt;60%)</span>
                  </div>
                </div>

                {/* Weather & Farm Area */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Land Area (Acres)"
                    name="land_area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.land_area}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Temp (°C)"
                    name="temperature"
                    type="number"
                    step="0.5"
                    value={formData.temperature}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Humidity (%)"
                    name="humidity"
                    type="number"
                    step="1"
                    value={formData.humidity}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Rain Forecast (%)"
                    name="rain_probability"
                    type="number"
                    step="1"
                    value={formData.rain_probability}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full py-3 text-base"
                    isLoading={submitting}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Generate Irrigation Advisory</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Decision Advisory Result (5 cols) */}
        <div className="lg:col-span-5">
          {result ? (
            <Card className="border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-300">
              <div
                className={`p-6 text-white relative ${
                  result.irrigation_status === 'NEEDS IRRIGATION'
                    ? 'bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950'
                    : result.irrigation_status === 'MONITOR'
                    ? 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950'
                    : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    Decision Status
                  </span>
                  <Badge
                    variant={
                      result.irrigation_status === 'NEEDS IRRIGATION'
                        ? 'error'
                        : result.irrigation_status === 'MONITOR'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {result.growth_stage}
                  </Badge>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3">
                  {result.irrigation_status}
                </h3>

                <p className="text-xs text-white/90 mt-2 font-medium leading-relaxed">
                  {result.recommended_action}
                </p>
              </div>

              <CardBody className="p-6 space-y-4 text-xs">
                {/* Water Volume */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    Estimated Water Requirement:
                  </span>
                  <p className="text-sm font-extrabold text-blue-950 mt-0.5">
                    {result.water_estimate}
                  </p>
                </div>

                {/* Timing */}
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Optimal Application Window:
                    </span>
                    <span className="text-slate-600 block mt-0.5 font-medium">
                      {result.recommended_timing}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Agronomic Rationale:
                  </h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {result.reason}
                  </p>
                </div>

                {/* Weather Consideration */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Meteorological Consideration:
                  </h4>
                  <p className="text-slate-600 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                    {result.weather_consideration}
                  </p>
                </div>

                {/* Editable Assumptions */}
                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-700 block mb-0.5">Model Assumptions:</span>
                  <p className="leading-relaxed italic">{result.assumptions_note}</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
              <Droplets className="w-12 h-12 text-blue-500 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Awaiting Soil Moisture Inputs</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Adjust the volumetric soil moisture slider and crop growth stage on the left to evaluate today's irrigation need.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
