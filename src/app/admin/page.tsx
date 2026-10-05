import { PrismaClient } from "@prisma/client";
import VoteChart from "@/components/charts/VoteChart";

const prisma = new PrismaClient();

// Memaksa Next.js untuk selalu mengambil data terbaru (tidak di-cache/statis)
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 1. Ambil Statistik User
  const totalUsers = await prisma.user.count({ where: { role: 'VOTER' } });
  const votedUsers = await prisma.user.count({ where: { role: 'VOTER', has_voted: true } });
  const unvotedUsers = totalUsers - votedUsers;
  const progressPercent = totalUsers === 0 ? 0 : Math.round((votedUsers / totalUsers) * 100);

  // 2. Ambil Data Calon beserta Jumlah Suaranya
  const candidates = await prisma.candidate.findMany({
    include: {
      _count: {
        select: { votes: true }
      }
    },
    orderBy: { candidate_number: 'asc' }
  });

  // 3. Format data untuk Grafik (Recharts)
  const chartData = candidates.map(c => ({
    name: c.name,
    nomor: c.candidate_number,
    suara: c._count.votes,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Statistik</h1>
        <p className="text-slate-500">Pantau perkembangan pemungutan suara secara realtime.</p>
      </div>

      {/* Cards Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-400">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Peserta</p>
          <h3 className="text-3xl font-bold text-slate-800">{totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Sudah Memilih</p>
          <h3 className="text-3xl font-bold text-green-600">{votedUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Belum Memilih</p>
          <h3 className="text-3xl font-bold text-red-600">{unvotedUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">Progress Pemilihan</p>
          <h3 className="text-3xl font-bold text-blue-600">{progressPercent}%</h3>
        </div>
      </div>

      {/* Progress Bar Besar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-slate-700">Tingkat Partisipasi</span>
          <span className="font-bold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Grafik & Tabel Suara */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Perolehan Suara Calon</h2>
        
        {/* Render Grafik (Hanya tampil di layar yang cukup besar agar rapi) */}
        <div className="h-80 w-full min-w-full mb-8 overflow-x-auto">
           <div className="min-w-[600px] h-full">
             <VoteChart data={chartData} />
           </div>
        </div>

        {/* Tabel Hasil Detail */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="py-3 px-4 font-bold text-slate-700 rounded-tl-lg">No</th>
                <th className="py-3 px-4 font-bold text-slate-700">Nama Calon</th>
                <th className="py-3 px-4 font-bold text-slate-700 rounded-tr-lg">Jumlah Suara</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((c) => (
                <tr key={c.nomor} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-900 font-bold">{c.nomor}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{c.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                      {c.suara} Suara
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}