import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Menjalankan query secara paralel dan transaksional (ACID)
    // Jika satu gagal, semuanya akan dibatalkan otomatis
    await prisma.$transaction([
      // 1. Hapus seluruh data suara
      prisma.vote.deleteMany({}),
      
      // 2. Kembalikan status seluruh user pemilih menjadi false
      prisma.user.updateMany({
        where: { role: 'VOTER' },
        data: { has_voted: false }
      }),
      
      // 3. Catat aktivitas ini ke log (Audit Trail)
      prisma.adminLog.create({
        data: {
          admin_id: "SYSTEM", // Di aplikasi nyata bisa diambil dari session
          action: "RESET_VOTING",
          description: "Admin mereset seluruh data voting dan status user."
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal melakukan reset database." }, { status: 500 });
  }
}