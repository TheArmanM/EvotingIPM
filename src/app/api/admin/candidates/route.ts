import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mengambil semua data calon
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { candidate_number: 'asc' }
    });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// Menambah calon baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidate_number, name, description } = body;

    // Validasi nomor urut agar tidak ganda
    const existing = await prisma.candidate.findUnique({
      where: { candidate_number: Number(candidate_number) }
    });

    if (existing) {
      return NextResponse.json({ error: "Nomor urut sudah digunakan!" }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        candidate_number: Number(candidate_number),
        name,
        description,
      }
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}