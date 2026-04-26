export const dynamic = 'force-dynamic';
// src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || undefined;
  const category = searchParams.get('category') || undefined;
  const aiLabel = searchParams.get('aiLabel') || undefined;
  const status = searchParams.get('status') || undefined;

  const where: any = {};
  if (city) where.city = city;
  if (category) where.category = category;
  if (aiLabel) where.aiLabel = aiLabel;
  if (status) where.status = status;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { aiScore: 'desc' },
    take: 1000,
  });

  const rows = [
    ['Name', 'City', 'Category', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Has Website', 'Website Score', 'AI Score', 'Priority', 'Need Type', 'Status', 'Address', 'Notes', 'Added'],
    ...leads.map((l) => [
      l.name,
      l.city,
      l.category,
      l.phone || '',
      l.email || '',
      l.website || '',
      l.rating || '',
      l.reviewCount || '',
      l.hasWebsite ? 'Yes' : 'No',
      l.websiteScore || '',
      l.aiScore || '',
      l.aiLabel || '',
      l.needType || '',
      l.status,
      l.address || '',
      l.notes || '',
      new Date(l.createdAt).toLocaleDateString('en-IN'),
    ]),
  ];

  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leadhunt-export-${Date.now()}.csv"`,
    },
  });
}
