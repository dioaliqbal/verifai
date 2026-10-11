import React, { useState, useRef } from 'react';
import { analyzeImage } from '../../services/analyzer';
import { StorageService } from '../../services/storage';
import { DetectionOutput, ScanRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Cpu,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface UploadPageProps {
  onScanSaved: (newScan: ScanRecord) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onScanSaved }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionOutput | null>(null);
  const [savedScan, setSavedScan] = useState<ScanRecord | null>(null);

  const handleFile = (file: File) => {
    setAnalysisError(null);
    setResult(null);
    setSavedScan(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setAnalysisError('Format berkas tidak didukung. Mohon gunakan format JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setAnalysisError('Ukuran gambar melebihi batas maksimum 20MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile || !imagePreview) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // Call the requested analyzeImage(imageFile) function
      const detection = await analyzeImage(selectedFile);
      setResult(detection);

      // Automatically persist result
      const currentUserId = user?.id || 'demo-user';
      const record = StorageService.saveScan(
        currentUserId,
        selectedFile,
        imagePreview,
        detection
      );
      setSavedScan(record);
      onScanSaved(record);
    } catch (err: any) {
      setAnalysisError(err?.message || 'Gagal menganalisis gambar. Silakan coba kembali.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setSavedScan(null);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Cek Keaslian Foto</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Upload fotomu dan biarkan sistem memeriksa apakah gambar ini asli jepretan kamera atau dibuat oleh generator AI.
        </p>
      </div>

      {analysisError && (
        <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-xs text-zinc-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#1E2E42] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Catatan Foto</span>
            <span>{analysisError}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!result ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 md:p-8 space-y-6">
          {!imagePreview ? (
            /* Drag & Drop Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1E2E42] bg-[#F0F4F8]'
                  : 'border-zinc-300 hover:border-zinc-400 bg-[#FAFAFA]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-[#1E2E42] shadow-xs mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-zinc-800">
                Tarik & taruh fotomu di sini
              </h3>
              <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
                Bisa pakai file JPG, PNG, atau WEBP sampai 20MB.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                <FileImage className="w-4 h-4" />
                <span>Pilih Foto dari Perangkat</span>
              </button>
            </div>
          ) : (
            /* File Selected & Preview Mode */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Image Preview Container (Note: No bounding boxes or highlight regions as specified) */}
                <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900/5 flex items-center justify-center relative aspect-4/3">
                  <img
                    src={imagePreview}
                    alt="Preview Unggahan"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* File Meta Details */}
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Informasi Berkas
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-200/60">
                        <span className="text-zinc-600">Nama File:</span>
                        <span className="font-medium text-zinc-800 truncate max-w-[200px]">
                          {selectedFile?.name}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-200/60">
                        <span className="text-zinc-600">Ukuran:</span>
                        <span className="font-medium text-zinc-800">
                          {selectedFile && formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-600">Tipe MIME:</span>
                        <span className="font-medium text-zinc-800 font-mono">
                          {selectedFile?.type || 'image/jpeg'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F0F4F8] border border-[#CBD5E1] text-[11px] text-[#1E2E42] flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Sistem memeriksa keseluruhan foto, mulai dari gradasi cahaya sampai tekstur pori dan noise piksel.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={handleStartAnalysis}
                      className="flex-1 py-3 px-5 bg-[#1E2E42] hover:bg-[#162332] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Lagi Mengecek Foto...</span>
                        </>
                      ) : (
                        <>
                          <span>Mulai Periksa Foto</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={handleReset}
                      className="py-3 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiet Loading State */}
              {analyzing && (
                <div className="p-6 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-[#1E2E42] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-zinc-800">
                      Mengecek apakah ada tanda-tanda generator AI atau ini foto asli...
                    </p>
                  </div>
                  {/* Clean Skeleton */}
                  <div className="space-y-2 pt-1">
                    <div className="h-3 bg-zinc-200 rounded-sm w-3/4 animate-pulse" />
                    <div className="h-3 bg-zinc-200 rounded-sm w-1/2 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Result Card View */
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          {/* Card Header & Result Banner */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Image thumbnail / view */}
              <div className="w-full md:w-5/12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900/5 aspect-4/3 flex items-center justify-center shrink-0">
                <img
                  src={imagePreview || ''}
                  alt="Hasil Analisis"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Analysis Evaluation Breakdown */}
              <div className="w-full md:w-7/12 space-y-5">
                {/* Status Label & Engine Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                      Hasil Pemeriksaan Foto
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Cpu className="w-3 h-3 text-emerald-600" />
                      <span>{result.provider || 'Sightengine AI Vision'}</span>
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-base font-bold w-full ${
                      result.label === 'ai'
                        ? 'bg-[#F0F4F8] border-[#CBD5E1] text-[#1E2E42]'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <BrandLogo size={24} variant="transparent" />
                    <span>
                      {result.label === 'ai'
                        ? 'Gambar Ini Buatan AI'
                        : 'Gambar Ini Asli Jepretan Manusia'}
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar for ai_score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-zinc-700">Tingkat Kemiripan AI</span>
                    <span className="font-mono font-bold text-[#1E2E42] text-sm">
                      {Math.round(result.ai_score * 100)}% kemungkinan AI
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-md overflow-hidden border border-zinc-200">
                    <div
                      className="h-full bg-[#1E2E42] transition-all duration-500 ease-out"
                      style={{ width: `${Math.round(result.ai_score * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                    <span>0% (Asli Manusia)</span>
                    <span>50% (Batas Netral)</span>
                    <span>100% (Pasti AI)</span>
                  </div>
                </div>

                {/* Generator breakdown if label is AI */}
                {result.label === 'ai' && result.generator_scores && result.generator_scores.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Estimasi Sumber Generator</span>
                      </span>
                      {result.top_generator && (
                        <span className="text-[11px] font-medium text-zinc-600">
                          Paling Mirip: <strong className="text-zinc-800">{result.top_generator}</strong>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {result.generator_scores.map((gen, idx) => {
                        const pct = Math.round(gen.score * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-700 font-medium">{gen.name}</span>
                              <span className="font-mono text-zinc-600">{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200/60">
                              <div
                                className="h-full bg-[#2D4460]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Saved confirmation badge */}
                <div className="pt-2 flex items-center gap-2 text-xs text-zinc-600">
                  <CheckCircle className="w-4 h-4 text-[#1E2E42]" />
                  <span>Hasil telah otomatis tersimpan ke Histori Pemindaian.</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Scan Gambar Lain</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
