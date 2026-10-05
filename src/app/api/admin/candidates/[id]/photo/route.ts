import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const candidateId = params.id;
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Buat nama file unik (gabungan ID calon dan waktu upload)
    const fileExt = file.name.split('.').pop();
    const fileName = `${candidateId}-${Date.now()}.${fileExt}`;

    // Upload ke Supabase Storage (Bucket: candidates)
    const { error: uploadError } = await supabase
      .storage
      .from('candidates')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // Dapatkan URL publik gambar tersebut
    const { data: { publicUrl } } = supabase
      .storage
      .from('candidates')
      .getPublicUrl(fileName);

    // Simpan URL tersebut ke database Prisma
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { photo_url: publicUrl }
    });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal upload foto." }, { status: 500 });
  }
}

// FUNGSI DELETE: Untuk menghapus foto
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const candidateId = params.id;

    // 1. Ambil data URL dari database
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (candidate?.photo_url) {
      // Ambil nama file dari ujung URL
      const urlParts = candidate.photo_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Hapus file fisiknya dari Supabase Storage
      await supabase.storage.from('candidates').remove([fileName]);
    }

    // 2. Update database: Ubah photo_url menjadi null (kosong)
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { photo_url: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}