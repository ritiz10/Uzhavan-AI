import React, { useState, useRef } from 'react';
import { 
  ScanLine, Upload, X, Camera, AlertTriangle, ShieldCheck, 
  Info, CheckCircle2, AlertCircle, RefreshCw, FileText, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';

export const DiseaseDetection = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const supportedCrops = [
    { value: 'Tomato', label: 'Tomato (Solanum lycopersicum)' },
    { value: 'Rice', label: 'Rice / Paddy (Oryza sativa)' },
    { value: 'Chilli', label: 'Chilli (Capsicum annuum)' },
    { value: 'Brinjal', label: 'Brinjal / Eggplant (Solanum melongena)' },
    { value: 'Cotton', label: 'Cotton (Gossypium hirsutum)' },
    { value: 'Groundnut', label: 'Groundnut / Peanut (Arachis hypogaea)' },
    { value: 'Banana', label: 'Banana (Musa acuminata)' },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must not exceed 10 MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick Synthetic Leaf Generator for instant 1-click test without external file
  const generateDemoLeaf = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (type === 'healthy') {
      ctx.fillStyle = '#22c55e'; // Lush green
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(150, 150, 100, 0, 2 * Math.PI);
      ctx.fill();
    } else if (type === 'spot') {
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#78350f'; // Dark blight lesions
      ctx.beginPath();
      ctx.arc(100, 100, 35, 0, 2 * Math.PI);
      ctx.arc(190, 180, 45, 0, 2 * Math.PI);
      ctx.arc(140, 220, 30, 0, 2 * Math.PI);
      ctx.fill();
    } else if (type === 'yellow') {
      ctx.fillStyle = '#eab308'; // Chlorosis yellow
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(150, 150, 80, 0, 2 * Math.PI);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `demo_${type}_leaf.jpg`, { type: 'image/jpeg' });
      handleFileSelect(file);
    }, 'image/jpeg');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload or capture a plant leaf image to analyze.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('crop_name', selectedCrop);

      const resp = await diseaseService.predictDisease(formData);
      setResult(resp);
    } catch (err) {
      setError(err.response?.data?.detail || 'Disease detection analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plant Disease Detection</h1>
          <Badge variant="warning" size="sm">Computer Vision Advisory</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan infected leaves to diagnose symptoms, assess disease severity, and receive biological management protocols.
        </p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Crop Selection (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader
              title="Upload Plant / Leaf Inspection Photo"
              subtitle="Capture leaf top or bottom showing lesions, spotting, or discoloration"
            />
            <CardBody className="space-y-4">
              <Select
                label="Target Crop"
                options={supportedCrops}
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              />

              {/* Drag and Drop Box or Image Preview */}
              {!previewUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? 'border-agri-500 bg-agri-50/60'
                      : 'border-slate-300 hover:border-agri-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  />

                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 text-agri-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    Click to upload or drag and drop leaf photo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WebP up to 10 MB &bull; Camera capture on mobile
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img
                    src={previewUrl}
                    alt="Leaf specimen"
                    className="w-full h-64 object-contain mx-auto"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded-full text-[11px] text-white backdrop-blur-sm">
                    {selectedFile?.name || 'Uploaded specimen'}
                  </div>
                </div>
              )}

              {/* Demo Sample Generator Pills for instant testing */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Or Test with Sample Diagnostic Leaf Patterns:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedCrop('Tomato'); generateDemoLeaf('spot'); }}
                    className="p-2 text-xs font-medium rounded-xl border border-slate-200 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-center transition-colors"
                  >
                    Blight Spot Pattern
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedCrop('Chilli'); generateDemoLeaf('yellow'); }}
                    className="p-2 text-xs font-medium rounded-xl border border-slate-200 bg-white hover:bg-yellow-50 text-slate-700 hover:text-yellow-900 text-center transition-colors"
                  >
                    Chlorosis / Curl
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedCrop('Rice'); generateDemoLeaf('healthy'); }}
                    className="p-2 text-xs font-medium rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-center transition-colors"
                  >
                    Healthy Specimen
                  </button>
                </div>
              </div>

              <Button
                size="md"
                className="w-full py-3 text-base"
                disabled={!selectedFile || analyzing}
                isLoading={analyzing}
                onClick={handleAnalyze}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Analyze Leaf Disease</span>
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Diagnostic Result Card (6 cols) */}
        <div className="lg:col-span-6">
          {result ? (
            <Card className="border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {result.crop} Diagnosis
                  </span>
                  <Badge variant={result.is_fallback ? 'warning' : 'success'} size="sm">
                    {result.is_fallback ? 'AI: Development Mode' : 'AI: Trained Model'}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between gap-4 mt-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {result.predicted_disease}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-amber-300">
                      {result.confidence_display}
                    </span>
                    <span className="text-[10px] text-slate-300 block uppercase font-medium">
                      Confidence
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Severity Assessment:</span>
                  <Badge
                    variant={
                      result.severity === 'Severe' || result.severity === 'High'
                        ? 'error'
                        : result.severity === 'Moderate'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {result.severity} Severity
                  </Badge>
                </div>
              </div>

              <CardBody className="p-6 space-y-4 text-xs">
                {/* Symptoms */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Observed Symptoms:
                  </h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {result.symptoms}
                  </p>
                </div>

                {/* Recommended Treatments */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Recommended Actions & Bio-Control:
                  </h4>
                  <p className="text-slate-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 leading-relaxed font-medium">
                    {result.recommendation}
                  </p>
                </div>

                {/* Preventive Strategy */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Long-Term Prevention Strategy:
                  </h4>
                  <p className="text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed">
                    {result.prevention}
                  </p>
                </div>

                {/* When to consult expert */}
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    When to Consult Agricultural Extension Officer:
                  </h4>
                  <p className="text-slate-600 bg-earth-50/70 p-3 rounded-xl border border-earth-200/60 leading-relaxed">
                    {result.expert_advisory}
                  </p>
                </div>

                {/* Mandatory Disclaimer */}
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
              <ScanLine className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Awaiting Leaf Inspection</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Upload or capture an image of a leaf displaying disease symptoms on the left to run AI diagnosis.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
