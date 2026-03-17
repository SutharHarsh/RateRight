import jsPDF from 'jspdf';

export interface RateCardTemplateData {
  creatorName: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  niche: string;
  followers: number;
  engagementRate: number;
  avgViews?: number;
  avgWatchTime?: string;
  avgReach?: number;
  avgStoryViews?: number;
  primaryAgeRange?: string;
  genderSplit?: { male: number; female: number };
  topLocations?: string[];
  usageRights30Day?: number;
  usageRights90Day?: number;
  exclusivity30Day?: number;
  exclusivity90Day?: number;
  profilePhoto?: string;
  websiteUrl?: string;
  contactEmail?: string;
  terms?: string;
  priceBreakdown?: {
    lines: Array<{
      label: string;
      amount: number;
      details?: string[];
    }>;
    finalRate: number;
    steps: string[];
  };
  rates: {
    singlePost: number;
    storyText: string;
    reelRate?: number;
    videoRate?: number;
    integrationRate?: number;
  };
}

export type TemplateType = 'classic' | 'creative' | 'premium';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return `${num}`;
}

function parseMoneyLike(value: string): number {
  const parsed = Number(value.replace(/[^0-9]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCents(amountInCents: number): string {
  const sign = amountInCents < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(amountInCents / 100)).toLocaleString()}`;
}

function drawAllDataPage(doc: jsPDF, data: RateCardTemplateData, template: TemplateType) {
  doc.addPage();

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Complete Rate Card Data', 15, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Template: ${template.toUpperCase()} | Platform: ${data.platform}`, 15, 27);

  let y = 36;
  const addDataPage = (continued = false) => {
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(continued ? 'Complete Rate Card Data (Cont.)' : 'Complete Rate Card Data', 15, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Template: ${template.toUpperCase()} | Platform: ${data.platform}`, 15, 27);
    y = 36;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > 280) {
      addDataPage(true);
    }
  };

  const line = (label: string, value: string) => {
    const wrapped = doc.splitTextToSize(value || '-', 130);
    const blockHeight = Math.max(6, wrapped.length * 5);
    ensureSpace(blockHeight + 2);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${label}:`, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(wrapped, 70, y);
    y += blockHeight;
  };

  line('Creator Name', data.creatorName);
  line('Handle', data.handle);
  line('Niche', data.niche);
  line('Followers/Subscribers', data.followers.toLocaleString());
  line('Engagement Rate', `${data.engagementRate}%`);
  line('Average Reach', data.avgReach ? data.avgReach.toLocaleString() : 'N/A');
  line('Average Story Views', data.avgStoryViews ? data.avgStoryViews.toLocaleString() : 'N/A');
  line('Average Views per Video', data.avgViews ? data.avgViews.toLocaleString() : 'N/A');
  line('Average Watch Time', data.avgWatchTime || 'N/A');
  line('Primary Age Range', data.primaryAgeRange || 'N/A');
  line(
    'Gender Split',
    data.genderSplit ? `${data.genderSplit.female}% Female, ${data.genderSplit.male}% Male` : 'N/A'
  );
  line('Top Locations', data.topLocations && data.topLocations.length > 0 ? data.topLocations.join(', ') : 'N/A');
  line('Single Post Rate', `$${data.rates.singlePost.toLocaleString()}`);
  line('Story Series Rate', data.rates.storyText || 'N/A');
  line('Reel Rate', `$${(data.rates.reelRate || 0).toLocaleString()}`);
  line('Dedicated Video Rate', `$${(data.rates.videoRate || 0).toLocaleString()}`);
  line('Integration Rate', `$${(data.rates.integrationRate || 0).toLocaleString()}`);
  line('Usage Rights (30 days)', `$${(data.usageRights30Day || 0).toLocaleString()}`);
  line('Usage Rights (90 days)', `$${(data.usageRights90Day || 0).toLocaleString()}`);
  line('Exclusivity (30 days)', `$${(data.exclusivity30Day || 0).toLocaleString()}`);
  line('Exclusivity (90 days)', `$${(data.exclusivity90Day || 0).toLocaleString()}`);
  line('Contact Email', data.contactEmail || 'N/A');
  line('Website', data.websiteUrl || 'N/A');
  line('Profile Photo URL', data.profilePhoto || 'N/A');
  line('Terms', data.terms || 'N/A');

  if (data.priceBreakdown) {
    ensureSpace(14);
    y += 4;
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Advanced Price Breakdown', 15, y);
    y += 7;

    data.priceBreakdown.lines.forEach((item) => {
      const details = item.details && item.details.length > 0 ? item.details.join(' | ') : '-';
      const wrappedDetails = doc.splitTextToSize(details, 170);
      const blockHeight = 12 + wrappedDetails.length * 4;
      ensureSpace(blockHeight + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(item.label, 15, y);
      doc.text(formatCents(item.amount), 195, y, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(wrappedDetails, 15, y + 5);

      y += blockHeight;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y - 2, 195, y - 2);
      y += 3;
    });

    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`Final Rate: ${formatCents(data.priceBreakdown.finalRate)}`, 15, y);
    y += 8;

    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Calculation Steps', 15, y);
    y += 6;

    data.priceBreakdown.steps.forEach((step) => {
      const wrappedStep = doc.splitTextToSize(step, 175);
      const stepHeight = Math.max(5, wrappedStep.length * 4);
      ensureSpace(stepHeight + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(wrappedStep, 20, y);
      y += stepHeight;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Generated by RateRight', 105, 290, { align: 'center' });
}

function drawInstagramClassic(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setDrawColor(210, 210, 210);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text('RATE CARD', 20, 20);

  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(data.creatorName, 20, 40);

  doc.setFontSize(12);
  doc.setTextColor(115, 115, 115);
  doc.text(data.handle, 20, 48);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`INSTAGRAM | ${data.niche.toUpperCase()}`, 20, 56);

  const statsY = 70;
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  doc.text('Followers', 20, statsY);
  doc.text('Engagement Rate', 75, statsY);
  doc.text('Avg Reach', 130, statsY);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(data.followers.toLocaleString(), 20, statsY + 8);
  doc.text(`${data.engagementRate}%`, 75, statsY + 8);
  doc.text((data.avgReach || 0).toLocaleString() || 'N/A', 130, statsY + 8);

  doc.setDrawColor(220, 220, 220);
  doc.line(20, 90, 190, 90);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Standard Rates', 20, 105);

  const rows = [
    ['Feed Post (Single)', `$${data.rates.singlePost.toLocaleString()}`],
    ['Story Series (3 frames)', data.rates.storyText],
    ['Reel (15-90 seconds)', `$${(data.rates.reelRate || 0).toLocaleString()}`],
    ['Feed Post + Story Package', `$${Math.round(data.rates.singlePost * 1.4).toLocaleString()}`],
  ];

  let y = 125;
  for (const [label, value] of rows) {
    doc.setFontSize(11);
    doc.setTextColor(35, 35, 35);
    doc.text(label, 20, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, 160, y);
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(238, 238, 238);
    doc.line(20, y + 4, 190, y + 4);
    y += 12;
  }

  doc.setFontSize(9);
  doc.setTextColor(85, 85, 85);
  doc.text('Standard Terms', 20, 180);

  const terms = [
    'Usage Rights: 30-day organic posting included',
    'Payment: Net-30 from content delivery',
    'Revisions: Up to 2 rounds included',
    'Timeline: 7-10 business days',
  ];

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  terms.forEach((term, index) => {
    doc.text(`- ${term}`, 20, 190 + index * 5);
  });

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by RateRight', 105, 285, { align: 'center' });
  doc.text(new Date().toLocaleDateString(), 105, 290, { align: 'center' });
}

function drawInstagramCreative(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(131, 58, 180);
  doc.rect(0, 0, 210, 80, 'F');
  doc.setFillColor(193, 53, 132);
  doc.rect(0, 40, 210, 40, 'F');
  doc.setFillColor(225, 48, 108);
  doc.rect(0, 60, 210, 20, 'F');

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 80, 210, 217, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(data.creatorName, 20, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(data.handle, 20, 45);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 52, 64, 12, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(131, 58, 180);
  doc.text('INSTAGRAM', 26, 60);

  const statsY = 95;
  const cardWidth = 50;
  const cardHeight = 35;

  doc.setFillColor(253, 242, 248);
  doc.roundedRect(20, statsY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(131, 58, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('FOLLOWERS', 25, statsY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(formatNumber(data.followers), 25, statsY + 25);

  doc.setFillColor(243, 238, 255);
  doc.roundedRect(75, statsY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('ENGAGEMENT', 80, statsY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${data.engagementRate}%`, 80, statsY + 25);

  doc.setFillColor(254, 249, 231);
  doc.roundedRect(130, statsY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('NICHE', 135, statsY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.niche, 135, statsY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Pricing', 20, 150);

  const prices = [
    { name: 'Feed Post', price: data.rates.singlePost, color: [225, 48, 108] as [number, number, number] },
    { name: 'Story Series', price: parseMoneyLike(data.rates.storyText), color: [131, 58, 180] as [number, number, number] },
    { name: 'Reel', price: data.rates.reelRate || 0, color: [99, 102, 241] as [number, number, number] },
  ];

  let y = 165;
  prices.forEach((item) => {
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.circle(25, y - 3, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(item.name, 33, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(`$${item.price.toLocaleString()}`, 160, y);
    y += 20;
  });

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(20, 230, 170, 25, 3, 3, 'F');
  doc.setTextColor(120, 53, 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Why work with me?', 25, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`High ${data.engagementRate}% engagement means strong brand results.`, 25, 248);

  doc.setFillColor(225, 48, 108);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Created with RateRight', 105, 283, { align: 'center' });
}

function drawInstagramPremium(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(250, 248, 246);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setTextColor(40, 40, 40);
  doc.setFont('times', 'bold');
  doc.setFontSize(32);
  doc.text(data.creatorName, 105, 30, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.line(70, 35, 140, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(data.handle, 105, 43, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 55, 150, 40, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(30, 55, 150, 40, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('FOLLOWERS', 45, 68);
  doc.text('ENGAGEMENT', 95, 68);
  doc.text('AUDIENCE REACH', 140, 68);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(formatNumber(data.followers), 45, 82);
  doc.text(`${data.engagementRate}%`, 95, 82);
  doc.text(formatNumber(data.avgReach || 0), 140, 82);

  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(212, 175, 55);
  doc.text(data.niche, 105, 115, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('Investment Opportunities', 105, 135, { align: 'center' });
  doc.setDrawColor(212, 175, 55);
  doc.line(60, 140, 150, 140);

  const rows = [
    { title: 'Signature Post', subtitle: 'Single feed post with story promotion', price: data.rates.singlePost },
    { title: 'Story Experience', subtitle: 'Immersive 3-frame story series', price: parseMoneyLike(data.rates.storyText) },
    { title: 'Premium Reel', subtitle: 'Engaging short-form video content', price: data.rates.reelRate || 0 },
    { title: 'Brand Partnership', subtitle: 'Comprehensive multi-format campaign', price: Math.round(data.rates.singlePost * 2.5) },
  ];

  let y = 155;
  rows.forEach((row) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(35, y, 140, 25, 2, 2, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.roundedRect(35, y, 140, 25, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(row.title, 40, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(row.subtitle, 40, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text(`$${row.price.toLocaleString()}`, 165, y + 14, { align: 'right' });
    y += 30;
  });

  doc.setDrawColor(212, 175, 55);
  doc.line(30, 280, 180, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Crafted with RateRight', 105, 287, { align: 'center' });
  doc.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), 105, 292, {
    align: 'center',
  });
}

function drawYouTubeClassic(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(255, 0, 0);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(data.creatorName, 20, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${data.handle} • YouTube Creator`, 20, 33);

  const stats = [
    { label: 'Subscribers', value: formatNumber(data.followers) },
    { label: 'Avg Views/Video', value: formatNumber(data.avgViews || 0) },
    { label: 'Total Views', value: '10M+' },
    { label: 'Engagement Rate', value: `${data.engagementRate}%` },
  ];

  stats.forEach((stat, i) => {
    const x = 20 + i * 45;
    doc.setFillColor(245, 245, 245);
    doc.rect(x, 55, 42, 25, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(stat.label, x + 3, 63);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(stat.value, x + 3, 74);
    doc.setFont('helvetica', 'normal');
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Sponsorship Packages', 20, 95);

  const packages = [
    { title: 'Dedicated Video', desc: 'Full 10-15 min product feature', price: data.rates.videoRate || 8000 },
    { title: 'Integrated Sponsorship', desc: '60-90 sec pre/mid/post-roll', price: data.rates.integrationRate || 4000 },
    { title: 'YouTube Shorts Series', desc: '5 short-form videos', price: Math.round((data.rates.videoRate || 8000) * 0.9) },
    { title: 'Monthly Partnership', desc: '4 integrations per month', price: Math.round((data.rates.integrationRate || 4000) * 4 * 0.85) },
  ];

  let y = 105;
  packages.forEach((p, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y, 170, 28, 'F');
    }
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, y, 170, 28, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(p.title, 25, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(p.desc, 25, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.text(`$${p.price.toLocaleString()}`, 185, y + 16, { align: 'right' });

    y += 32;
  });

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 260, 210, 37, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Standard Terms', 20, 270);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Payment: 50% upfront, 50% on publication • Timeline: 14-21 days • Usage: 60-day organic rights', 20, 277);
  doc.text('FTC disclosure included • Analytics report at 30 days', 20, 283);
  doc.setTextColor(120, 120, 120);
  doc.text('Generated by RateRight', 105, 292, { align: 'center' });
}

function drawYouTubeCreative(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(255, 0, 0);
  doc.rect(0, 0, 210, 100, 'F');
  doc.setFillColor(255, 50, 50);
  doc.rect(0, 60, 210, 40, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 100, 210, 197, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text(data.creatorName, 20, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text(`Creating ${data.niche} content viewers love`, 20, 48);
  doc.setFontSize(11);
  doc.text(data.handle, 20, 58);

  const stats = [
    { label: 'Subscribers', value: formatNumber(data.followers), x: 32 },
    { label: 'Avg Views', value: formatNumber(data.avgViews || 0), x: 98 },
    { label: 'Engagement', value: `${data.engagementRate}%`, x: 164 },
  ];

  stats.forEach((s) => {
    doc.setFillColor(255, 255, 255);
    doc.circle(s.x, 75, 15, 'F');
    doc.setDrawColor(255, 0, 0);
    doc.circle(s.x, 75, 15, 'S');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(s.label, s.x, 73, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(s.value, s.x, 80, { align: 'center' });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("Let's Create Together", 20, 120);

  const cards = [
    { title: 'Dedicated Video', sub: 'Brand story with creator voice', price: data.rates.videoRate || 8000, color: [255, 0, 0] as [number, number, number] },
    { title: 'Quick Integration', sub: 'Fast 60-90 sec sponsor section', price: data.rates.integrationRate || 4000, color: [255, 100, 100] as [number, number, number] },
    { title: 'Shorts Takeover', sub: '5 Shorts campaign burst', price: Math.round((data.rates.videoRate || 8000) * 0.9), color: [255, 150, 150] as [number, number, number] },
  ];

  let y = 135;
  cards.forEach((card) => {
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(20, y, 170, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(card.title, 30, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(card.sub, 30, y + 21);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`$${card.price.toLocaleString()}`, 185, y + 18, { align: 'right' });
    y += 35;
  });

  doc.setFillColor(255, 0, 0);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Lets make something amazing together', 105, 283, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Created with RateRight', 105, 290, { align: 'center' });
}

function drawYouTubePremium(doc: jsPDF, data: RateCardTemplateData) {
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setFillColor(255, 0, 0);
  doc.rect(0, 50, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(data.creatorName, 20, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('YouTube Creator & Content Strategist', 20, 33);
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`${data.handle} • ${data.niche}`, 20, 42);

  doc.setFillColor(250, 250, 250);
  doc.rect(0, 52, 210, 50, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Channel Performance Metrics', 20, 65);

  const metrics = [
    { label: 'Subscribers', value: formatNumber(data.followers) },
    { label: 'Avg Views', value: formatNumber(data.avgViews || 0) },
    { label: 'Engagement', value: `${data.engagementRate}%` },
    { label: 'Total Views', value: '25M+' },
  ];

  let x = 20;
  metrics.forEach((m) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(m.label, x, 75);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.text(m.value, x, 87);
    x += 47;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Partnership Investment Tiers', 20, 115);

  const tiers = [
    {
      tier: 'TIER 1',
      name: 'Dedicated Content',
      features: ['10-15 minute full brand video', 'Deep product walkthrough', 'Pinned comment + description link'],
      investment: data.rates.videoRate || 8000,
    },
    {
      tier: 'TIER 2',
      name: 'Integrated Sponsorship',
      features: ['60-90 second sponsor segment', 'Natural in-video placement', 'Description link included'],
      investment: data.rates.integrationRate || 4000,
    },
    {
      tier: 'TIER 3',
      name: 'Campaign Package',
      features: ['1 dedicated + 2 integrations', '5 Shorts companion content', '30-day analytics report'],
      investment: Math.round(((data.rates.videoRate || 8000) + (data.rates.integrationRate || 4000) * 2) * 0.9),
    },
  ];

  let y = 125;
  tiers.forEach((t) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, y, 170, 45, 2, 2, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(20, y, 170, 45, 2, 2, 'S');

    doc.setFillColor(255, 0, 0);
    doc.rect(20, y, 35, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(t.tier, 37.5, y + 5.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text(t.name, 25, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    t.features.forEach((feature, idx) => {
      doc.text(`- ${feature}`, 25, y + 26 + idx * 4);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 0, 0);
    doc.text(`$${t.investment.toLocaleString()}`, 185, y + 25, { align: 'right' });
    y += 50;
  });

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Professional media kit generated by RateRight', 105, 292, { align: 'center' });
}

export function generateRateCardTemplate(data: RateCardTemplateData, template: TemplateType): void {
  const doc = new jsPDF();

  if (data.platform === 'Instagram') {
    if (template === 'classic') {
      drawInstagramClassic(doc, data);
    } else if (template === 'creative') {
      drawInstagramCreative(doc, data);
    } else {
      drawInstagramPremium(doc, data);
    }
  } else if (data.platform === 'YouTube') {
    if (template === 'classic') {
      drawYouTubeClassic(doc, data);
    } else if (template === 'creative') {
      drawYouTubeCreative(doc, data);
    } else {
      drawYouTubePremium(doc, data);
    }
  } else {
    drawInstagramClassic(doc, {
      ...data,
      platform: 'Instagram',
    });
  }

  drawAllDataPage(doc, data, template);

  const fileName = `${data.creatorName.replace(/\s/g, '_')}_${data.platform}_${template}_RateCard.pdf`;
  doc.save(fileName);
}
