import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Policy Simulator interactive state (Feature E)
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [excessThreshold, setExcessThreshold] = useState<number>(100);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getReports();
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const runPolicySimulation = async () => {
    setSimulating(true);
    try {
      const res = await ApiClient.simulatePolicy({
        warningThreshold,
        excessThreshold,
      });
      if (res.success) {
        setSimulationResult(res.results);
      }
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    runPolicySimulation();
  }, []);

  if (loading || !reportData) {
    return <div className="py-20 text-center text-slate-400">Loading national analytics...</div>;
  }

  const { yearComparison, supernumeraryStats, dataQuality, simulatedForecast } = reportData;

  const supernumeraryChartData = [
    { name: 'Tuition Fee Waiver (TFW)', count: supernumeraryStats.tfw, fill: '#FFFFFF' },
    { name: 'EWS Supernumerary', count: supernumeraryStats.ewsSupernumerary, fill: '#A1A1AA' },
    { name: 'PMSSS (J&K)', count: supernumeraryStats.pmsss, fill: '#36D399' },
    { name: 'NRI Admissions', count: supernumeraryStats.nri, fill: '#FBBF24' },
    { name: 'Foreign Nationals', count: supernumeraryStats.foreignNational, fill: '#FB7185' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            National Analytics, Forecasting & Policy Simulation
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#181818] text-neutral-300 border border-[#333333]">
            Intelligent Governance
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Historical enrolment trends, multi-year capacity growth, supernumerary quota distributions, and supervisory what-if policy simulations.
        </p>
      </div>

      {/* Row 1: YoY Growth & Supernumerary Quota Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* YoY Card */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Year-over-Year Progression
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Academic Enrolment Expansion</h3>
            <p className="text-xs text-neutral-400 mt-1">Comparison between 2024-25 and 2025-26 active enrolments.</p>

            <div className="mt-6 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222] flex items-center justify-between">
                <span className="text-xs text-neutral-400">AY 2024-2025 (Previous)</span>
                <span className="text-sm font-extrabold text-white">{yearComparison['2024-2025']} Students</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#333333] flex items-center justify-between">
                <span className="text-xs text-white font-semibold">AY 2025-2026 (Active)</span>
                <span className="text-sm font-extrabold text-white">{yearComparison['2025-2026']} Students</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#222222] flex items-center justify-between text-xs">
            <span className="text-neutral-400">Annual Growth Rate:</span>
            <span className="text-emerald-400 font-extrabold text-base">+{yearComparison.growthPercentage}%</span>
          </div>
        </div>

        {/* Supernumerary & Category Quota Distribution */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121212] border border-[#222222]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Supernumerary & Special Quotas</h3>
              <p className="text-xs text-neutral-400">TFW, EWS, PMSSS, and International student distributions</p>
            </div>
            <span className="text-xs text-neutral-400 font-semibold">Approved AICTE Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supernumeraryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#333333', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                  labelStyle={{ color: '#D4D4D8' }}
                />
                <Bar dataKey="count" name="Enrolled Seats" fill="#FFFFFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Simulated Enrolment Forecasting (Section 26 Feature D) */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white">
                Simulated 5-Year Academic Enrolment Projections (ARIMA Model)
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {simulatedForecast.methodology}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-auto">
            {simulatedForecast.disclaimer}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulatedForecast.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A1A1AA" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#A1A1AA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="year" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#121212', borderColor: '#333333', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                labelStyle={{ color: '#D4D4D8' }}
              />
              <Area type="monotone" dataKey="actual" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Records" />
              <Area type="monotone" dataKey="projected" stroke="#A1A1AA" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorProjected)" name="Projected Trajectory" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Interactive Policy Simulator Tool (Section 26 Feature E) */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#2E2E2E] space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-base font-bold text-white">
              Interactive Supervisory Policy Simulator
            </h3>
            <p className="text-xs text-neutral-400">
              Explore how adjusting regulatory intake monitoring thresholds impacts anomaly alerts across the nation before implementing policy decrees.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A0A0A] p-5 rounded-2xl border border-[#222222]">
          {/* Slider 1: Warning Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-semibold">Near Capacity Warning Threshold:</span>
              <span className="font-extrabold text-amber-400">{warningThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[11px] text-neutral-500">
              Colleges exceeding this utilization percentage trigger an early supervisory warning.
            </p>
          </div>

          {/* Slider 2: Excess Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-semibold">Excess Admission Threshold:</span>
              <span className="font-extrabold text-rose-400">{excessThreshold}%</span>
            </div>
            <input
              type="range"
              min="95"
              max="120"
              step="5"
              value={excessThreshold}
              onChange={(e) => setExcessThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <p className="text-[11px] text-neutral-500">
              Colleges exceeding this utilization limit trigger an immediate regulatory breach review.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={runPolicySimulation}
            disabled={simulating}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-colors shadow-md shadow-white/10"
          >
            {simulating ? 'Calculating Impact...' : 'Simulate Policy Impact'}
          </button>
        </div>

        {/* Simulation Output Dashboard */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-[#000000] border border-[#333333] text-xs space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-white font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulation Results for {simulationResult.programmesEvaluated} Evaluated Programmes:</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#121212] border border-[#222222]">
                <p className="text-neutral-400 text-[11px]">Normal Operations</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{simulationResult.normalCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#121212] border border-[#222222]">
                <p className="text-neutral-400 text-[11px]">Near Capacity Flags</p>
                <p className="text-lg font-bold text-amber-400 mt-0.5">{simulationResult.nearCapacityCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#121212] border border-[#222222]">
                <p className="text-neutral-400 text-[11px]">Excess Breach Alerts</p>
                <p className="text-lg font-bold text-rose-400 mt-0.5">{simulationResult.excessCount}</p>
              </div>
            </div>
            <p className="text-neutral-300 italic pt-1">{simulationResult.impactAnalysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

