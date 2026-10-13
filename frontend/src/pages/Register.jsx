import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, User, Mail, Phone, Lock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { TN_DISTRICTS } from '../constants/tn_data';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    district: 'Thanjavur',
    village: '',
    farmer_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        district: formData.district,
        village: formData.village,
        role: 'farmer',
      });
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed. Please check your information.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-agri-50/50 via-white to-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-md shadow-agri-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">
            TN Smart Farming
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Farmer Registration
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Create your account to store farm details and receive precision AI advice.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl border border-slate-200/80 rounded-2xl">
          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                required
                placeholder="Muthuvel K"
                icon={User}
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                label="Mobile Number"
                name="phone"
                type="tel"
                placeholder="9443123456"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                placeholder="muthuvel@agri.tn"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                icon={Lock}
                helperText="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="District (Tamil Nadu)"
                name="district"
                required
                options={TN_DISTRICTS}
                value={formData.district}
                onChange={handleChange}
              />

              <Input
                label="Village / Panchayat"
                name="village"
                placeholder="Papanasam Melur"
                icon={MapPin}
                value={formData.village}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Kisan ID / Farmer ID (Optional)"
              name="farmer_id"
              placeholder="e.g. TN-FARM-9024"
              helperText="Optional government or cooperative farmer identifier"
              value={formData.farmer_id}
              onChange={handleChange}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
              >
                Create Farmer Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an agricultural account?{' '}
            <Link to="/login" className="font-semibold text-agri-600 hover:text-agri-700">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
