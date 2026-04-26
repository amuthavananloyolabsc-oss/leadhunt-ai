// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalLeads,
    newToday,
    noWebsite,
    highPriority,
    hotLeads,
    warmLeads,
    coldLeads,
    recentLeads,
    cityBreakdown,
    categoryBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.lead.count({ where: { hasWebsite: false } }),
    prisma.lead.count({ where: { aiScore: { gte: 60 } } }),
    prisma.lead.count({ where: { aiLabel: 'hot' } }),
    prisma.lead.count({ where: { aiLabel: 'warm' } }),
    prisma.lead.count({ where: { aiLabel: 'cold' } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, city: true, category: true, aiScore: true, aiLabel: true, createdAt: true },
    }),
    prisma.lead.groupBy({
      by: ['city'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.lead.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    totalLeads,
    newToday,
    noWebsite,
    highPriority,
    hotLeads,
    warmLeads,
    coldLeads,
    recentLeads,
    cityBreakdown,
    categoryBreakdown,
    statusBreakdown,
  });
}
