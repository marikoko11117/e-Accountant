import React, { useState } from 'react';

interface PhysicsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md';
}

export const PhysicsToggle: React.FC<PhysicsToggleProps> = ({
  checked,
  onChange,
  label,
  sublabel,
  size = 'md',
}) => {
  const [shaking, setShaking] = useState(false);

  const handleToggle = () => {
    // Trigger the 2px, 120ms horizontal acknowledgment shake
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
    }, 120);
    onChange(!checked);
  };

  const isSmall = size === 'sm';

  return (
    <div
      onClick={handleToggle}
      className={`group inline-flex items-center gap-3 cursor-pointer select-none ${
        shaking ? 'animate-toggleShake' : ''
      }`}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={`relative rounded-full transition-colors duration-200 p-0.5 border ${
          isSmall ? 'w-9 h-5' : 'w-12 h-6'
        } ${
          checked
            ? 'bg-indigo-600/80 border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
            : 'bg-white/10 border-white/15'
        }`}
      >
        {/* Switch thumb sliding with spring overshoot physics */}
        <div
          className={`rounded-full bg-white shadow-md transform transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
          } ${
            checked
              ? isSmall
                ? 'translate-x-4'
                : 'translate-x-6'
              : 'translate-x-0'
          }`}
        />
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-slate-200">{label}</span>}
          {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
