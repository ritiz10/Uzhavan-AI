import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wheat, ScanLine, Droplets, CloudSun, Tractor, AlertTriangle,
  ArrowRight, CheckCircle2, TrendingUp, Sparkles, MapPin, Wind, Thermometer, Droplet
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';

const CROP_COLORS = ['#16a34a', '#059669', '#0d9488', '#0284c7', '#d97706', '#ca8a04'];
const SEVERITY_COLORS = {
  None: '#16a34a',
  Moderate: '#d97706',
  High: '#dc2626',
  Severe: '#7f1d1d'
};

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard summary. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading agricultural insights..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert type="error" className="my-6">
        {error || 'Unable to load dashboard.'}
      </Alert>
    );
  }

  const { user_name, district, primary_farm, weather, insights, recent_activities, charts } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-agri-900 via-agri-800 to-agri-950 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-agri-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-700/60 border border-agri-600/50 text-agri-200 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-agri-300" />
              <span>AI Farm Advisory Ready &bull; Tamil Nadu Agri System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vanakkam, {user_name}!
            </h1>
            <p className="text-sm text-agri-100 mt-1 max-w-2xl leading-relaxed">
              {primary_farm ? (
                <>
                  Monitoring <strong>{primary_farm.farm_name}</strong> ({primary_farm.area} {primary_farm.area_unit}) in <strong>{primary_farm.district}</strong>. Current crop: <strong>{primary_farm.current_crop}</strong>.
                </>
              ) : (
                'You have not added any farm plots yet. Create your first farm to unlock tailored precision irrigation and crop guidance.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/crop-recommendation">
              <Button variant="secondary" size="sm" className="bg-white hover:bg-slate-100 text-slate-900 border-none font-semibold">
                Recommend Crop
              </Button>
            </Link>
            <Link to="/disease-detection">
              <Button variant="primary" size="sm" className="bg-agri-600 hover:bg-agri-500 text-white font-semibold">
                Scan Leaf Disease
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 3 Quick AI Insights + Local Weather Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Insight 1: Recommended Crop */}
        <Card className="p-5 border-l-4 border-l-agri-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top AI Crop</span>
            <Wheat className="w-5 h-5 text-agri-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2 truncate">
            {insights.recommended_crop}
          </p>
          <p className="text-xs text-slate-500 mt-1">Based on soil NPK & season</p>
        </Card>

        {/* Insight 2: Disease Status */}
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disease Risk</span>
            <ScanLine className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">
            {insights.disease_risk}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {insights.total_scans > 0 ? `${insights.total_scans} scans recorded` : 'No scans yet'}
          </p>
        </Card>

        {/* Insight 3: Irrigation Status */}
        <Card className="p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Irrigation</span>
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-base font-extrabold mt-2 truncate ${
            insights.irrigation_status === 'NEEDS IRRIGATION' ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {insights.irrigation_status}
          </p>
          <p className="text-xs text-slate-500 mt-1">Real-time water advisory</p>
        </Card>

        {/* Weather Quick Card */}
        <Card className="p-5 border-l-4 border-l-teal-600 bg-gradient-to-br from-teal-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{weather?.district || 'TN'} Weather</span>
            <CloudSun className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{weather?.temperature}°C</span>
            <span className="text-xs font-medium text-slate-500">{weather?.condition}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <Droplet className="w-3 h-3 text-blue-500" /> {weather?.humidity}% Hum
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-slate-400" /> {weather?.rain_probability}% Rain
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left (Farm Summary & Charts) + Right (Recent Activities & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Overview Card */}
          {primary_farm ? (
            <Card>
              <CardHeader
                title="Primary Farm Details"
                subtitle={`Registered parcel in ${primary_farm.district} District`}
                action={
                  <Link to="/farms">
                    <Button variant="outline" size="sm">Manage Farms</Button>
                  </Link>
                }
              />
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Total Land Area</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {primary_farm.area} {primary_farm.area_unit}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Soil Type</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                      {primary_farm.soil_type || 'Red Loam'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Irrigation System</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                      {primary_farm.irrigation_type || 'Drip Irrigation'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Water Source</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                      {primary_farm.water_source || 'Borewell'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="p-6 text-center border-dashed border-2">
              <Tractor className="w-10 h-10 text-agri-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-base">No Farms Configured</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Adding your farm allows the AI decision engine to calibrate soil type, water source, and Tamil Nadu weather alerts for your exact plot.
              </p>
              <Link to="/farms">
                <Button size="sm">Add Farm Now</Button>
              </Link>
            </Card>
          )}

          {/* Visual Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Crop Predictions Distribution */}
            <Card>
              <CardHeader
                title="Crop Recommendations"
                subtitle="Distribution of crops predicted for your soil"
              />
              <CardBody className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.crops || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(charts?.crops || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Chart 2: Disease Diagnostic Breakdown */}
            <Card>
              <CardHeader
                title="Leaf Scan Diagnostics"
                subtitle="Health vs Disease Severity breakdown"
              />
              <CardBody className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.diseases || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {(charts?.diseases || []).map((entry, index) => (
                        <Cell key={`sev-${index}`} fill={SEVERITY_COLORS[entry.name] || '#16a34a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right Column: Quick Actions + Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader title="Quick Advisory Actions" />
            <CardBody className="space-y-2.5">
              <Link
                to="/crop-recommendation"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-agri-300 hover:bg-agri-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-agri-100 text-agri-700">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-agri-800">Recommend Crop</h4>
                    <p className="text-[11px] text-slate-500">Run soil N-P-K & pH optimization</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-agri-600 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/disease-detection"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-800">Detect Plant Disease</h4>
                    <p className="text-[11px] text-slate-500">Upload plant leaf photo for diagnosis</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/irrigation"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-800">Check Irrigation</h4>
                    <p className="text-[11px] text-slate-500">Calculate water requirement & schedule</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardBody>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader
              title="Recent Advisory Activity"
              subtitle="Latest predictions, scans and schedules"
              action={
                <Link to="/history" className="text-xs font-medium text-agri-600 hover:text-agri-700">
                  View All
                </Link>
              }
            />
            <CardBody className="divide-y divide-slate-100 p-0">
              {recent_activities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No activity recorded yet. Run a crop recommendation or disease scan above.
                </div>
              ) : (
                recent_activities.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {item.subtitle}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <Badge variant={item.status_type === 'error' ? 'error' : item.status_type === 'warning' ? 'warning' : 'success'} size="sm">
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
