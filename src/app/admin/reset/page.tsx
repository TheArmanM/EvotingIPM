'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetVotingPage() {
  const [step, setStep] = useState(0); // 0: Awal, 1: Konfirmasi 1, 2: Konfirmasi 2
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        alert("BERHASIL: Seluruh data voting telah direset!");
        router.push('/admin'); // Kembali ke dashboard
        router.refresh();
      } else {
        alert("Gagal melakukan reset.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
    setIsResetting(false);
    setStep(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Danger Zone: Reset Voting</h1>
            <p className="text-slate-500 text-sm">Halaman ini digunakan untuk mengulang proses pemilihan dari awal.</p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-8 text-red-800 text-sm space-y-2">
          <p className="font-bold">PERINGATAN: Tindakan ini akan mengakibatkan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Seluruh data pilihan (suara) akan <strong>dihapus permanen</strong>.</li>
            <li>Status seluruh pemilih (USER) akan dikembalikan menjadi <strong>Belum Memilih</strong>.</li>
            <li>Jumlah suara di dashboard akan kembali menjadi <strong>0</strong>.</li>
            <li className="text-green-700 font-semibold">Data nama calon formatur dan foto TIDAK akan terhapus.</li>
          </ul>
        </div>

        {step === 0 && (
          <button 
            onClick={() => setStep(1)}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors w-full"
          >
            SAYA MENGERTI, RESET VOTING SEKARANG
          </button>
        )}

        {/* Modal Konfirmasi 1 */}
        {step === 1 && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border-t-4 border-red-500">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Pertama</h3>
              <p className="text-slate-600 mb-6">Apakah Anda benar-benar yakin ingin menghapus semua suara?</p>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 px-4 py-2.5 rounded-lg border font-semibold hover:bg-slate-50">Batal</button>
                <button onClick={() => setStep(2)} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Ya, Lanjutkan</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi 2 (Final) */}
        {step === 2 && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border-t-4 border-red-600">
              <h3 className="text-xl font-bold text-red-600 mb-2">KONFIRMASI FINAL!</h3>
              <p className="text-slate-600 mb-6 font-medium">Tindakan ini tidak dapat dibatalkan. Semua suara akan hilang permanen.</p>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} disabled={isResetting} className="flex-1 px-4 py-2.5 rounded-lg border font-semibold hover:bg-slate-50 disabled:opacity-50">Batalkan Semua</button>
                <button onClick={handleReset} disabled={isResetting} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-red-400">
                  {isResetting ? 'Mereset Data...' : 'EKSEKUSI RESET'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}