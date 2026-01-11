import React from 'react';
import { useRole } from '../RoleContext';

export function RoleGuard({ allowedRoles, children, fallback }) {
  const { userRole, loading } = useRole();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#ef4444',
        background: '#fee',
        borderRadius: '8px',
        margin: '20px'
      }}>
        ⚠️ Access Denied: This feature requires {allowedRoles.join(' or ')} role.
        <br />
        Your current role: {userRole || 'Unknown'}
      </div>
    );
  }

  return children;
}