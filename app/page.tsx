'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // <— prevents hydration mismatch

  useEffect(() => {
    // Access localStorage only in browser
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    const storedUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

    if (storedUser && storedUserType) {
      setCurrentUser(JSON.parse(storedUser));
      setUserType(storedUserType as 'user' | 'admin');
    }

    setIsLoaded(true); // <— tell Next.js hydration completed
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
  };

  // 🚀 Avoid hydration error — wait until useEffect has run
  if (!isLoaded) return null;

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user, type) => {
          setCurrentUser(user);
          setUserType(type);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('userType', type);
        }}
      />
    );
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
