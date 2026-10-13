import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tractor, Plus, Edit2, Trash2, MapPin, Droplets, Wheat, 
  Layers, Calendar, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { farmService } from '../services/farmService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  TN_DISTRICTS, TN_DISTRICT_TALUKS, TN_SOIL_TYPES, 
  TN_IRRIGATION_TYPES, TN_SEASONS, TN_CROPS 
} from '../constants/tn_data';

export const MyFarm = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    farm_name: '',
    district: 'Thanjavur',
    taluk: 'Papanasam',
    village: '',
    area: 2.0,
    area_unit: 'Acres',
    soil_type: 'Alluvial Soil',
    irrigation_type: 'Drip Irrigation',
    water_source: 'Borewell / Tube Well',
    current_crop: 'Paddy',
    previous_crop: 'Black Gram',
    season: 'Samba (Main Season: Aug - Jan)',
  });

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await farmService.getFarms();
      setFarms(data);
    } catch (err) {
      setError('Failed to load farms.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    const taluks = TN_DISTRICT_TALUKS[selectedDistrict] || [];
    setFormData({
      ...formData,
      district: selectedDistrict,
      taluk: taluks[0] || '',
    });
  };

  const openAddModal = () => {
    setEditingFarm(null);
    setFormData({
      farm_name: '',
      district: 'Thanjavur',
      taluk: 'Papanasam',
      village: '',
      area: 2.0,
      area_unit: 'Acres',
      soil_type: 'Alluvial Soil',
      irrigation_type: 'Drip Irrigation',
      water_source: 'Borewell / Tube Well',
      current_crop: 'Paddy',
      previous_crop: 'Black Gram',
      season: 'Samba (Main Season: Aug - Jan)',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      farm_name: farm.farm_name,
      district: farm.district,
      taluk: farm.taluk || '',
      village: farm.village || '',
      area: farm.area,
      area_unit: farm.area_unit,
      soil_type: farm.soil_type || 'Red Loam',
      irrigation_type: farm.irrigation_type || 'Drip Irrigation',
      water_source: farm.water_source || 'Borewell',
      current_crop: farm.current_crop || '',
      previous_crop: farm.previous_crop || '',
      season: farm.season || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveFarm = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      if (editingFarm) {
        await farmService.updateFarm(editingFarm.id, formData);
        setSuccess(`Farm "${formData.farm_name}" updated successfully.`);
      } else {
        await farmService.createFarm(formData);
        setSuccess(`Farm "${formData.farm_name}" registered successfully.`);
      }
      setIsModalOpen(false);
      loadFarms();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save farm details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await farmService.deleteFarm(deleteId);
      setSuccess('Farm deleted successfully.');
      setDeleteId(null);
      loadFarms();
    } catch (err) {
      setError('Failed to delete farm.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const currentTaluks = TN_DISTRICT_TALUKS[formData.district] || [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Farms Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your agricultural land parcels, soil profiles, and irrigation infrastructure.
          </p>
        </div>

        <Button onClick={openAddModal} icon={Plus} size="md">
          Add New Farm
        </Button>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading farm parcels..." />
        </div>
      ) : farms.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title="No farms registered yet"
          description="Register your agricultural land to unlock Tamil Nadu agro-climatic predictions, soil NPK analysis, and customized irrigation schedules."
          actionText="Add Your First Farm"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <Card key={farm.id} hover className="flex flex-col justify-between overflow-hidden">
              <div>
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-2 bg-gradient-to-r from-agri-50/40 to-transparent">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{farm.farm_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                      <span>{farm.taluk ? `${farm.taluk}, ` : ''}{farm.district}</span>
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {farm.area} {farm.area_unit}
                  </Badge>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Soil Type</span>
                    <span className="font-semibold text-slate-800">{farm.soil_type || 'Red Loam'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Irrigation Method</span>
                    <span className="font-semibold text-slate-800">{farm.irrigation_type || 'Drip'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Water Source</span>
                    <span className="font-semibold text-slate-800">{farm.water_source || 'Borewell'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current Standing Crop</span>
                    <span className="font-semibold text-agri-700 bg-agri-50 px-2 py-0.5 rounded-full border border-agri-200">
                      {farm.current_crop || 'Fallow / Unspecified'}
                    </span>
                  </div>

                  {farm.season && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span>Season:</span>
                      <span>{farm.season}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(farm)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                    title="Edit Farm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(farm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1"
                    onClick={() => navigate(`/irrigation?farm_id=${farm.id}`)}
                  >
                    Irrigate
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs py-1"
                    onClick={() => navigate(`/crop-recommendation?farm_id=${farm.id}`)}
                  >
                    Recommend
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Edit Farm Plot' : 'Register New Farm Plot'}
        subtitle="Specify land parameters for Tamil Nadu localized AI advisory calibration"
      >
        <form onSubmit={handleSaveFarm} className="space-y-4">
          <Input
            label="Farm / Plot Name"
            required
            placeholder="e.g. Cauvery Delta Paddy Parcel"
            value={formData.farm_name}
            onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="District (Tamil Nadu)"
              required
              options={TN_DISTRICTS}
              value={formData.district}
              onChange={handleDistrictChange}
            />

            <Select
              label="Taluk"
              options={currentTaluks}
              value={formData.taluk}
              onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Revenue Block"
              placeholder="e.g. Melur"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Land Area"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 1.0 })}
              />

              <Select
                label="Unit"
                options={['Acres', 'Hectares', 'Cents']}
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Soil Type"
              options={TN_SOIL_TYPES}
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
            />

            <Select
              label="Irrigation Infrastructure"
              options={TN_IRRIGATION_TYPES}
              value={formData.irrigation_type}
              onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Water Source"
              placeholder="e.g. Cauvery Canal + Borewell"
              value={formData.water_source}
              onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
            />

            <Select
              label="Current Crop"
              options={TN_CROPS}
              value={formData.current_crop}
              onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Cropping Season"
              options={TN_SEASONS}
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />

            <Input
              label="Previous Harvested Crop"
              placeholder="e.g. Black Gram / Pulse"
              value={formData.previous_crop}
              onChange={(e) => setFormData({ ...formData, previous_crop: e.target.value })}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={modalLoading}>
              {editingFarm ? 'Save Changes' : 'Register Farm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Farm Plot"
        message="Are you sure you want to delete this farm parcel? All related soil records and historical schedules will be detached."
        isLoading={deleteLoading}
      />
    </div>
  );
};
