import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProgressoProvider } from './context/ProgressoContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <ProgressoProvider>
        <AppRoutes />
      </ProgressoProvider>
    </AuthProvider>
  );
}

export default App;
