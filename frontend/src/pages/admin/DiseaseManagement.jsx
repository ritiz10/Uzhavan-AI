import React, { useState, useEffect } from 'react';
import { Bug, Plus, Edit2, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';

export const DiseaseManagement = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    severity: 'Moderate',
    symptoms: '',
    prevention: '',
    advisory: '',
  });

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDiseases();
      setDiseases(data);
    } catch (e) {
      setError('Failed to fetch disease catalog.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDisease(null);
    setFormData({
      name: '',
      severity: 'Moderate',
      symptoms: '',
      prevention: '',
      advisory: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDisease(d);
    setFormData({
      name: d.name,
      severity: d.severity || 'Moderate',
      symptoms: d.symptoms || '',
      prevention: d.prevention || '',
      advisory: d.advisory || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      if (editingDisease) {
        await adminService.updateDisease(editingDisease.id, formData);
        setSuccess(`Disease entry "${formData.name}" updated.`);
      } else {
        await adminService.createDisease(formData);
        setSuccess(`Disease entry "${formData.name}" added to knowledgebase.`);
      }
      setIsModalOpen(false);
      loadDiseases();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save disease record.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this disease from master knowledgebase?')) return;
    try {
      await adminService.deleteDisease(id);
      setSuccess('Disease record deleted.');
      loadDiseases();
    } catch (err) {
      setError('Failed to delete disease entry.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plant Disease Knowledgebase</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure symptoms, severity classes, and recommended biological treatments for computer vision diagnosis.
          </p>
        </div>

        <Button onClick={openAddModal} icon={Plus} size="sm">
          Add Disease Entry
        </Button>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Loading disease database..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Pathogen / Disease</th>
                    <th className="p-3.5 font-bold">Severity</th>
                    <th className="p-3.5 font-bold">Symptoms</th>
                    <th className="p-3.5 font-bold">Recommended Bio-Control</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diseases.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{d.name}</td>
                      <td className="p-3.5">
                        <Badge variant={d.severity === 'Severe' || d.severity === 'High' ? 'error' : d.severity === 'Moderate' ? 'warning' : 'success'} size="sm">
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{d.symptoms}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{d.advisory || d.prevention}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
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
        title={editingDisease ? 'Edit Disease Record' : 'Add New Disease Knowledge Entry'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Disease Name"
            required
            placeholder="e.g. Blast (Pyricularia oryzae)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="Severity Level"
            options={['None', 'Low', 'Moderate', 'High', 'Severe']}
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          />

          <Textarea
            label="Characteristic Symptoms"
            required
            placeholder="Describe visual symptoms on leaves, stems or fruits..."
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          />

          <Textarea
            label="Recommended Bio-Control & Agronomic Advisory"
            placeholder="Biological agents, spray guidelines, field drainage..."
            value={formData.advisory}
            onChange={(e) => setFormData({ ...formData, advisory: e.target.value })}
          />

          <Textarea
            label="Prevention Strategy"
            placeholder="Resistant varieties, seed treatments, crop rotation..."
            value={formData.prevention}
            onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={modalLoading}>
              Save Disease Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
