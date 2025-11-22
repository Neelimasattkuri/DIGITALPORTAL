'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Briefcase, Users, CheckCircle, XCircle, Plus, Trash2, Loader } from 'lucide-react';
import JobPostingForm from './JobPostingForm';
import AdminManagementForm from './AdminManagementForm';

const API_BASE_URL = '${API_BASE}/api';

export default function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [jobsRes, adminsRes, appsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs`),
          fetch(`${API_BASE_URL}/admin/all-admins`),
          fetch(`${API_BASE_URL}/applications`)
        ]);

        if (!jobsRes.ok || !adminsRes.ok || !appsRes.ok) throw new Error('Failed to fetch data');

        const jobsData = await jobsRes.json();
        const adminsData = await adminsRes.json();
        const appsData = await appsRes.json();

        setJobs(jobsData);
        setAdmins(adminsData);
        setApplications(appsData);
        setError(null);
      } catch (err) {
        console.error("[v0] Error fetching admin data:", err);
        setError('Failed to load data. Make sure Flask server is running on ${API_BASE}');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePostJob = async (jobData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          postedBy: user.id || user.admin_id || 'Admin'
        })
      });

      if (!response.ok) throw new Error('Failed to post job');

      const result = await response.json();
      setJobs([...jobs, result.job]);
      setShowJobForm(false);
    } catch (err) {
      console.error("[v0] Error posting job:", err);
      alert('Failed to post job');
    }
  };

  const handleAddAdmin = async (adminData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add admin');
      }

      const result = await response.json();
      setAdmins([...admins, result.admin]);
      setShowAdminForm(false);
    } catch (err) {
      console.error("[v0] Error adding admin:", err);
      alert(err instanceof Error ? err.message : 'Failed to add admin');
    }
  };

  const handleSelectApplicant = async (appId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Selected' })
      });

      if (!response.ok) throw new Error('Failed to update application');

      const result = await response.json();
      setApplications(applications.map(app => app._id === appId ? result.application : app));
    } catch (err) {
      console.error("[v0] Error selecting applicant:", err);
      alert('Failed to update application');
    }
  };

  const handleRejectApplicant = async (appId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });

      if (!response.ok) throw new Error('Failed to update application');

      const result = await response.json();
      setApplications(applications.map(app => app._id === appId ? result.application : app));
    } catch (err) {
      console.error("[v0] Error rejecting applicant:", err);
      alert('Failed to update application');
    }
  };

  const selectedApps = applications.filter(app => app.status === 'Selected');
  const rejectedApps = applications.filter(app => app.status === 'Rejected');
  const pendingApps = applications.filter(app => app.status === 'Pending');

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{error}</p>
            <p className="text-xs text-gray-500 mt-2">Make sure Flask backend is running: python app.py</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Admin ID: <span className="font-semibold">{user.id || user.admin_id}</span></p>
          </div>
          <Button onClick={onLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Selected ({selectedApps.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedApps.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admins
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <Button
              onClick={() => setShowJobForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.length === 0 ? (
                  <Card className="bg-white border-2 border-dashed">
                    <CardContent className="pt-8 text-center text-gray-600">
                      No jobs posted yet
                    </CardContent>
                  </Card>
                ) : (
                  jobs.map((job) => (
                    <Card key={job._id} className="bg-white">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>{job.department}</CardDescription>
                          </div>
                          <Badge variant="outline">{job.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Salary</p>
                            <p className="font-medium">{job.salary}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Location</p>
                            <p className="font-medium">{job.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Qualification</p>
                            <p className="font-medium">{job.minQualification} - {job.maxQualification}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">{job.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="grid gap-4">
              {pendingApps.length === 0 ? (
                <Card className="bg-white border-2 border-dashed">
                  <CardContent className="pt-8 text-center text-gray-600">
                    No pending applications
                  </CardContent>
                </Card>
              ) : (
                pendingApps.map((app) => (
                  <Card key={app._id} className="bg-white border-l-4 border-yellow-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.fullName}</CardTitle>
                          <CardDescription>Applied on {new Date(app.appliedDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p>{app.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p>{app.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p>{app.experience} years</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Adhaar</p>
                          <p>{app.adhaar}</p>
                        </div>
                      </div>
                      {app.coverLetter && (
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Cover Letter</p>
                          <p className="text-sm bg-gray-50 p-3 rounded">{app.coverLetter}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleSelectApplicant(app._id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Select
                        </Button>
                        <Button
                          onClick={() => handleRejectApplicant(app._id)}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Selected Tab */}
          <TabsContent value="selected" className="space-y-4">
            <div className="grid gap-4">
              {selectedApps.length === 0 ? (
                <Card className="bg-white border-2 border-dashed">
                  <CardContent className="pt-8 text-center text-gray-600">
                    No selected applicants yet
                  </CardContent>
                </Card>
              ) : (
                selectedApps.map((app) => (
                  <Card key={app._id} className="bg-white border-l-4 border-green-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.fullName}</CardTitle>
                          <CardDescription>Email: {app.email}</CardDescription>
                        </div>
                        <Badge className="bg-green-600">Selected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p>{app.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p>{app.experience} years</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4">
              {rejectedApps.length === 0 ? (
                <Card className="bg-white border-2 border-dashed">
                  <CardContent className="pt-8 text-center text-gray-600">
                    No rejected applicants
                  </CardContent>
                </Card>
              ) : (
                rejectedApps.map((app) => (
                  <Card key={app._id} className="bg-white border-l-4 border-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.fullName}</CardTitle>
                          <CardDescription>Email: {app.email}</CardDescription>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p>{app.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p>{app.experience} years</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Button
              onClick={() => setShowAdminForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Admin
            </Button>

            <div className="grid gap-4">
              {admins.map((admin) => (
                <Card key={admin._id} className="bg-white">
                  <CardHeader>
                    <CardTitle>{admin.name}</CardTitle>
                    <CardDescription>{admin.admin_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><span className="text-gray-600">Email:</span> {admin.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Posting Form Modal */}
      {showJobForm && (
        <JobPostingForm
          onSubmit={handlePostJob}
          onClose={() => setShowJobForm(false)}
        />
      )}

      {/* Admin Management Form Modal */}
      {showAdminForm && (
        <AdminManagementForm
          onSubmit={handleAddAdmin}
          onClose={() => setShowAdminForm(false)}
        />
      )}
    </div>
  );
}
