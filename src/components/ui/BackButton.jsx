import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Enterprise Production-Ready Global BackButton Component
 * Supports custom destination (`to`), fallback route, click handler,
 * and multiple sleek SaaS variants (`default`, `pill`, `ghost`, `card`, `dark`).
 */
export default function BackButton({
  to,
  label = 'Back',
  fallbackUrl = '/dashboard',
  className = '',
  variant = 'default',
  onClick,
}) {
  const navigate = useNavigate();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackUrl);
    }
  };

  const variantStyles = {
    default:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-xs rounded-xl px-3.5 py-2',
    pill:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs rounded-full px-4 py-1.5',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 rounded-xl px-3 py-1.5',
    card:
      'bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 border border-slate-200/80 shadow-xs hover:shadow-sm rounded-2xl px-4 py-2.5',
    dark:
      'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 shadow-xs rounded-xl px-3.5 py-2',
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
      title={typeof label === 'string' ? label : 'Go back'}
      aria-label={typeof label === 'string' ? label : 'Go back'}
    >
      <ArrowLeft
        size={14}
        className="transition-transform duration-150 group-hover:-translate-x-1 stroke-[2.5]"
      />
      {label && <span>{label}</span>}
    </button>
  );
}
