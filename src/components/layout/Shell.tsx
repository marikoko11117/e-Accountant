import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { ComplianceFooter } from '../compliance/ComplianceFooter';
import { CosmicNebula } from '../common/CosmicNebula';
import { AccountingCommandPalette } from '../common/AccountingCommandPalette';
import { AuditFocusOverlay } from '../common/AuditFocusOverlay';
import { ParticleBurstCanvas, BurstEvent } from '../common/ParticleBurstCanvas';

export const Shell: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('e_accountant_sidebar_collapsed') === 'true';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [auditFocusOpen, setAuditFocusOpen] = useState(false);
  const [burstEvents, setBurstEvents] = useState<BurstEvent[]>([]);

  // Observe sidebar collapse state in localStorage
  useEffect(() => {
    const handleStorage = () => {
      setIsSidebarCollapsed(localStorage.getItem('e_accountant_sidebar_collapsed') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 300);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerCelebrationBurst = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const newBurst: BurstEvent = {
      id: Date.now(),
      x,
      y,
      color: '#10b981',
    };
    setBurstEvents((prev) => [...prev, newBurst]);
  };

  const handleClearBurst = (id: number) => {
    setBurstEvents((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-brand-500 selection:text-white">
      {/* Liquid Glass Cosmic Backdrop */}
      <CosmicNebula />

      {/* Particle Burst Celebration Canvas */}
      <ParticleBurstCanvas
        bursts={burstEvents}
        onClearBurst={handleClearBurst}
      />

      {/* Desktop Sidebar with Liquid Glass & Tab Loading Progress Lines */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Global ⌘K Accounting Command Palette */}
      <AccountingCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onStartAuditFocus={() => setAuditFocusOpen(true)}
      />

      {/* Audit & Reconciliation Focus Mode Overlay */}
      {auditFocusOpen && (
        <AuditFocusOverlay
          onClose={() => setAuditFocusOpen(false)}
          onPostSuccessBurst={() => triggerCelebrationBurst()}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Topbar
          onToggleMobileNav={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onStartAuditFocus={() => setAuditFocusOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <Outlet />
          <ComplianceFooter />
        </main>
      </div>
    </div>
  );
};
