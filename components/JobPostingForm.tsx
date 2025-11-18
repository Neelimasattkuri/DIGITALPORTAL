'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';

interface JobPostingFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const QUALIFICATIONS = ['KG', 'Pre-Primary', 'Primary', 'Secondary', 'Higher Secondary', 'Diploma', 'B.Tech', 'B.Sc', 'B.A', 'M.Tech', 'M.Sc', 'M.A', 'MBA', 'PhD', 'PG'];

export default function JobPostingForm({ onSubmit, onClose }: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    salary: '',
    minQualification: 'B.Tech',
    maxQualification: 'M.Tech',
    description: '',
    requirements: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.title) newErrors.title = 'Job title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';
    if (!formData.description) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          requirements: formData.requirements.split('\n').filter(r => r.trim())
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Post New Job</CardTitle>
            <CardDescription>Fill in the job details</CardDescription>
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
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'border-red-500' : ''}
                placeholder="e.g., Mathematics Teacher"
                disabled={loading}
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={errors.department ? 'border-red-500' : ''}
                  placeholder="e.g., Education"
                  disabled={loading}
                />
                {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={errors.location ? 'border-red-500' : ''}
                  placeholder="e.g., Delhi"
                  disabled={loading}
                />
                {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salary Range *</label>
              <Input
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className={errors.salary ? 'border-red-500' : ''}
                placeholder="e.g., ₹25,000 - ₹35,000"
                disabled={loading}
              />
              {errors.salary && <p className="text-red-600 text-xs mt-1">{errors.salary}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Qualification</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
                  value={formData.minQualification}
                  onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
                  disabled={loading}
                >
                  {QUALIFICATIONS.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maximum Qualification</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
                  value={formData.maxQualification}
                  onChange={(e) => setFormData({ ...formData, maxQualification: e.target.value })}
                  disabled={loading}
                >
                  {QUALIFICATIONS.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                rows={4}
                placeholder="Describe the job position..."
                disabled={loading}
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                rows={3}
                placeholder="Enter requirements, one per line"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Each requirement on a new line</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Post Job
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
