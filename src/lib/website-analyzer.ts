// src/lib/website-analyzer.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { WebsiteAnalysis } from '@/types';

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  if (!url || url.trim() === '') {
    return { hasWebsite: false, score: 0, issues: ['No website found'] };
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const issues: string[] = [];
  let score = 100;
  let ssl = false;
  let mobile = false;
  let hasContact = false;
  let hasSEO = false;
  let speed: 'fast' | 'medium' | 'slow' = 'medium';

  try {
    const start = Date.now();
    const response = await axios.get(normalizedUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadHuntBot/1.0; +https://leadhunt.ai/bot)',
      },
      maxRedirects: 3,
    });
    const elapsed = Date.now() - start;

    // Speed check
    if (elapsed > 5000) {
      score -= 20;
      issues.push('Very slow load time (>5s)');
      speed = 'slow';
    } else if (elapsed > 2500) {
      score -= 10;
      issues.push('Slow load time (>2.5s)');
      speed = 'medium';
    } else {
      speed = 'fast';
    }

    // SSL check
    ssl = normalizedUrl.startsWith('https://');
    if (!ssl) {
      score -= 15;
      issues.push('No SSL (not HTTPS)');
    }

    const $ = cheerio.load(response.data);

    // Mobile check
    const viewport = $('meta[name="viewport"]').attr('content');
    if (viewport && viewport.includes('width=device-width')) {
      mobile = true;
    } else {
      score -= 20;
      issues.push('Not mobile-friendly (no viewport meta)');
    }

    // SEO checks
    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content');
    const h1 = $('h1').length;

    if (!title || title.length < 5) {
      score -= 10;
      issues.push('Missing or weak page title');
    }
    if (!metaDesc) {
      score -= 10;
      issues.push('Missing meta description');
    }
    if (h1 === 0) {
      score -= 5;
      issues.push('No H1 heading found');
    }

    if (title && metaDesc && h1 > 0) hasSEO = true;

    // Contact check
    const bodyText = $('body').text().toLowerCase();
    const hasPhone = /(\+91|0)[- ]?[6-9]\d{9}/.test(bodyText) || bodyText.includes('contact');
    const hasEmail = bodyText.includes('@') && bodyText.includes('.');
    const hasForm = $('form').length > 0;

    if (!hasPhone && !hasEmail && !hasForm) {
      score -= 15;
      issues.push('No contact info or form visible');
    } else {
      hasContact = true;
    }

    // WhatsApp check
    const hasWA = bodyText.includes('whatsapp') || $('[href*="wa.me"]').length > 0 || $('[href*="whatsapp"]').length > 0;
    if (!hasWA) {
      score -= 5;
      issues.push('No WhatsApp CTA');
    }

    // Old/dated HTML
    const hasBootstrap3 = response.data.includes('bootstrap.min.css') && response.data.includes('col-xs-');
    const hasJQuery = response.data.includes('jquery') && !response.data.includes('react') && !response.data.includes('vue');
    if (hasBootstrap3) {
      score -= 10;
      issues.push('Uses outdated Bootstrap 3');
    }

    // Social presence
    const hasSocials = bodyText.includes('facebook.com') || bodyText.includes('instagram.com') || bodyText.includes('linkedin.com');
    if (!hasSocials) {
      score -= 5;
      issues.push('No social media links');
    }

    score = Math.max(0, Math.min(100, score));

    return { hasWebsite: true, score, issues, ssl, mobile, speed, hasContact, hasSEO };
  } catch (err: any) {
    // Timeout or unreachable
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      issues.push('Website unreachable or very slow');
      return { hasWebsite: true, score: 10, issues };
    }
    if (err.response?.status === 404) {
      issues.push('Website returns 404 - possibly broken');
      return { hasWebsite: true, score: 5, issues };
    }
    // Can't reach but URL was provided
    issues.push('Could not analyze website');
    return { hasWebsite: true, score: 30, issues };
  }
}

export function calculateAIScore(lead: {
  hasWebsite: boolean;
  websiteScore?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  hasSocials?: boolean | null;
  hasWhatsApp?: boolean | null;
  needType?: string | null;
}): { score: number; label: 'hot' | 'warm' | 'cold' } {
  let score = 0;

  // No website is a huge signal
  if (!lead.hasWebsite) score += 40;
  else if (lead.websiteScore && lead.websiteScore < 50) score += 20;
  else if (lead.websiteScore && lead.websiteScore < 70) score += 10;

  // Poor reviews/ratings
  if (!lead.reviewCount || lead.reviewCount < 5) score += 10;
  if (lead.rating && lead.rating < 3.5) score += 5;

  // No socials
  if (!lead.hasSocials) score += 10;

  // No SEO (inferred from website score)
  if (lead.websiteScore && lead.websiteScore < 60) score += 10;

  // No WhatsApp
  if (!lead.hasWhatsApp) score += 10;

  // Hiring/high intent
  if (lead.needType === 'hiring') score += 15;

  score = Math.min(100, score);

  const label: 'hot' | 'warm' | 'cold' =
    score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';

  return { score, label };
}
