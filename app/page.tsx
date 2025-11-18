'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('currentUser');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser && storedUserType) {
      setCurrentUser(JSON.parse(storedUser));
      setUserType(storedUserType as 'user' | 'admin');
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user, type) => {
      setCurrentUser(user);
      setUserType(type);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userType', type);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {userType === 'user' ? (
        <UserDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}
