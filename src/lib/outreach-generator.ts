// src/lib/outreach-generator.ts
import type { Lead, OutreachTemplate } from '@/types';

export function generateOutreachTemplates(lead: Lead): OutreachTemplate[] {
  const name = lead.name;
  const city = lead.city;
  const category = lead.category;
  const templates: OutreachTemplate[] = [];

  // Determine the main pitch angle
  let pitchAngle = '';
  let service = 'digital services';

  if (!lead.hasWebsite) {
    pitchAngle = `I noticed ${name} doesn't have a website yet`;
    service = 'a professional website';
  } else if (lead.websiteScore && lead.websiteScore < 50) {
    pitchAngle = `I checked ${name}'s website and found several issues that may be costing you customers`;
    service = 'a website redesign';
  } else if (lead.needType === 'seo') {
    pitchAngle = `I noticed ${name} isn't ranking well on Google for ${category.toLowerCase()} in ${city}`;
    service = 'SEO services';
  } else if (lead.needType === 'hiring') {
    pitchAngle = `I saw you're looking for a developer`;
    service = 'freelance development services';
  } else {
    pitchAngle = `I was researching ${category.toLowerCase()} businesses in ${city}`;
    service = 'digital marketing services';
  }

  // WhatsApp message (short & direct)
  templates.push({
    type: 'whatsapp',
    message: `Hi! 👋 I'm a web developer based in India. ${pitchAngle} and wanted to reach out.

I help ${category.toLowerCase()} businesses like yours get more customers online through ${service}.

✅ Professional design
✅ Mobile-friendly
✅ Fast & secure
✅ WhatsApp integration

Can I share a quick proposal? It'll take just 2 minutes to review. 🙏`,
  });

  // Email (more formal)
  templates.push({
    type: 'email',
    subject: `Help ${name} Get More Customers Online | Quick Proposal`,
    message: `Dear ${name} Team,

I hope this message finds you well. My name is [Your Name], and I'm a web developer specializing in helping ${category.toLowerCase()} businesses in ${city} grow their online presence.

${pitchAngle}. In today's digital landscape, having a strong online presence is crucial to staying competitive and attracting new customers.

Here's what I can offer ${name}:

• ${service.charAt(0).toUpperCase() + service.slice(1)} — built specifically for your business
• Mobile-responsive design (70%+ customers search on phones)
• Google SEO optimization to appear in local searches
• WhatsApp & inquiry form integration
• Fast delivery (7-14 days)

I've worked with similar businesses in ${city} and helped them increase their online inquiries significantly.

I'd love to offer you a FREE 15-minute consultation and a no-obligation quote.

Looking forward to hearing from you!

Best regards,
[Your Name]
[Your Phone]
[Your Portfolio URL]`,
  });

  // Instagram DM (casual)
  templates.push({
    type: 'instagram',
    message: `Hey ${name}! 👋

Love what you're doing in ${city}! ${pitchAngle} and thought I'd reach out.

I build websites & digital presence for ${category.toLowerCase()} businesses — fast, affordable & mobile-ready 📱

Would love to help you get more customers online! Can I share some examples of my work? 🙏

#WebDevelopment #${city} #${category.replace(/\s/g, '')}`,
  });

  // Call script
  templates.push({
    type: 'call',
    message: `📞 Call Script for ${name}:

Opening:
"Hi, is this ${name}? Great! My name is [Your Name], I'm a web developer based in India. I'm calling because ${pitchAngle.toLowerCase()}, and I specialize in helping ${category.toLowerCase()} businesses like yours get more customers through their website."

Key Points:
• "Most people in ${city} search Google before visiting a business — you want to be there when they do."
• "I can build you ${service} quickly and affordably."
• "I've helped similar businesses in ${city} get 3x more online inquiries."

Handle Objection "Not interested":
"I totally understand. Can I just email you a quick case study of a similar business I helped? No obligation at all."

Close:
"Would you be open to a 10-minute Zoom call this week? I can show you exactly what I'd do for ${name} — completely free of charge."

Follow-up if no answer:
Send WhatsApp message + email same day.`,
  });

  return templates;
}

export function getPitchMessage(lead: Lead): string {
  if (!lead.hasWebsite) {
    return `${lead.name} has NO website — this is a RED HOT lead. They're losing customers daily to competitors who are online. Pitch: Professional website starting ₹15,000-₹50,000.`;
  }
  if (lead.websiteScore && lead.websiteScore < 40) {
    return `${lead.name}'s website is critically outdated with major issues. High chance of redesign interest. Estimated budget: ₹30,000-₹1,00,000.`;
  }
  if (lead.websiteScore && lead.websiteScore < 60) {
    return `${lead.name}'s website needs improvements — no mobile optimization, poor SEO, missing contact forms. Pitch: Website audit + improvement package.`;
  }
  if (lead.needType === 'hiring') {
    return `${lead.name} is actively looking for a developer/designer — approach as a freelancer with your portfolio immediately!`;
  }
  return `${lead.name} could benefit from SEO, social media, or digital marketing services.`;
}
