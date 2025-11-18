'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Loader2 } from 'lucide-react';

interface ApplicationFormProps {
  job: any;
  user: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ApplicationForm({ job, user, onSubmit, onClose }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.name,
    email: user.email || '',
    phone: '',
    experience: user.experience || '',
    coverLetter: '',
    resumeFileName: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (isNaN(Number(formData.experience))) newErrors.experience = 'Experience must be a number';
    if (!formData.resumeFileName) newErrors.resumeFileName = 'Resume is required';
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, resumeFileName: file.name });
      setErrors({ ...errors, resumeFileName: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Apply for {job.title}</CardTitle>
            <CardDescription>{job.department}</CardDescription>
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
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={errors.fullName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="10-digit number"
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience *</label>
              <Input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className={errors.experience ? 'border-red-500' : ''}
                placeholder="e.g., 5"
                disabled={loading}
              />
              {errors.experience && <p className="text-red-600 text-xs mt-1">{errors.experience}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload Resume (PDF/DOC) *</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition disabled:opacity-50">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {formData.resumeFileName ? formData.resumeFileName : 'Choose file'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              {errors.resumeFileName && <p className="text-red-600 text-xs mt-1">{errors.resumeFileName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Letter</label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                rows={4}
                placeholder="Tell us why you're interested in this position (optional)"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Application
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
