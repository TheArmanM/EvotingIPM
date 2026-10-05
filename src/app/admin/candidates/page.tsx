'use client';

import { useState, useEffect } from 'react';

type Candidate = {
  id: string;
  candidate_number: number;
  name: string;
  description: string;
  photo_url: string | null;
};

export default function ManageCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ number: '', name: '', desc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setIsLoading(true);
    const res = await fetch('/api/admin/candidates');
    const data = await res.json();
    setCandidates(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_number: formData.number, name: formData.name, description: formData.desc })
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ number: '', name: '', desc: '' });
      fetchCandidates();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return;
    const res = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCandidates();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, candidateId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB!");
      return;
    }

    setUploadingId(candidateId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}/photo`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchCandidates();
      } else {
        alert("Gagal mengupload foto.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat upload.");
    }
    setUploadingId(null);
  };

  const handleRemovePhoto = async (candidateId: string) => {
    if (!confirm("Yakin ingin menghapus foto calon ini?")) return;
    
    setUploadingId(candidateId);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}/photo`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCandidates(); 
      } else {
        alert("Gagal menghapus foto di database.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
    setUploadingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Calon Formatur</h1>
          <p className="text-slate-500 text-sm">Tambah, edit foto, atau hapus daftar calon.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-700 transition-colors shadow-sm">
          + Tambah Calon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 font-bold text-slate-700">No.</th>
                <th className="py-4 px-6 font-bold text-slate-700">Foto</th>
                <th className="py-4 px-6 font-bold text-slate-700">Nama Calon</th>
                <th className="py-4 px-6 font-bold text-slate-700">Keterangan</th>
                <th className="py-4 px-6 font-bold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6 font-bold text-slate-900">{c.candidate_number}</td>
                    <td className="py-4 px-6">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 group">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 text-center px-1">Tanpa Foto</div>
                        )}
                        
                        {/* Overlay Tombol Ubah & Hapus */}
                        <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center gap-1 transition-all">
                          <label className="cursor-pointer text-white text-[10px] font-bold bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-700 text-center w-3/4">
                            {uploadingId === c.id ? '...' : 'Ubah'}
                            <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => handlePhotoUpload(e, c.id)} disabled={uploadingId === c.id} />
                          </label>
                          
                          {c.photo_url && (
                            <button 
                              onClick={() => handleRemovePhoto(c.id)} 
                              disabled={uploadingId === c.id} 
                              className="text-white text-[10px] font-bold bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-center w-3/4"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{c.description || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:text-red-700 font-semibold text-sm bg-red-50 px-3 py-1.5 rounded-md">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Tambah Calon Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Urut</label>
                <input type="number" required min="1" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Calon</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Jabatan</label>
                <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none resize-none h-24"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border text-slate-700 font-semibold hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}