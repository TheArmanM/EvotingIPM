import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar untuk Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-yellow-500">Admin Panel</h2>
          <p className="text-xs text-slate-500 mt-1">E-Vote Musyda IPM</p>
          <div className="mt-3 bg-green-100 text-green-700 text-xs inline-block px-2 py-1 rounded font-semibold border border-green-200">
            🟢 Voting Aktif
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          
<Link href="/admin/candidates" className="px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors">
  👥 Kelola Calon
</Link>
<Link href="/admin" className="px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors">
  👥 Suara Masuk
</Link>
<Link href="/admin/reset" className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-bold transition-colors mt-auto">
  ⚠️ Reset Voting
</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Header Mobile (Hanya tampil di HP) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 p-4 flex justify-between items-center z-50 shadow-sm">
        <h2 className="font-bold text-yellow-700">Admin Panel</h2>
        <div className="w-24"><LogoutButton /></div>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}