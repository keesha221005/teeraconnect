import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SafetyBanner({ status = 'safe', message = '' }) {
  const { t } = useLanguage();

  const config = {
    safe: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-600',
      statusText: t('safeToGo'),
      icon: ShieldCheck,
      ringColor: 'ring-emerald-200'
    },
    caution: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
      statusText: t('cautionGo'),
      icon: AlertTriangle,
      ringColor: 'ring-amber-200'
    },
    danger: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-500',
      textColor: 'text-rose-950',
      iconColor: 'text-rose-600',
      statusText: t('dangerGo'),
      icon: AlertOctagon,
      ringColor: 'ring-rose-200'
    }
  };

  const current = config[status] || config.safe;
  const IconComponent = current.icon;

  return (
    <div className={`border-3 ${current.borderColor} ${current.bgColor} ${current.textColor} rounded-3xl p-5 shadow-md flex items-start gap-4 transition-all duration-300 ring-4 ${current.ringColor}`}>
      <div className={`p-3 rounded-2xl bg-white shadow-sm flex-shrink-0 ${current.iconColor}`}>
        <IconComponent size={40} className="stroke-[2.5]" />
      </div>
      <div className="flex-1">
        <span className="text-xs font-bold uppercase tracking-wider opacity-75">{t('safetyStatus')}</span>
        <h2 className="text-2xl font-extrabold tracking-tight mt-0.5">{current.statusText}</h2>
        <p className="text-md mt-1.5 leading-snug font-medium opacity-90">{message}</p>
      </div>
    </div>
  );
}
