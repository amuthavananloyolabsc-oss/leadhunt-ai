// src/app/api/crm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Bulk status update
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || !status) {
      return NextResponse.json({ error: 'ids[] and status required' }, { status: 400 });
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { status, updatedAt: new Date() },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get CRM pipeline stats
export async function GET() {
  const pipeline = await prisma.lead.groupBy({
    by: ['status'],
    _count: { id: true },
    orderBy: { status: 'asc' },
  });

  return NextResponse.json({ pipeline });
}
