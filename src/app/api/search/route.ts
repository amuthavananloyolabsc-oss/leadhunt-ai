
export const dynamic = 'force-dynamic';
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchGoogleMapsPlaces } from '@/lib/google-maps';
import { analyzeWebsite, calculateAIScore } from '@/lib/website-analyzer';
import { getPitchMessage } from '@/lib/outreach-generator';
import pLimit from 'p-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, category, forceRefresh = false } = body;

    if (!city || !category) {
      return NextResponse.json({ error: 'City and category are required' }, { status: 400 });
    }

    // Check cache — if we have fresh leads (< 24h), return them
    if (!forceRefresh) {
      const cached = await prisma.lead.findMany({
        where: {
          city,
          category,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        orderBy: { aiScore: 'desc' },
        take: 50,
      });

      if (cached.length > 0) {
        return NextResponse.json({ leads: cached, fromCache: true, count: cached.length });
      }
    }

    // Log the search
    await prisma.searchLog.create({
      data: { query: `${category} in ${city}`, city, category },
    });

    // Fetch from Google Maps
    const { results } = await searchGoogleMapsPlaces('', city, category);

    // Analyze websites with concurrency limit
    const limit = pLimit(3);

    const enrichedLeads = await Promise.all(
      results.map((r) =>
        limit(async () => {
          let websiteScore: number | null = null;
          let hasWebsite = !!r.website;
          let websiteIssues: string[] = [];

          if (r.website) {
            try {
              const analysis = await analyzeWebsite(r.website);
              websiteScore = analysis.score;
              hasWebsite = analysis.hasWebsite;
              websiteIssues = analysis.issues;
            } catch {
              // keep defaults
            }
          }

          const { score: aiScore, label: aiLabel } = calculateAIScore({
            hasWebsite,
            websiteScore,
            rating: r.rating,
            reviewCount: r.reviewCount,
            hasSocials: false,
            hasWhatsApp: null,
          });

          const needType = !hasWebsite
            ? 'no_website'
            : websiteScore && websiteScore < 50
            ? 'redesign'
            : websiteScore && websiteScore < 70
            ? 'seo'
            : null;

          const lead = {
            source: 'google_maps',
            name: r.name,
            city,
            category,
            phone: r.phone || null,
            email: null,
            website: r.website || null,
            address: r.address || null,
            rating: r.rating || null,
            reviewCount: r.reviewCount || null,
            hasWebsite,
            websiteScore,
            aiScore,
            aiLabel,
            status: 'new',
            placeId: r.placeId,
            lat: r.lat || null,
            lng: r.lng || null,
            needType,
            pitchMessage: '',
          };

          lead.pitchMessage = getPitchMessage(lead as any);
          return lead;
        })
      )
    );

    // Upsert leads (avoid duplicates by placeId)
    const savedLeads = await Promise.all(
      enrichedLeads.map(async (lead) => {
        try {
          return await prisma.lead.upsert({
            where: { placeId: lead.placeId },
            update: {
              rating: lead.rating,
              reviewCount: lead.reviewCount,
              hasWebsite: lead.hasWebsite,
              websiteScore: lead.websiteScore,
              aiScore: lead.aiScore,
              aiLabel: lead.aiLabel,
              needType: lead.needType,
              pitchMessage: lead.pitchMessage,
              updatedAt: new Date(),
            },
            create: lead as any,
          });
        } catch {
          // Skip duplicate or constraint errors
          return null;
        }
      })
    );

    const valid = savedLeads.filter(Boolean);
    valid.sort((a, b) => (b!.aiScore || 0) - (a!.aiScore || 0));

    return NextResponse.json({ leads: valid, fromCache: false, count: valid.length });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
