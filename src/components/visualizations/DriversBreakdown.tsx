"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Driver {
  metric: 'AIV' | 'ATI';
  name: string;
  contribution: number;
}

interface DriversBreakdownProps {
  drivers: Driver[];
}

export default function DriversBreakdown({ drivers }: DriversBreakdownProps) {
  const aivDrivers = drivers.filter(d => d.metric === 'AIV').sort((a, b) => b.contribution - a.contribution);
  const atiDrivers = drivers.filter(d => d.metric === 'ATI').sort((a, b) => b.contribution - a.contribution);

  const totalAIV = aivDrivers.reduce((sum, d) => sum + d.contribution, 0);
  const totalATI = atiDrivers.reduce((sum, d) => sum + d.contribution, 0);

  const DriverBar = ({ driver, total }: { driver: Driver; total: number }) => {
    const percentage = total > 0 ? (driver.contribution / total) * 100 : 0;
    const getColor = (metric: string) => metric === 'AIV' ? 'from-blue-600 to-blue-400' : 'from-purple-600 to-purple-400';

    return (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="text-sm font-semibold text-white mb-1">{driver.name}</div>
            <Badge className={driver.metric === 'AIV' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
              {driver.metric}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">+{driver.contribution.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">{percentage.toFixed(0)}% of total</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getColor(driver.metric)} transition-all duration-1000 group-hover:scale-x-105 origin-left`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Impact indicator */}
        <div className="mt-2 flex items-center gap-2">
          {driver.contribution >= 10 && (
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">High Impact</span>
          )}
          {driver.contribution >= 5 && driver.contribution < 10 && (
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Medium Impact</span>
          )}
          {driver.contribution < 5 && (
            <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded">Low Impact</span>
          )}
        </div>
      </div>
    );
  };

  const DriverPieChart = ({ drivers, metric, total }: { drivers: Driver[]; metric: string; total: number }) => {
    const colors = metric === 'AIV'
      ? ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
      : ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

    let currentAngle = -90;
    const segments = drivers.map((driver, index) => {
      const percentage = (driver.contribution / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (currentAngle * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      return {
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length],
        driver,
        percentage
      };
    });

    return (
      <div className="flex items-center gap-6">
        <svg width="120" height="120" viewBox="0 0 100 100" className="flex-shrink-0">
          {segments.map((segment, index) => (
            <g key={index}>
              <path d={segment.path} fill={segment.color} opacity="0.8" className="hover:opacity-100 transition-opacity" />
            </g>
          ))}
          <circle cx="50" cy="50" r="20" fill="#0f172a" />
          <text x="50" y="48" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            {total.toFixed(1)}%
          </text>
          <text x="50" y="58" textAnchor="middle" fill="#94a3b8" fontSize="6">
            Total
          </text>
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <div className="flex-1 text-gray-300 truncate">{segment.driver.name}</div>
              <div className="font-semibold text-white">{segment.percentage.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Performance Drivers Analysis</h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-300 mb-1">AIV Drivers</div>
              <div className="text-xs text-gray-400">{aivDrivers.length} contributing factors</div>
            </div>
            <Badge className="bg-blue-500/30 text-blue-400">AIV</Badge>
          </div>
          <div className="text-3xl font-bold text-white">+{totalAIV.toFixed(1)}%</div>
          <div className="text-xs text-blue-300 mt-1">Total contribution</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-300 mb-1">ATI Drivers</div>
              <div className="text-xs text-gray-400">{atiDrivers.length} contributing factors</div>
            </div>
            <Badge className="bg-purple-500/30 text-purple-400">ATI</Badge>
          </div>
          <div className="text-3xl font-bold text-white">+{totalATI.toFixed(1)}%</div>
          <div className="text-xs text-purple-300 mt-1">Total contribution</div>
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {aivDrivers.length > 0 && (
          <div className="p-5 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-semibold text-blue-400 mb-4">AIV Driver Distribution</h4>
            <DriverPieChart drivers={aivDrivers} metric="AIV" total={totalAIV} />
          </div>
        )}

        {atiDrivers.length > 0 && (
          <div className="p-5 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-semibold text-purple-400 mb-4">ATI Driver Distribution</h4>
            <DriverPieChart drivers={atiDrivers} metric="ATI" total={totalATI} />
          </div>
        )}
      </div>

      {/* AIV Drivers list */}
      {aivDrivers.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wide">
            AI Visibility Drivers
          </h4>
          <div className="space-y-3">
            {aivDrivers.map((driver, index) => (
              <DriverBar key={index} driver={driver} total={totalAIV} />
            ))}
          </div>
        </div>
      )}

      {/* ATI Drivers list */}
      {atiDrivers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wide">
            AI Traffic Index Drivers
          </h4>
          <div className="space-y-3">
            {atiDrivers.map((driver, index) => (
              <DriverBar key={index} driver={driver} total={totalATI} />
            ))}
          </div>
        </div>
      )}

      {/* Key insights */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Top Driver</div>
            <div className="text-lg font-bold text-white truncate">
              {drivers.sort((a, b) => b.contribution - a.contribution)[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-green-400 mt-1">
              +{drivers.sort((a, b) => b.contribution - a.contribution)[0]?.contribution.toFixed(1) || 0}%
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Total Drivers</div>
            <div className="text-lg font-bold text-white">{drivers.length}</div>
            <div className="text-sm text-gray-400 mt-1">Contributing factors</div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Combined Impact</div>
            <div className="text-lg font-bold text-white">+{(totalAIV + totalATI).toFixed(1)}%</div>
            <div className="text-sm text-gray-400 mt-1">Total contribution</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
