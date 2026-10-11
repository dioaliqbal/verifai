import React from 'react';
import { ScanRecord, NavigationTab } from '../../types';
import { UploadCloud, CheckCircle2, Bot, Image as ImageIcon, ArrowUpRight, ShieldCheck, Clock, Cpu } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface DashboardPageProps {
  scans: ScanRecord[];
  onNavigate: (tab: NavigationTab) => void;
  onViewDetail: (scan: ScanRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  scans,
  onNavigate,
  onViewDetail,
}) => {
  const totalScans = scans.length;
  const aiScans = scans.filter((s) => s.label === 'ai').length;
  const humanScans = scans.filter((s) => s.label === 'human').length;

  const aiPercentage = totalScans > 0 ? Math.round((aiScans / totalScans) * 100) : 0;
  const humanPercentage = totalScans > 0 ? Math.round((humanScans / totalScans) * 100) : 0;

  const recentScans = scans.slice(0, 5);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Ringkasan Cek Foto</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pantau semua foto yang sudah kamu periksa dan lihat langsung seberapa banyak yang buatan AI vs hasil foto asli.
          </p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="inline-flex items-center justify-center gap-2 bg-[#1E2E42] hover:bg-[#162332] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Cek Foto Sekarang</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Scanned */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Total Gambar Discan
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-zinc-900">{totalScans}</span>
            <span className="text-xs text-zinc-600 ml-2">gambar</span>
          </div>
          <div className="mt-2 text-xs text-zinc-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E2E42]" />
            <span>Terekam dalam arsip audit</span>
          </div>
        </div>

        {/* AI Detected */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Terdeteksi AI
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0F4F8] flex items-center justify-center text-[#1E2E42]">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1E2E42]">{aiScans}</span>
            <span className="text-xs font-medium text-zinc-600">
              ({aiPercentage}% dari total)
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-600">
            Sintetis dari model difusi & generator
          </div>
        </div>

        {/* Human Detected */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Terdeteksi Human
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-800">{humanScans}</span>
            <span className="text-xs font-medium text-zinc-600">
              ({humanPercentage}% dari total)
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-600">
            Fotografi asli atau karya tangan manusia
          </div>
        </div>
      </div>

      {/* Main Action Banner */}
      <div className="bg-gradient-to-r from-[#1E2E42] via-[#22354c] to-[#2B3F58] rounded-xl p-6 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BrandLogo size={52} variant="dark" className="shrink-0 ring-1 ring-white/10 rounded-xl" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">Mau periksa foto baru?</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Cpu className="w-2.5 h-2.5" />
                Sightengine Siap
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-xl">
              Tinggal upload foto apa saja. Sistem kami langsung mengecek kehalusan tekstur dan jejak generator seperti Midjourney, Flux, SDXL, atau DALL-E.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="shrink-0 bg-white hover:bg-zinc-100 text-[#1E2E42] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
        >
          <span>Mulai Cek Foto</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Aktivitas Terakhir Section */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Riwayat Cek Terakhir</h2>
          </div>
          {scans.length > 5 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-[#1E2E42] hover:underline font-medium cursor-pointer"
            >
              Lihat Semua ({scans.length})
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          /* Empty state */
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-800">Belum Ada Foto yang Kamu Cek</h3>
            <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
              Yuk coba upload foto pertamamu buat lihat apakah itu asli jepretan kamera atau buatan AI.
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-4 inline-flex items-center gap-2 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Foto Pertamamu</span>
            </button>
          </div>
        ) : (
          /* List of 5 scans */
          <div className="divide-y divide-zinc-100">
            {recentScans.map((scan) => {
              const isAi = scan.label === 'ai';
              return (
                <div
                  key={scan.id}
                  onClick={() => onViewDetail(scan)}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Small thumbnail */}
                    <img
                      src={scan.thumbnailUrl || scan.imageUrl}
                      alt={scan.fileName}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-[#1E2E42] transition-colors">
                        {scan.fileName}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {formatDate(scan.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Calm status badge with subtle accent variant */}
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                          isAi
                            ? 'bg-[#F0F4F8] border-[#CBD5E1] text-[#1E2E42]'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {isAi ? 'AI-Generated' : 'Buatan Manusia'}
                      </span>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {Math.round(scan.aiScore * 100)}% probabilitas AI
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
