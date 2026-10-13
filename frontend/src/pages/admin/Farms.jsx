import React, { useState, useEffect } from 'react';
import { Tractor, MapPin, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { TN_DISTRICTS } from '../../constants/tn_data';

export const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFarms();
  }, [districtFilter]);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFarms({
        district: districtFilter || undefined,
      });
      setFarms(data);
    } catch (err) {
      setError('Failed to fetch farm directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Parcels Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of agricultural land acreage, soil classifications, and water infrastructure across Tamil Nadu.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            placeholder="All Districts..."
            options={TN_DISTRICTS}
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Loading farm plots..." />
            </div>
          ) : farms.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No farm plots registered for this criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Farm Plot</th>
                    <th className="p-3.5 font-bold">District / Taluk</th>
                    <th className="p-3.5 font-bold">Area</th>
                    <th className="p-3.5 font-bold">Soil Classification</th>
                    <th className="p-3.5 font-bold">Irrigation Infrastructure</th>
                    <th className="p-3.5 font-bold">Current Crop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farms.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{f.farm_name}</td>
                      <td className="p-3.5 text-slate-600">
                        {f.taluk ? `${f.taluk}, ` : ''}{f.district}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {f.area} {f.area_unit}
                      </td>
                      <td className="p-3.5 text-slate-600">{f.soil_type || 'Red Loam'}</td>
                      <td className="p-3.5 text-slate-600">{f.irrigation_type || 'Drip'}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-agri-700 bg-agri-50 px-2.5 py-0.5 rounded-full border border-agri-200">
                          {f.current_crop || 'Fallow'}
                        </span>
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
