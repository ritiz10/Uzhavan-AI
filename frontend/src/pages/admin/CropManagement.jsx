import React, { useState, useEffect } from 'react';
import { Database, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export const CropManagement = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    season: '',
    water_requirement: 'Medium',
    soil_types: '',
    description: '',
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCrops();
      setCrops(data);
    } catch (e) {
      setError('Failed to fetch crops list.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      scientific_name: '',
      season: 'Kuruvai / Samba',
      water_requirement: 'Medium',
      soil_types: 'Red Loam, Alluvial',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      scientific_name: crop.scientific_name || '',
      season: crop.season || '',
      water_requirement: crop.water_requirement || '',
      soil_types: crop.soil_types || '',
      description: crop.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      if (editingCrop) {
        await adminService.updateCrop(editingCrop.id, formData);
        setSuccess(`Crop "${formData.name}" updated successfully.`);
      } else {
        await adminService.createCrop(formData);
        setSuccess(`Crop "${formData.name}" added to master database.`);
      }
      setIsModalOpen(false);
      loadCrops();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save crop data.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop from the master database?')) return;
    try {
      await adminService.deleteCrop(id);
      setSuccess('Crop deleted successfully.');
      loadCrops();
    } catch (err) {
      setError('Failed to delete crop.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Crop Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Tamil Nadu agricultural crop catalog, water requirements, and season parameters.
          </p>
        </div>

        <Button onClick={openAddModal} icon={Plus} size="sm">
          Add Master Crop
        </Button>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Loading crop catalog..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Crop Name</th>
                    <th className="p-3.5 font-bold">Scientific Name</th>
                    <th className="p-3.5 font-bold">Standard Season</th>
                    <th className="p-3.5 font-bold">Water Requirement</th>
                    <th className="p-3.5 font-bold">Compatible Soils</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {crops.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3.5 italic text-slate-500">{c.scientific_name || 'N/A'}</td>
                      <td className="p-3.5 text-slate-700">{c.season || 'N/A'}</td>
                      <td className="p-3.5 text-slate-700">{c.water_requirement || 'N/A'}</td>
                      <td className="p-3.5 text-slate-600">{c.soil_types || 'N/A'}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'Edit Master Crop' : 'Add New Master Crop'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Crop Name"
            required
            placeholder="e.g. Paddy / Cotton"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Scientific Name"
            placeholder="e.g. Oryza sativa"
            value={formData.scientific_name}
            onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Standard Season"
              placeholder="e.g. Kuruvai / Samba"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
            <Input
              label="Water Requirement"
              placeholder="e.g. High (1200 - 1400 mm)"
              value={formData.water_requirement}
              onChange={(e) => setFormData({ ...formData, water_requirement: e.target.value })}
            />
          </div>

          <Input
            label="Compatible Soil Types"
            placeholder="e.g. Alluvial, Clayey Loam"
            value={formData.soil_types}
            onChange={(e) => setFormData({ ...formData, soil_types: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={modalLoading}>
              Save Crop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
