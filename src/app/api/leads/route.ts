
export const dynamic = 'force-dynamic';
// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get('city') || undefined;
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const needType = searchParams.get('needType') || undefined;
  const aiLabel = searchParams.get('aiLabel') || undefined;
  const hasWebsite = searchParams.get('hasWebsite');
  const query = searchParams.get('query') || undefined;
  const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sortBy') || 'aiScore';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const where: any = {};

  if (city) where.city = city;
  if (category) where.category = category;
  if (status) where.status = status;
  if (needType) where.needType = needType;
  if (aiLabel) where.aiLabel = aiLabel;
  if (hasWebsite !== null && hasWebsite !== undefined) where.hasWebsite = hasWebsite === 'true';
  if (minScore) where.aiScore = { gte: minScore };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead = await prisma.lead.create({ data: body });
    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
