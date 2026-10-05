import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import VotingClient from "@/components/VotingClient";
import LogoutButton from "@/components/LogoutButton"; // Kita buat ini sebentar lagi

const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Jika admin login, arahkan ke dashboard
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // Ambil data user terbaru dari database untuk mengecek status vote
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Jika sudah voting, tampilkan halaman sukses
  if (user.has_voted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Voting Berhasil</h1>
          <p className="text-slate-600 mb-8">Terima kasih, {user.name}. Pilihan Anda telah berhasil disimpan dan diamankan dalam sistem.</p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  // Jika belum voting, ambil daftar calon dan urutkan berdasarkan nomor urut
  const candidates = await prisma.candidate.findMany({
    orderBy: { candidate_number: 'asc' }
  });

  return <VotingClient candidates={candidates} userName={user.name || user.username} />;
}