import React, { useState } from 'react';
import { getToken, clearToken } from './api';
import { AuthPanel } from './AuthPanel';
import { AdminPanel } from './AdminPanel';

interface AdminAppProps {
  defaultScreenId?: string;
}

export const AdminApp: React.FC<AdminAppProps> = ({ defaultScreenId }) => {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());

  if (!authed) {
    return <AuthPanel onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminPanel
      defaultScreenId={defaultScreenId}
      onLogout={() => {
        clearToken();
        setAuthed(false);
      }}
      onExitAdmin={() => {
        window.location.hash = '';
      }}
    />
  );
};
