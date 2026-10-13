import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Wheat, Sparkles, AlertCircle, CheckCircle2, ChevronRight, 
  Droplets, Thermometer, ShieldAlert, Info, RotateCcw, Sprout, ArrowRight
} from 'lucide-react';
import { cropService } from '../services/cropService';
import { farmService } from '../services/farmService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { TN_DISTRICTS, TN_SOIL_TYPES, TN_SEASONS, TN_IRRIGATION_TYPES } from '../constants/tn_data';

export const CropRecommendation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFarmId = queryParams.get('farm_id');

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(initialFarmId || '');
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Form parameters
  const [formData, setFormData] = useState({
    nitrogen: 85,
    phosphorus: 48,
    potassium: 52,
    ph: 6.8,
    temperature: 31.0,
    humidity: 78.0,
    rainfall: 1100.0,
    soil_type: 'Alluvial Soil',
    district: 'Thanjavur',
    season: 'Samba (Main Season: Aug - Jan)',
    land_area: 2.0,
    irrigation_type: 'Canal / River Irrigation',
    previous_crop: 'Black Gram',
    water_availability: 'Adequate',
    organic_carbon: 0.65,
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFarms(false);
    }
  };

  const applyFarmDefaults = (farm) => {
    setFormData((prev) => ({
      ...prev,
      district: farm.district || prev.district,
      soil_type: farm.soil_type || prev.soil_type,
      season: farm.season || prev.season,
      land_area: farm.area || prev.land_area,
      irrigation_type: farm.irrigation_type || prev.irrigation_type,
      previous_crop: farm.previous_crop || prev.previous_crop,
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

  const handlePreset = (type) => {
    if (type === 'delta_paddy') {
      setFormData({
        ...formData,
        nitrogen: 95,
        phosphorus: 45,
        potassium: 50,
        ph: 6.8,
        temperature: 30.5,
        humidity: 84,
        rainfall: 1250,
        district: 'Thanjavur',
        soil_type: 'Alluvial Soil',
        season: 'Samba (Main Season: Aug - Jan)',
      });
    } else if (type === 'kongu_cotton') {
      setFormData({
        ...formData,
        nitrogen: 75,
        phosphorus: 38,
        potassium: 42,
        ph: 7.4,
        temperature: 33.0,
        humidity: 58,
        rainfall: 620,
        district: 'Coimbatore',
        soil_type: 'Black Cotton Soil (Regur)',
        season: 'Winter / Summer Irrigated',
      });
    } else if (type === 'dindigul_tomato') {
      setFormData({
        ...formData,
        nitrogen: 110,
        phosphorus: 72,
        potassium: 65,
        ph: 6.5,
        temperature: 26.5,
        humidity: 62,
        rainfall: 550,
        district: 'Dindigul',
        soil_type: 'Red Loam',
        season: 'Summer (Feb - May)',
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
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium,
        ph: formData.ph,
        temperature: formData.temperature,
        humidity: formData.humidity,
        rainfall: formData.rainfall,
        soil_type: formData.soil_type,
        district: formData.district,
        season: formData.season,
        land_area: formData.land_area,
        irrigation_type: formData.irrigation_type,
        previous_crop: formData.previous_crop,
        water_availability: formData.water_availability,
        organic_carbon: formData.organic_carbon,
      };

      const resp = await cropService.predictCrop(payload);
      setResult(resp);
      // Scroll smoothly down to result
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate crop recommendation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Crop Recommendation</h1>
            <Badge variant="primary" size="sm">TNAU Calibrated</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize your crop choice using soil macronutrients (N-P-K), pH, and Tamil Nadu agro-climatic conditions.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              placeholder="Autofill from registered farm..."
              options={farms.map((f) => ({ value: f.id, label: `${f.farm_name} (${f.district})` }))}
              value={selectedFarmId}
              onChange={handleFarmSelect}
            />
          </div>
        )}
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Preset Quick Fill Pills */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2">Quick Test Presets:</span>
        <button
          type="button"
          onClick={() => handlePreset('delta_paddy')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-agri-100 text-slate-700 hover:text-agri-900 border border-slate-200 transition-colors"
        >
          Cauvery Delta Paddy
        </button>
        <button
          type="button"
          onClick={() => handlePreset('kongu_cotton')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-agri-100 text-slate-700 hover:text-agri-900 border border-slate-200 transition-colors"
        >
          Kongu Cotton Dryland
        </button>
        <button
          type="button"
          onClick={() => handlePreset('dindigul_tomato')}
          className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-agri-100 text-slate-700 hover:text-agri-900 border border-slate-200 transition-colors"
        >
          Dindigul Horticulture Tomato
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Soil Test & Environmental Parameters"
              subtitle="Enter soil lab test values or farm estimates"
            />
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Soil Macronutrients (NPK) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-agri-600" />
                    <span>Soil Macronutrients (kg / hectare)</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Nitrogen (N)"
                      name="nitrogen"
                      type="number"
                      step="1"
                      required
                      value={formData.nitrogen}
                      onChange={handleInputChange}
                      helperText="Range: 10 - 250"
                    />
                    <Input
                      label="Phosphorus (P)"
                      name="phosphorus"
                      type="number"
                      step="1"
                      required
                      value={formData.phosphorus}
                      onChange={handleInputChange}
                      helperText="Range: 10 - 150"
                    />
                    <Input
                      label="Potassium (K)"
                      name="potassium"
                      type="number"
                      step="1"
                      required
                      value={formData.potassium}
                      onChange={handleInputChange}
                      helperText="Range: 10 - 200"
                    />
                  </div>
                </div>

                {/* 2. Soil pH & Climate */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-agri-600" />
                    <span>Soil Reaction & Ambient Climate</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      label="Soil pH"
                      name="ph"
                      type="number"
                      step="0.1"
                      required
                      value={formData.ph}
                      onChange={handleInputChange}
                      helperText="0 (Acidic) - 14"
                    />
                    <Input
                      label="Temperature (°C)"
                      name="temperature"
                      type="number"
                      step="0.5"
                      required
                      value={formData.temperature}
                      onChange={handleInputChange}
                      helperText="Ambient temp"
                    />
                    <Input
                      label="Humidity (%)"
                      name="humidity"
                      type="number"
                      step="1"
                      required
                      value={formData.humidity}
                      onChange={handleInputChange}
                      helperText="Relative humidity"
                    />
                    <Input
                      label="Rainfall (mm)"
                      name="rainfall"
                      type="number"
                      step="10"
                      required
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      helperText="Annual / Season"
                    />
                  </div>
                </div>

                {/* 3. Tamil Nadu Agro Context */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-agri-600" />
                    <span>Tamil Nadu Agricultural Context</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="District"
                      name="district"
                      options={TN_DISTRICTS}
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                    <Select
                      label="Soil Type"
                      name="soil_type"
                      options={TN_SOIL_TYPES}
                      value={formData.soil_type}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Select
                      label="Cropping Season"
                      name="season"
                      options={TN_SEASONS}
                      value={formData.season}
                      onChange={handleInputChange}
                    />
                    <Select
                      label="Irrigation Infrastructure"
                      name="irrigation_type"
                      options={TN_IRRIGATION_TYPES}
                      value={formData.irrigation_type}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full text-base py-3"
                    isLoading={submitting}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Get AI Recommendation</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: AI Recommendation Result (5 cols) */}
        <div className="lg:col-span-5">
          {result ? (
            <Card className="border-agri-200 shadow-lg overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 bg-gradient-to-br from-agri-900 to-agri-950 text-white relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-agri-200 uppercase tracking-wider">
                    Recommended Crop
                  </span>
                  <Badge variant={result.is_fallback ? 'warning' : 'success'} size="sm">
                    {result.is_fallback ? 'AI: Development Mode' : 'AI: Trained Model'}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between gap-4 mt-3">
                  <h3 className="text-3xl font-extrabold tracking-tight text-white">
                    {result.recommended_crop}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-agri-300">
                      {result.confidence_display}
                    </span>
                    <span className="text-[10px] text-agri-200 block uppercase font-medium">
                      Suitability Match
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-agri-800/80 flex items-center justify-between text-xs text-agri-100">
                  <span>Suitability: <strong>{result.suitability}</strong></span>
                  <span>Season: <strong>{result.expected_growing_season}</strong></span>
                </div>
              </div>

              <CardBody className="p-6 space-y-4 text-xs">
                {/* Agronomic Reasoning */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Why This Crop is Recommended:
                  </h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {result.reason}
                  </p>
                </div>

                {/* Water Requirement */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Water Requirement:
                  </h4>
                  <p className="text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    {result.water_requirement}
                  </p>
                </div>

                {/* Fertilizer Split Doses */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    TNAU Fertilizer Guidance:
                  </h4>
                  <p className="text-slate-600 bg-earth-50/60 p-2.5 rounded-xl border border-earth-200/60 leading-relaxed">
                    {result.fertilizer_guidance}
                  </p>
                </div>

                {/* Alternatives */}
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                      Viable Secondary Alternatives:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.alternatives.map((alt, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200"
                        >
                          {alt.crop} ({alt.confidence}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mandatory Advisory Notice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {result.disclaimer}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
              <Wheat className="w-12 h-12 text-agri-600 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Awaiting Soil Data</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Fill in your soil nutrient levels on the left or select a quick test preset to generate an AI crop recommendation.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
