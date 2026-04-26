// src/app/api/outreach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOutreachTemplates } from '@/lib/outreach-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, type, message } = body;

    // Log the outreach
    const log = await prisma.outreachLog.create({
      data: { leadId, type, message },
    });

    // Update lead status if still new
    await prisma.lead.updateMany({
      where: { id: leadId, status: 'new' },
      data: { status: 'contacted' },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const templates = generateOutreachTemplates(lead as any);
  return NextResponse.json({ templates });
}
