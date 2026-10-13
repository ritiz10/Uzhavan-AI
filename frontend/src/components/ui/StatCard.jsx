import React from 'react';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'agri',
  className = '',
}) => {
  const colorMap = {
    agri: 'bg-agri-50 text-agri-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    earth: 'bg-earth-100 text-earth-800',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {trend && <span className="font-semibold text-agri-600">{trend}</span>}
              <span>{subtitle}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.agri} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};
