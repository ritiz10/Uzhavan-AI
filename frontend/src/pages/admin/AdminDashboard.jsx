import React, { useState, useEffect } from 'react';
import { 
  Users, Tractor, Wheat, ScanLine, Droplets, ShieldCheck, 
  Activity, MapPin, Eye, ArrowUpRight, BarChart2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

const DISTRICT_COLORS = ['#16a34a', '#059669', '#0d9488', '#0284c7', '#d97706', '#8b5cf6'];
const CROP_COLORS = ['#22c55e', '#16a34a', '#15803d', '#3b82f6', '#f59e0b', '#ec4899'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Aggregating Directorate Metrics..." />
      </div>
    );
  }

  if (error || !stats) {
    return <Alert type="error">{error || 'Could not load statistics.'}</Alert>;
  }

  return (
    <div className="space-y-6">
      {/* Directorate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Agriculture Directorate Admin Dashboard
            </h1>
            <Badge variant="earth" size="sm">System Administration</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry across 38 districts of Tamil Nadu, AI recommendation volumes, and farmer registrations.
          </p>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Farmers" value={stats.total_farmers} icon={Users} color="agri" />
        <StatCard title="Farms" value={stats.total_farms} icon={Tractor} color="earth" />
        <StatCard title="Predictions" value={stats.total_crop_predictions} icon={Wheat} color="agri" />
        <StatCard title="Disease Scans" value={stats.total_disease_scans} icon={ScanLine} color="amber" />
        <StatCard title="Advisories" value={stats.total_irrigation_advisories} icon={Droplets} color="blue" />
        <StatCard title="Total Users" value={stats.active_users_count} icon={ShieldCheck} color="purple" />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Farmers by District */}
        <Card>
          <CardHeader
            title="Farmers Distribution by District"
            subtitle="Registered farming community spread across Tamil Nadu"
          />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts?.districts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {(stats.charts?.districts || []).map((entry, index) => (
                    <Cell key={`dist-${index}`} fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Chart 2: Recommended Crop Distribution */}
        <Card>
          <CardHeader
            title="Crop Recommendation Frequency"
            subtitle="AI recommendation model output distribution"
          />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts?.crops || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats.charts?.crops || []).map((entry, index) => (
                    <Cell key={`crop-cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Tables: Recent Registrations & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Recent Farmers */}
        <Card>
          <CardHeader title="Recently Registered Farmers" />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_farmers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="p-3 text-slate-600">{u.district}</td>
                      <td className="p-3 text-slate-500">{u.phone || u.email}</td>
                      <td className="p-3 text-slate-400">{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Table 2: Recent Crop Predictions */}
        <Card>
          <CardHeader title="Recent AI Crop Recommendations" />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Farmer</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Crop</th>
                    <th className="p-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900">{p.farmer}</td>
                      <td className="p-3 text-slate-600">{p.district}</td>
                      <td className="p-3 font-bold text-agri-700">{p.recommended_crop}</td>
                      <td className="p-3 text-slate-600">{p.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
