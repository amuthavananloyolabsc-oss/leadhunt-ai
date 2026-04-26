// src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { outreachLogs: { orderBy: { createdAt: 'desc' } } },
  });

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(lead);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
