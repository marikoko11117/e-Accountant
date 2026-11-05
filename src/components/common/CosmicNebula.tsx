import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const CosmicNebula: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Base background color */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-[#060714] bg-gradient-to-br from-[#060714] via-[#090d24] to-[#04050e]'
            : 'bg-slate-50 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100'
        }`}
      />

      {/* Nebula glowing color fields */}
      <div
        className={`absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[140px] transition-opacity duration-700 pointer-events-none ${
          isDark
            ? 'opacity-35 mix-blend-screen bg-[radial-gradient(circle,rgba(99,102,241,0.5)_0%,rgba(79,70,229,0.15)_50%,transparent_70%)]'
            : 'opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.3)_0%,transparent_70%)]'
        }`}
      />
      <div
        className={`absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[150px] transition-opacity duration-700 pointer-events-none ${
          isDark
            ? 'opacity-30 mix-blend-screen bg-[radial-gradient(circle,rgba(168,85,247,0.4)_0%,rgba(139,92,246,0.1)_50%,transparent_70%)]'
            : 'opacity-15 bg-[radial-gradient(circle,rgba(168,85,247,0.25)_0%,transparent_70%)]'
        }`}
      />
      <div
        className={`absolute -bottom-[20%] left-[25%] w-[60vw] h-[60vw] rounded-full blur-[160px] transition-opacity duration-700 pointer-events-none ${
          isDark
            ? 'opacity-25 mix-blend-screen bg-[radial-gradient(circle,rgba(20,184,166,0.35)_0%,rgba(6,182,212,0.1)_50%,transparent_70%)]'
            : 'opacity-15 bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,transparent_70%)]'
        }`}
      />

      {/* Subtle fine geometric grid */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'
        }`}
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
