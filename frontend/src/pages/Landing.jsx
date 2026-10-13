import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, Wheat, ScanLine, Droplets, CloudSun, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronRight, MapPin, Database, Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-sm shadow-agri-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
                TN Smart Farming
              </span>
              <span className="text-[10px] font-medium text-agri-700 block uppercase tracking-wider mt-0.5">
                AI Agricultural Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Farmer Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-agri-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-agri-100 border border-agri-200 text-agri-800 text-xs font-semibold uppercase tracking-wider mb-6">
            <MapPin className="w-3.5 h-3.5 text-agri-600" />
            <span>Dedicated to Tamil Nadu Farmers &bull; Cauvery Delta to Kongu Nadu</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Farming Powered by <span className="text-agri-600">Artificial Intelligence</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            AI-powered crop recommendations, plant disease detection and intelligent irrigation advisory designed specifically for Tamil Nadu's agro-climatic zones and farming communities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3">
                <span>Farmer Login</span>
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-bold text-agri-700">38</p>
              <p className="text-xs text-slate-500 font-medium">Tamil Nadu Districts</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-bold text-agri-700">93.5%</p>
              <p className="text-xs text-slate-500 font-medium">Crop Match Accuracy</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-bold text-agri-700">7 Major</p>
              <p className="text-xs text-slate-500 font-medium">Crops Vision Diagnostics</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-bold text-agri-700">30%+</p>
              <p className="text-xs text-slate-500 font-medium">Estimated Water Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core AI Modules Showcase */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-agri-600 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              Integrated Agronomic Intelligence Suite
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Precision decision support tools bridging the gap between soil laboratories, satellite weather, and farmer fields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Crop Recommendation */}
            <Card className="p-8 hover:shadow-lg transition-all border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center mb-6">
                  <Wheat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Crop Recommendation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Machine learning model evaluating soil Nitrogen, Phosphorus, Potassium, soil pH, ambient temperature, humidity, and rainfall to recommend optimal Tamil Nadu crops with full agronomic justification.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
                  <span>Kuruvai, Samba & Navarai season alignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
                  <span>Fertilizer split dose advice (Urea, SSP, MOP)</span>
                </li>
              </ul>
            </Card>

            {/* Feature 2: Disease Detection */}
            <Card className="p-8 hover:shadow-lg transition-all border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Plant Disease Detection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Computer vision image diagnosis for Paddy Blast, Tomato Blight, Chilli Leaf Curl, Brinjal Little Leaf, Cotton Blight, and Banana Sigatoka with symptoms, severity, and verified bio-control recommendations.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Severity assessment & prevention guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Responsible agronomist escalation protocols</span>
                </li>
              </ul>
            </Card>

            {/* Feature 3: Smart Irrigation */}
            <Card className="p-8 hover:shadow-lg transition-all border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Irrigation Advisory</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Rule-based and environmental water budgeting engine. Computes precise irrigation status (NEEDS IRRIGATION, MONITOR, NO IMMEDIATE IRRIGATION) based on soil moisture, rainfall forecasts, and crop growth stage.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Soil holding capacity (Black Cotton vs Red Loam)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Rain forecast delay logic to prevent waterlogging</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Tamil Nadu Agriculture Focus */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth-100 text-earth-800 text-xs font-semibold mb-4">
                <Award className="w-3.5 h-3.5 text-earth-700" />
                <span>Regional Agronomic Calibration</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                Built Specifically for Tamil Nadu's Diverse Agro-Ecological Zones
              </h2>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Generic agricultural apps treat soil and rainfall uniformly. Our assistant is specifically calibrated to the agro-climatic zones of Tamil Nadu — from the Cauvery Delta alluvial rice belt to the Kongu cotton drylands and Southern rainfed millet tracts.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Cauvery Delta Zone (Thanjavur, Tiruvarur, Nagapattinam)</h4>
                    <p className="text-xs text-slate-500">Fine-tuned for Kuruvai and Samba paddy cycles, canal irrigation water management, and blast prevention.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Western Zone (Coimbatore, Erode, Tiruppur)</h4>
                    <p className="text-xs text-slate-500">Precision drip irrigation guidance for cotton, turmeric, coconut, and maize under Red Loam and Regur soils.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Southern & North-Western Zones (Madurai, Salem, Dindigul)</h4>
                    <p className="text-xs text-slate-500">Vegetable horticulture protection (Tomato, Chilli, Brinjal) and dryland groundnut and pulse advisory.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-agri-600" />
                <span>Localized Weather & Seasonal Rules</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Supported Cropping Seasons</span>
                  <span className="font-semibold text-agri-700">Kuruvai, Samba, Navarai, Summer, Kharif, Rabi</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Districts Supported</span>
                  <span className="font-semibold text-agri-700">All 38 Revenue Districts</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">AI Model Framework</span>
                  <span className="font-semibold text-agri-700">Scikit-Learn Random Forest + Vision Heuristics</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Advisory Integrity</span>
                  <span className="font-semibold text-agri-700">Zero Fabricated Yield Claims</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold text-agri-600 uppercase tracking-widest">
            Simple 3-Step Workflow
          </h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            How Tamil Nadu Farmers Use This Platform
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-agri-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Create Your Farm Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your farm plot details, select your district (e.g., Thanjavur), taluk, soil type (Alluvial, Red Loam, etc.), and current water source.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-agri-600 text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Input Soil or Upload Leaf Photo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your soil test N-P-K & pH values for precision crop recommendation, or snap a phone photo of an infected leaf to analyze disease symptoms.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-agri-600 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Receive Actionable Advisory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get scientifically grounded recommendations: water volume in litres, fertilizer schedule, safe disease bio-control measures, and harvest forecasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-agri-600 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-base block">
                  AI-Based Tamil Nadu Smart Farming Assistant
                </span>
                <span className="text-xs text-slate-400 block">
                  Agricultural Decision Support System
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <Link to="/login" className="hover:text-white transition-colors">Farmer Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">New Registration</Link>
              <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API Docs (Swagger)</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} AI-Based Tamil Nadu Smart Farming Assistant. All rights reserved.</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Advisory tool intended to assist agricultural planning. Follow local Tamil Nadu Agricultural University (TNAU) and District Agriculture Department guidelines.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
