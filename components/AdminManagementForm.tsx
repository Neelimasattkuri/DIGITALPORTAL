'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';

interface AdminManagementFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function AdminManagementForm({ onSubmit, onClose }: AdminManagementFormProps) {
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[@$!%*?&]/.test(password)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.adminId) newErrors.adminId = 'Admin ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Add New Admin</CardTitle>
            <CardDescription>Create a new admin account</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin ID *</label>
              <Input
                value={formData.adminId}
                onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                className={errors.adminId ? 'border-red-500' : ''}
                placeholder="e.g., Admin001"
                disabled={loading}
              />
              {errors.adminId && <p className="text-red-600 text-xs mt-1">{errors.adminId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="admin@example.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                className={errors.password ? 'border-red-500' : ''}
                placeholder="Create a strong password"
                disabled={loading}
              />
              {formData.password && (
                <div className="flex gap-1 mt-2">
                  <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-600' : passwordStrength === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}`} />
                  <p className={`text-xs font-medium ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Admin
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
