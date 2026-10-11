/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { UploadPage } from './components/upload/UploadPage';
import { HistoryPage } from './components/history/HistoryPage';
import { InsightPage } from './components/insight/InsightPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { StorageService } from './services/storage';
import { ScanRecord, NavigationTab } from './types';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [selectedScanForDetail, setSelectedScanForDetail] = useState<ScanRecord | null>(null);

  useEffect(() => {
    if (user) {
      const userScans = StorageService.getScansForUser(user.id);
      setScans(userScans);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1E2E42] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-medium tracking-wide">
            Menyiapkan DIO detector...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleScanSaved = (newScan: ScanRecord) => {
    setScans((prev) => [newScan, ...prev]);
  };

  const handleDeleteScan = (id: string) => {
    StorageService.deleteScan(id);
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllScans = () => {
    if (user) {
      StorageService.clearAllForUser(user.id);
      setScans([]);
    }
  };

  const handleViewDetailFromAnywhere = (scan: ScanRecord) => {
    setSelectedScanForDetail(scan);
    setCurrentTab('history');
  };

  return (
    <AppLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && (
        <DashboardPage
          scans={scans}
          onNavigate={setCurrentTab}
          onViewDetail={handleViewDetailFromAnywhere}
        />
      )}

      {currentTab === 'upload' && (
        <UploadPage onScanSaved={handleScanSaved} />
      )}

      {currentTab === 'history' && (
        <HistoryPage
          scans={scans}
          onDeleteScan={handleDeleteScan}
          onClearAllScans={handleClearAllScans}
          selectedScanForModal={selectedScanForDetail}
          onClearSelectedScan={() => setSelectedScanForDetail(null)}
        />
      )}

      {currentTab === 'insight' && (
        <InsightPage scans={scans} onNavigate={setCurrentTab} />
      )}

      {currentTab === 'profile' && (
        <ProfilePage />
      )}
    </AppLayout>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
