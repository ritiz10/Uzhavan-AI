import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { TN_DISTRICTS } from '../constants/tn_data';

export const Profile = () => {
  const { user, updateUser, isAdmin } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.district || 'Thanjavur',
    village: user?.village || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const updated = await authService.updateProfile(profileData);
      updateUser(updated);
      setProfileMsg({ type: 'success', text: 'Farmer profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    try {
      await authService.changePassword(passwordData.old_password, passwordData.new_password);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || 'Incorrect current password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farmer Profile & Account</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal details, contact information, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Header */}
        <Card className="p-6 text-center md:col-span-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-agri-500 to-agri-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h3 className="font-bold text-slate-900 text-lg mt-4">{user?.name}</h3>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>

          <div className="mt-3">
            <Badge variant={isAdmin ? 'earth' : 'primary'} size="sm">
              {isAdmin ? 'System Administrator' : 'Registered Farmer'}
            </Badge>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-agri-600" />
              <span>{user?.district || 'Tamil Nadu'}, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone || 'No phone added'}</span>
            </div>
          </div>
        </Card>

        {/* Edit Forms (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <Card>
            <CardHeader title="Personal & Location Information" />
            <CardBody>
              {profileMsg.text && (
                <Alert type={profileMsg.type} className="mb-4">
                  {profileMsg.text}
                </Alert>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />

                <Input
                  label="Email Address (Login ID)"
                  disabled
                  value={user?.email || ''}
                  helperText="Email cannot be changed after registration."
                />

                <Input
                  label="Mobile Contact"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Home District"
                    options={TN_DISTRICTS}
                    value={profileData.district}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  />

                  <Input
                    label="Village / Revenue Block"
                    value={profileData.village}
                    onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={profileLoading}>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save Profile Changes</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Change Password Form */}
          <Card>
            <CardHeader title="Security & Password" />
            <CardBody>
              {passwordMsg.text && (
                <Alert type={passwordMsg.type} className="mb-4">
                  {passwordMsg.text}
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="outline" size="sm" isLoading={passwordLoading}>
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
