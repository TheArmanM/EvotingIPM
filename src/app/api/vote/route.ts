import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VOTER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { candidateIds } = await req.json();

    if (!Array.isArray(candidateIds) || candidateIds.length !== 9) {
      return NextResponse.json({ error: "Harus memilih tepat 9 calon" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.has_voted) {
      return NextResponse.json({ error: "Anda sudah melakukan voting" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const voteData = candidateIds.map(candidateId => ({
        userId: session.user.id,
        candidateId: candidateId
      }));

      await tx.vote.createMany({ data: voteData });
      await tx.user.update({
        where: { id: session.user.id },
        data: { has_voted: true }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}