import React, { useState, useMemo } from 'react';
import { ScanRecord, NavigationTab } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Bot,
  UserCheck,
  TrendingUp,
  Cpu,
  PieChart as PieIcon,
  UploadCloud,
  Layers,
} from 'lucide-react';

interface InsightPageProps {
  scans: ScanRecord[];
  onNavigate: (tab: NavigationTab) => void;
}

export const InsightPage: React.FC<InsightPageProps> = ({ scans, onNavigate }) => {
  const [trendView, setTrendView] = useState<'weekly' | 'monthly'>('weekly');

  const totalScans = scans.length;
  const isDataSufficient = totalScans >= 3;

  // Key Statistics Calculations
  const stats = useMemo(() => {
    const aiCount = scans.filter((s) => s.label === 'ai').length;
    const humanCount = scans.filter((s) => s.label === 'human').length;
    const aiRatio = totalScans > 0 ? (aiCount / totalScans) * 100 : 0;
    const humanRatio = totalScans > 0 ? (humanCount / totalScans) * 100 : 0;

    // Generator frequency calculation
    const generatorFrequency: Record<string, number> = {};
    scans.forEach((scan) => {
      if (scan.label === 'ai' && scan.topGenerator) {
        generatorFrequency[scan.topGenerator] = (generatorFrequency[scan.topGenerator] || 0) + 1;
      }
    });

    let mostFrequentGen = 'Belum terdeteksi';
    let maxGenCount = 0;
    Object.entries(generatorFrequency).forEach(([gen, count]) => {
      if (count > maxGenCount) {
        maxGenCount = count;
        mostFrequentGen = gen;
      }
    });

    return {
      total: totalScans,
      aiCount,
      humanCount,
      aiRatio: Math.round(aiRatio),
      humanRatio: Math.round(humanRatio),
      mostFrequentGen,
      maxGenCount,
      generatorFrequency,
    };
  }, [scans, totalScans]);

  // Aggregate trend data (Weekly vs Monthly)
  const trendData = useMemo(() => {
    if (!isDataSufficient) return [];

    if (trendView === 'weekly') {
      // Group by last 5 calendar weeks
      const now = new Date();
      const weeks: { name: string; ai: number; human: number; start: number; end: number }[] = [];
      for (let i = 4; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);

        const startStr = `${start.getDate()}/${start.getMonth() + 1}`;
        const endStr = `${end.getDate()}/${end.getMonth() + 1}`;
        weeks.push({
          name: `${startStr}-${endStr}`,
          ai: 0,
          human: 0,
          start: start.getTime(),
          end: end.getTime(),
        });
      }

      scans.forEach((s) => {
        for (const w of weeks) {
          if (s.createdAt >= w.start && s.createdAt <= w.end) {
            if (s.label === 'ai') w.ai++;
            else w.human++;
            break;
          }
        }
      });

      return weeks.map(({ name, ai, human }) => ({ name, 'AI-Generated': ai, 'Human-Made': human }));
    } else {
      // Group by last 4 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const currentMonth = new Date().getMonth();
      const list: { name: string; 'AI-Generated': number; 'Human-Made': number; monthIndex: number }[] = [];

      for (let i = 3; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        list.push({
          name: months[mIdx],
          'AI-Generated': 0,
          'Human-Made': 0,
          monthIndex: mIdx,
        });
      }

      scans.forEach((s) => {
        const m = new Date(s.createdAt).getMonth();
        const found = list.find((item) => item.monthIndex === m);
        if (found) {
          if (s.label === 'ai') found['AI-Generated']++;
          else found['Human-Made']++;
        }
      });

      return list.map(({ name, 'AI-Generated': ai, 'Human-Made': human }) => ({
        name,
        'AI-Generated': ai,
        'Human-Made': human,
      }));
    }
  }, [scans, trendView, isDataSufficient]);

  // Generator Rankings for Horizontal Bar Chart
  const generatorChartData = useMemo(() => {
    if (!isDataSufficient) return [];

    const entries = Object.entries(stats.generatorFrequency);
    if (entries.length === 0) {
      return [];
    }

    return entries
      .map(([name, count]) => ({
        name,
        jumlah: count,
        persentase: stats.aiCount > 0 ? Math.round((count / stats.aiCount) * 100) : 0,
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [stats, isDataSufficient]);

  // Empty state if fewer than 3 scans
  if (!isDataSufficient) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Wawasan & Tren Analitik</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Visualisasi agregasi statistik hasil deteksi keaslian gambar.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-[#1E2E42]" />
          </div>
          <h2 className="text-base font-semibold text-zinc-800">
            Data Belum Cukup untuk Menampilkan Insight
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-md mx-auto">
            Dibutuhkan minimal 3 pemindaian gambar tersimpan untuk mengkalkulasi distribusi rasio AI vs Human dan peringkat generator secara akurat. Saat ini Anda memiliki {totalScans} pemindaian.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="mt-5 inline-flex items-center gap-2 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Gambar Tambahan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Tren & Statistik Cek Foto</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Lihat perbandingan seberapa sering foto AI ditemukan dibanding foto asli, serta model AI mana yang paling sering nongol.
        </p>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Scans */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Pemindaian
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-zinc-900">{stats.total}</span>
            <span className="text-xs text-zinc-500 ml-2">arsip</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>AI: {stats.aiCount} ({stats.aiRatio}%)</span>
            <span>Human: {stats.humanCount} ({stats.humanRatio}%)</span>
          </div>
        </div>

        {/* AI-Human Ratio */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rasio AI : Human
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center text-[#1E2E42]">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#1E2E42]">
              {stats.aiRatio} : {stats.humanRatio}
            </span>
          </div>
          {/* Flat dual segment bar */}
          <div className="mt-3 w-full h-2 rounded-xs overflow-hidden flex bg-zinc-100 border border-zinc-200">
            <div
              className="bg-[#1E2E42] h-full"
              style={{ width: `${stats.aiRatio}%` }}
              title={`AI: ${stats.aiRatio}%`}
            />
            <div
              className="bg-zinc-400 h-full"
              style={{ width: `${stats.humanRatio}%` }}
              title={`Human: ${stats.humanRatio}%`}
            />
          </div>
        </div>

        {/* Most Frequent Generator */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Generator Paling Dominan
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[#1E2E42]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 truncate">
            <span className="text-xl font-bold text-zinc-900 block truncate">
              {stats.mostFrequentGen}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {stats.maxGenCount > 0 ? (
              <span>Terdeteksi pada {stats.maxGenCount} berkas AI ({Math.round((stats.maxGenCount / (stats.aiCount || 1)) * 100)}% dari kasus AI)</span>
            ) : (
              <span>Tidak ada gambar AI terdeteksi</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart: AI vs Human */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1E2E42]" />
              <span>Tren Pemindaian: AI vs Buatan Manusia</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Grafik perbandingan volume verifikasi berdasarkan rentang waktu.
            </p>
          </div>

          {/* Toggle Weekly / Monthly */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg self-start sm:self-auto text-xs">
            <button
              onClick={() => setTrendView('weekly')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                trendView === 'weekly'
                  ? 'bg-white text-[#1E2E42] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setTrendView('monthly')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                trendView === 'monthly'
                  ? 'bg-white text-[#1E2E42] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="rect"
              />
              <Bar dataKey="AI-Generated" fill="#1E2E42" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Human-Made" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generator Rankings Chart & Breakdown */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1E2E42]" />
              <span>Peringkat Model Generator AI yang Terdeteksi</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Frekuensi dan proporsi arsitektur AI yang teridentifikasi dalam histori.
            </p>
          </div>
        </div>

        {generatorChartData.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Belum ada berkas AI terdeteksi dengan metadata generator dalam riwayat Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Interactive Horizontal Bar Chart via Recharts */}
            <div className="lg:col-span-7 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={generatorChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="jumlah"
                    name="Total Terdeteksi"
                    fill="#1E2E42"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List with clean progress breakdown */}
            <div className="lg:col-span-5 space-y-3 bg-zinc-50 rounded-xl p-4 border border-zinc-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                Distribusi Persentase
              </span>
              {generatorChartData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-800">{item.name}</span>
                    <span className="font-mono text-zinc-600">
                      {item.jumlah} kali ({item.persentase}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200/70 rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-[#1E2E42]"
                      style={{ width: `${item.persentase}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
