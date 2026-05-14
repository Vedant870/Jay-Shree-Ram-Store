import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!adminToken || !adminData) {
      setIsAuthorized(false);
      navigate('/auth');
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      if (admin.role !== 'super_admin' && admin.role !== 'admin') {
        setIsAuthorized(false);
        navigate('/auth');
        return;
      }

      if (!localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', adminToken);
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Invalid admin data:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('auth_token');
      setIsAuthorized(false);
      navigate('/auth');
    }
  }, [navigate]);

  if (isAuthorized !== true) {
    return null;
  }

  return <>{children}</>;
}
