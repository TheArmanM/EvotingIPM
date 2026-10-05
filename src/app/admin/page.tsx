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
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-yellow-400">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Statistik</h1>
            <p className="text-slate-500 font-medium text-sm">Pantau perkembangan pemungutan suara secara realtime.</p>
          </div>
        </div>
      </div>

      {/* Cards Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Total Peserta</p>
          <h3 className="text-3xl font-black text-slate-800 relative z-10">{totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-green-300 transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Sudah Memilih</p>
          <h3 className="text-3xl font-black text-green-600 relative z-10">{votedUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Belum Memilih</p>
          <h3 className="text-3xl font-black text-red-600 relative z-10">{unvotedUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-yellow-300 transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Progress</p>
          <h3 className="text-3xl font-black text-yellow-600 relative z-10">{progressPercent}%</h3>
        </div>
      </div>

      {/* Progress Bar Besar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between mb-3 items-end">
          <span className="font-bold text-slate-800 text-lg">Tingkat Partisipasi</span>
          <span className="font-black text-yellow-600 text-xl">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden border border-slate-200/60 p-0.5">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2" 
            style={{ width: `${progressPercent}%` }}
          >
            {/* Efek kilap pada progress bar */}
            <div className="w-full h-1 bg-white/30 rounded-full mt-[-8px]"></div>
          </div>
        </div>
      </div>

      {/* Grafik & Tabel Suara */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-8 border-b-2 border-yellow-400 pb-2 inline-block">
          Perolehan Suara Calon Formatur
        </h2>
        
        {/* Render Grafik */}
        <div className="h-80 w-full min-w-full mb-10 overflow-x-auto">
           <div className="min-w-[600px] h-full">
             <VoteChart data={chartData} />
           </div>
        </div>

        {/* Tabel Hasil Detail */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-4 px-5 font-bold text-slate-700 w-20 text-center">No. Urut</th>
                <th className="py-4 px-5 font-bold text-slate-700">Nama Calon</th>
                <th className="py-4 px-5 font-bold text-slate-700 text-right">Jumlah Suara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((c) => (
                <tr key={c.nomor} className="hover:bg-yellow-50/50 transition-colors">
                  <td className="py-3 px-5 text-slate-900 font-bold text-center">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-sm">
                      {c.nomor}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-800 font-semibold">{c.name}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="inline-flex items-center justify-center min-w-[100px] bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-sm border border-yellow-200">
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