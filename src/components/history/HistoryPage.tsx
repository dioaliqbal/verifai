import React, { useState, useMemo } from 'react';
import { ScanRecord } from '../../types';
import {
  Search,
  Filter,
  Calendar,
  Layers,
  X,
  Shield,
  Bot,
  UserCheck,
  Clock,
  Trash2,
} from 'lucide-react';

interface HistoryPageProps {
  scans: ScanRecord[];
  onDeleteScan: (id: string) => void;
  onClearAllScans?: () => void;
  selectedScanForModal?: ScanRecord | null;
  onClearSelectedScan?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  scans,
  onDeleteScan,
  onClearAllScans,
  selectedScanForModal,
  onClearSelectedScan,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'human'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalScan, setActiveModalScan] = useState<ScanRecord | null>(
    selectedScanForModal || null
  );

  // Synchronize prop if updated
  React.useEffect(() => {
    if (selectedScanForModal) {
      setActiveModalScan(selectedScanForModal);
    }
  }, [selectedScanForModal]);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      // Filter label
      if (filterType === 'ai' && scan.label !== 'ai') return false;
      if (filterType === 'human' && scan.label !== 'human') return false;

      // Search query (matches file name, label, generator, or date string)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const dateStr = new Date(scan.createdAt).toLocaleDateString('id-ID');
        const matchName = scan.fileName.toLowerCase().includes(query);
        const matchLabel = scan.label.toLowerCase().includes(query);
        const matchGen = (scan.topGenerator || '').toLowerCase().includes(query);
        const matchDate = dateStr.includes(query);
        return matchName || matchLabel || matchGen || matchDate;
      }

      return true;
    });
  }, [scans, filterType, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const closeModal = () => {
    setActiveModalScan(null);
    if (onClearSelectedScan) {
      onClearSelectedScan();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Riwayat Cek Foto</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Semua foto yang pernah kamu periksa tersimpan rapi di sini.
          </p>
        </div>
        {scans.length > 0 && onClearAllScans && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kamu yakin mau menghapus semua riwayat cek foto? Semua riwayat akan hilang permanen dari web.')) {
                onClearAllScans();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari foto lewat nama file, jenis AI, atau tanggal..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#1E2E42] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-[#1E2E42] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Semua ({scans.length})
          </button>
          <button
            onClick={() => setFilterType('ai')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'ai'
                ? 'bg-white text-[#1E2E42] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>AI ({scans.filter((s) => s.label === 'ai').length})</span>
          </button>
          <button
            onClick={() => setFilterType('human')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'human'
                ? 'bg-white text-[#1E2E42] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Human ({scans.filter((s) => s.label === 'human').length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredScans.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
          <Filter className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800">Tidak Ada Pemindaian yang Cocok</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {scans.length === 0
              ? 'Anda belum memiliki riwayat scan gambar. Unggah gambar untuk memulai.'
              : 'Tidak ditemukan hasil yang cocok dengan kata kunci atau filter yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScans.map((scan) => {
            const isAi = scan.label === 'ai';
            return (
              <div
                key={scan.id}
                onClick={() => setActiveModalScan(scan)}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer flex flex-col group"
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden border-b border-zinc-100">
                  <img
                    src={scan.thumbnailUrl || scan.imageUrl}
                    alt={scan.fileName}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Subtle Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-xs ${
                        isAi
                          ? 'bg-white/95 border-[#CBD5E1] text-[#1E2E42]'
                          : 'bg-white/95 border-zinc-300 text-zinc-800'
                      }`}
                    >
                      {isAi ? 'AI-Generated' : 'Human-Made'}
                    </span>
                    <button
                      type="button"
                      title="Hapus foto ini dari riwayat"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Hapus "${scan.fileName}" dari riwayat? Foto ini akan langsung hilang dari web.`)) {
                          onDeleteScan(scan.id);
                        }
                      }}
                      className="p-1 rounded-md bg-white/90 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 border border-zinc-200 transition-colors cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 truncate group-hover:text-[#1E2E42] transition-colors">
                      {scan.fileName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{formatDate(scan.createdAt)}</span>
                    </div>
                  </div>

                  {/* Horizontal mini bar */}
                  <div className="pt-2 border-t border-zinc-100">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-zinc-500">Skor AI</span>
                      <span className="font-mono font-bold text-[#1E2E42]">
                        {Math.round(scan.aiScore * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200">
                      <div
                        className="h-full bg-[#1E2E42]"
                        style={{ width: `${Math.round(scan.aiScore * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Generator tag if AI */}
                  {isAi && scan.topGenerator && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-600 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                      <Layers className="w-3 h-3 text-zinc-400" />
                      <span className="truncate">Model: {scan.topGenerator}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeModalScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E2E42]">Detail Pemindaian Forensik</h3>
                <p className="text-xs text-zinc-500">{activeModalScan.fileName}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Image */}
                <div className="w-full sm:w-1/2 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 aspect-4/3 flex items-center justify-center">
                  <img
                    src={activeModalScan.imageUrl}
                    alt={activeModalScan.fileName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="w-full sm:w-1/2 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                      Status Deteksi
                    </span>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold ${
                        activeModalScan.label === 'ai'
                          ? 'bg-[#F0F4F8] border-[#CBD5E1] text-[#1E2E42]'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-[#1E2E42]" />
                      <span>
                        {activeModalScan.label === 'ai'
                          ? 'Terdeteksi AI-Generated'
                          : 'Terdeteksi Buatan Manusia'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-500">Waktu Scan:</span>
                      <span className="font-medium text-zinc-800">
                        {formatDate(activeModalScan.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-500">Probabilitas AI:</span>
                      <span className="font-bold text-[#1E2E42]">
                        {Math.round(activeModalScan.aiScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2.5 bg-zinc-100 rounded-md overflow-hidden border border-zinc-200">
                      <div
                        className="h-full bg-[#1E2E42]"
                        style={{ width: `${Math.round(activeModalScan.aiScore * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Generator breakdown */}
                  {activeModalScan.label === 'ai' &&
                    activeModalScan.generatorScores &&
                    activeModalScan.generatorScores.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <span className="text-xs font-semibold text-zinc-700 block">
                          Distribusi Model Generator:
                        </span>
                        <div className="space-y-1.5">
                          {activeModalScan.generatorScores.map((gen, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-600">{gen.name}</span>
                                <span className="font-mono text-zinc-800">
                                  {Math.round(gen.score * 100)}%
                                </span>
                              </div>
                              <div className="w-full h-1 bg-zinc-100 rounded-xs overflow-hidden border border-zinc-200/60">
                                <div
                                  className="h-full bg-[#2D4460]"
                                  style={{ width: `${Math.round(gen.score * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Hapus "${activeModalScan.fileName}" dari riwayat? Foto ini akan langsung dihapus permanen dari web.`)) {
                    onDeleteScan(activeModalScan.id);
                    closeModal();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto Ini Permanen</span>
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-white border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
