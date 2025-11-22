'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = '${API_BASE}/api';

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: any, type: string) => void }) {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [userAdhaar, setUserAdhaar] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    adhaar: '',
    name: '',
    email: '',
    qualification: 'B.Tech',
    phone: '',
    experience: '0'
  });

  const handleUserLogin = async () => {
    setError('');
    if (!userAdhaar) {
      setError('Please enter Adhaar number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adhaar: userAdhaar })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      console.log("[v0] User logged in:", data.user);
      onLoginSuccess(data.user, 'user');
    } catch (err) {
      console.error("[v0] Login error:", err);
      setError('Connection failed. Make sure Flask server is running on ${API_BASE}');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    if (!adminId || !adminPassword) {
      setError('Please enter admin ID and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, password: adminPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      console.log("[v0] Admin logged in:", data.admin);
      onLoginSuccess(data.admin, 'admin');
    } catch (err) {
      console.error("[v0] Admin login error:", err);
      setError('Connection failed. Make sure Flask server is running on ${API_BASE}');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!registerData.adhaar || !registerData.name || !registerData.email) {
      setError('Please fill all required fields');
      return;
    }
    
    if (registerData.adhaar.length !== 12) {
      setError('Adhaar must be 12 digits');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adhaar: registerData.adhaar,
          name: registerData.name,
          email: registerData.email,
          qualification: registerData.qualification,
          phone: registerData.phone,
          experience: registerData.experience
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      
      console.log("[v0] User registered:", data.user);
      setShowRegister(false);
      setRegisterData({ adhaar: '', name: '', email: '', qualification: 'B.Tech', phone: '', experience: '0' });
      alert('Registration successful! You can now login.');
      setUserAdhaar(registerData.adhaar);
    } catch (err) {
      console.error("[v0] Registration error:", err);
      setError('Connection failed. Make sure Flask server is running on ${API_BASE}');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Job Portal</CardTitle>
          <CardDescription>Academic Hiring Platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showRegister ? (
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as 'user' | 'admin');
              setError('');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adhaar Number</label>
                  <Input
                    placeholder="Enter your 12-digit Adhaar number"
                    value={userAdhaar}
                    onChange={(e) => setUserAdhaar(e.target.value)}
                    maxLength={12}
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleUserLogin} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRegister(true)}
                  disabled={loading}
                >
                  New User? Register
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin ID</label>
                  <Input
                    placeholder="Enter admin ID"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleAdminLogin} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Admin Login
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Demo: ID: Neelima | Password: Admin@neelu
                </p>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Register New Account</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adhaar Number *</label>
                <Input
                  placeholder="12-digit Adhaar number"
                  value={registerData.adhaar}
                  onChange={(e) => setRegisterData({ ...registerData, adhaar: e.target.value })}
                  maxLength={12}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background disabled:opacity-50"
                  value={registerData.qualification}
                  onChange={(e) => setRegisterData({ ...registerData, qualification: e.target.value })}
                  disabled={loading}
                >
                  <option>KG</option>
                  <option>Pre-Primary</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>Higher Secondary</option>
                  <option>Diploma</option>
                  <option>B.Tech</option>
                  <option>B.Sc</option>
                  <option>B.A</option>
                  <option>M.Tech</option>
                  <option>M.Sc</option>
                  <option>M.A</option>
                  <option>MBA</option>
                  <option>PhD</option>
                  <option>PG</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="Enter your phone number"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience (years)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={registerData.experience}
                  onChange={(e) => setRegisterData({ ...registerData, experience: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegister} className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Register
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRegister(false);
                    setRegisterData({ adhaar: '', name: '', email: '', qualification: 'B.Tech', phone: '', experience: '0' });
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
