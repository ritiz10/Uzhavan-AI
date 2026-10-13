import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../ErrorBoundary';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 transition-all duration-200 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>

          <footer className="py-4 px-6 border-t border-slate-200/60 text-center text-xs text-slate-400 no-print">
            <p>
              AI-Based Tamil Nadu Smart Farming Assistant &bull; Built with Tamil Nadu Agricultural University (TNAU) agronomic context.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
