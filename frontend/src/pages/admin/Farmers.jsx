import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { TN_DISTRICTS } from '../../constants/tn_data';

export const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFarmers();
  }, [roleFilter]);

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
      });
      setFarmers(data);
    } catch (err) {
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFarmers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registered Farmers Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and search all registered agricultural practitioners and department officers.
          </p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by farmer name, email, or district..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: '', label: 'All Roles' },
                { value: 'farmer', label: 'Farmers Only' },
                { value: 'admin', label: 'Admins Only' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Searching users..." />
            </div>
          ) : farmers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No matching farmers or users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">User Name</th>
                    <th className="p-3.5 font-bold">Email</th>
                    <th className="p-3.5 font-bold">Mobile</th>
                    <th className="p-3.5 font-bold">District / Village</th>
                    <th className="p-3.5 font-bold">Role</th>
                    <th className="p-3.5 font-bold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farmers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3.5 text-slate-600">{u.email}</td>
                      <td className="p-3.5 text-slate-500">{u.phone || 'N/A'}</td>
                      <td className="p-3.5 text-slate-600">
                        {u.village ? `${u.village}, ` : ''}{u.district || 'Tamil Nadu'}
                      </td>
                      <td className="p-3.5">
                        <Badge variant={u.role === 'admin' ? 'earth' : 'primary'} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
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
