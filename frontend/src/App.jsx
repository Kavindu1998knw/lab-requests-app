import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LabProvider, useLab } from './context/LabContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { SampleDetailModal } from './components/SampleDetailModal';
import { PrintableReceipt } from './components/PrintableReceipt';
import { Dashboard } from './pages/Dashboard';
import { SamplesList } from './pages/SamplesList';
import { SampleForm } from './pages/SampleForm';
import { LoginRegister } from './pages/LoginRegister';

const MainLayout = () => {
  const { user } = useAuth();
  const { activeTab } = useLab();

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <>
      <div className="app-container no-print">
        <Sidebar />
        <div className="main-content">
          <main>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'samples' && <SamplesList />}
            {activeTab === 'new_sample' && <SampleForm />}
          </main>
        </div>

        <SampleDetailModal />
        <ToastContainer />
      </div>

      {/* Standalone Printable Slip */}
      <PrintableReceipt />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LabProvider>
        <MainLayout />
      </LabProvider>
    </AuthProvider>
  );
}
