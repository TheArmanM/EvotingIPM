'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

type Candidate = {
  id: string;
  candidate_number: number;
  name: string;
  description: string | null;
  photo_url: string | null;
};

export default function VotingClient({ 
  candidates, 
  userName 
}: { 
  candidates: Candidate[]; 
  userName: string 
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((candidateId) => candidateId !== id));
    } else {
      if (selected.length < 9) {
        setSelected([...selected, id]);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selected }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh(); // Refresh halaman agar status berubah menjadi "Sudah Memilih"
      } else {
        const data = await res.json();
        alert(data.error || 'Terjadi kesalahan saat voting.');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-yellow-700 hidden sm:block">E-Vote Musyda IPM</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 font-medium">Halo, {userName}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">PEMILIHAN CALON FORMATUR</h2>
          <p className="text-slate-500 mt-1">Silakan pilih tepat <span className="font-bold text-yellow-600">9 calon</span>.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {candidates.map((c) => {
            const isSelected = selected.includes(c.id);
            return (
              <div 
                key={c.id} 
                onClick={() => handleSelect(c.id)}
                className={`cursor-pointer bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-200 ${
                  isSelected ? 'border-yellow-500 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="aspect-[4/3] bg-slate-100 relative">
                  <div className="absolute top-2 left-2 bg-white/90 text-slate-800 font-bold px-3 py-1 rounded-md shadow-sm text-sm">
                    {c.candidate_number}
                  </div>
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{c.name}</h3>
                  {c.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>}
                  
                  {isSelected && (
                    <div className="mt-3 bg-yellow-600 text-white text-sm py-1.5 rounded-md font-bold">
                      Telah Dipilih
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-lg">
            Pilihan Anda: <span className={`font-bold ${selected.length === 9 ? 'text-yellow-600' : 'text-slate-700'}`}>{selected.length} / 9</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={selected.length !== 9}
            className="w-full sm:w-auto bg-yellow-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            SUBMIT VOTE
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Pilihan</h3>
            <p className="text-slate-600 mb-6">
              Anda telah memilih 9 calon. Apakah Anda yakin ingin mengirim pilihan ini? Pilihan yang sudah dikirim tidak dapat diubah kembali.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Kembali
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 disabled:bg-yellow-400 flex justify-center items-center"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kirim Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}