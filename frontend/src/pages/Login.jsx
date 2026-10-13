import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Mail, Lock, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
          Farmer & Officer Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your farm dashboard, AI crop guidance, and irrigation schedules.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl border border-slate-200/80 rounded-2xl">
          {isExpired && (
            <Alert type="warning" className="mb-4">
              Your session has expired. Please sign in again to continue.
            </Alert>
          )}

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              required
              placeholder="farmer@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
              >
                Sign In to Account
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins for instant evaluation */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick 1-Click Demo Evaluation Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('farmer@example.com', 'Farmer@123')}
                className="p-2.5 rounded-xl border border-agri-200 bg-agri-50/60 hover:bg-agri-100/60 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-agri-900">
                  <UserCheck className="w-3.5 h-3.5 text-agri-700" />
                  <span>Demo Farmer</span>
                </div>
                <span className="text-[10px] text-agri-700 block mt-0.5 truncate">
                  farmer@example.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@example.com', 'Admin@123')}
                className="p-2.5 rounded-xl border border-earth-200 bg-earth-50/60 hover:bg-earth-100/60 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-earth-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-earth-700" />
                  <span>Demo Admin</span>
                </div>
                <span className="text-[10px] text-earth-700 block mt-0.5 truncate">
                  admin@example.com
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an agricultural account?{' '}
            <Link to="/register" className="font-semibold text-agri-600 hover:text-agri-700">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
