import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Perhatikan perubahan pada parameter kedua, kita mendefinisikannya sebagai Promise
export async function DELETE(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Kita harus meng-await params terlebih dahulu di Next.js 15+
    const params = await context.params;
    const id = params.id;

    await prisma.candidate.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus calon. Pastikan ID benar." }, { status: 500 });
  }
}