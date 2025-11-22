'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, FileUp, CheckCircle, XCircle, Clock, Briefcase, Zap, Loader } from 'lucide-react';
import JobListingCard from './JobListingCard';
import ApplicationForm from './ApplicationForm';

const QUALIFICATIONS_HIERARCHY = ['KG', 'Pre-Primary', 'Primary', 'Secondary', 'Higher Secondary', 'Diploma', 'B.Tech', 'B.Sc', 'B.A', 'M.Tech', 'M.Sc', 'M.A', 'MBA', 'PhD', 'PG'];
const API_BASE_URL = '${API_BASE}/api';

export default function UserDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs`),
          fetch(`${API_BASE_URL}/applications/${user.adhaar}`)
        ]);

        if (!jobsRes.ok || !appRes.ok) throw new Error('Failed to fetch data');

        const jobsData = await jobsRes.json();
        const appsData = await appRes.json();

        setJobs(jobsData);
        setApplications(appsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Make sure Flask server is running on ${API_BASE}');
      } finally {
        setLoading(false);
      }
    };

    if (user?.adhaar) {
      fetchData();
      // Poll for updates every 5 seconds for real-time updates
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.adhaar]);

  useEffect(() => {
    const eligibleJobs = jobs.filter(job => isEligible(job));
    setRecommendedJobs(eligibleJobs);
  }, [jobs, user.qualification]);

  const isEligible = (job: any) => {
    const userQualIndex = QUALIFICATIONS_HIERARCHY.indexOf(user.qualification);
    const minQualIndex = QUALIFICATIONS_HIERARCHY.indexOf(job.minQualification);
    const maxQualIndex = QUALIFICATIONS_HIERARCHY.indexOf(job.maxQualification);

    return userQualIndex >= minQualIndex && userQualIndex <= maxQualIndex;
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  const handleApplySubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob._id || selectedJob.id,
          adhaar: user.adhaar,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to submit application');

      const newApp = await response.json();
      setApplications([...applications, newApp.application]);
      setShowApplicationForm(false);
      setSelectedJob(null);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{error}</p>
            <p className="text-xs text-gray-500 mt-2">Make sure the Flask backend is running: python app.py</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-gray-600">Qualification: <span className="font-semibold">{user.qualification}</span></p>
          </div>
          <Button onClick={onLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Available Jobs
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Recommended Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              My Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="mb-4">
              <Input
                placeholder="Search jobs by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="bg-white border-2 border-dashed">
                <CardContent className="pt-12 text-center">
                  <p className="text-gray-600">No jobs found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((job) => {
                  const eligible = isEligible(job);
                  const applied = hasApplied(job._id || job.id);

                  return (
                    <JobListingCard
                      key={job._id || job.id}
                      job={job}
                      eligible={eligible}
                      applied={applied}
                      userQualification={user.qualification}
                      onApply={() => {
                        setSelectedJob(job);
                        setShowApplicationForm(true);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Recommended Jobs Tab */}
          <TabsContent value="recommended" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : recommendedJobs.length === 0 ? (
              <Card className="bg-white border-2 border-dashed">
                <CardContent className="pt-12 text-center">
                  <p className="text-gray-600">No recommended jobs for your qualification yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recommendedJobs.map((job) => (
                  <JobListingCard
                    key={job._id || job.id}
                    job={job}
                    eligible={true}
                    applied={hasApplied(job._id || job.id)}
                    userQualification={user.qualification}
                    onApply={() => {
                      setSelectedJob(job);
                      setShowApplicationForm(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card className="bg-white border-2 border-dashed">
                <CardContent className="pt-12 text-center">
                  <p className="text-gray-600">No applications yet. Start applying for jobs!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app._id || app.id} className="bg-white">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.fullName}</CardTitle>
                          <CardDescription>Applied on {new Date(app.appliedDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <Badge
                            variant={
                              app.status === 'Selected'
                                ? 'default'
                                : app.status === 'Rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium">{app.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-medium">{app.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p className="font-medium">{app.experience} years</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-medium">{app.status}</p>
                        </div>
                      </div>
                      {app.coverLetter && (
                        <div>
                          <p className="text-gray-600 text-sm">Cover Letter</p>
                          <p className="text-sm">{app.coverLetter}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <ApplicationForm
          job={selectedJob}
          user={user}
          onSubmit={handleApplySubmit}
          onClose={() => {
            setShowApplicationForm(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
