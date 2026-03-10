import { PLATFORMS } from '../data/contentLibrary';

export function exportToCSV(calendarData) {
  const headers = ['Date', 'Day', 'Platform', 'Content Type', 'Pillar', 'Hook/Idea', 'Body Outline', 'Hashtags', 'Best Time', 'CTA', 'Voice'];
  const rows = calendarData.posts.map(post => {
    const platform = PLATFORMS.find(p => p.id === post.platform);
    return [
      post.date,
      new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
      platform?.name || post.platform,
      post.contentType.label,
      post.pillarName,
      `"${post.hook.replace(/"/g, '""')}"`,
      `"${post.body.replace(/"/g, '""')}"`,
      `"${post.hashtags.join(' ')}"`,
      post.bestTime,
      `"${post.cta.replace(/"/g, '""')}"`,
      post.voice,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `content-calendar-${calendarData.niche.toLowerCase().replace(/\s+/g, '-')}.csv`, 'text/csv');
}

export function exportToJSON(calendarData) {
  const exportData = {
    metadata: {
      niche: calendarData.niche,
      platforms: calendarData.platforms,
      goals: calendarData.goals,
      voice: calendarData.voice,
      pillars: calendarData.pillars,
      startDate: calendarData.startDate,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Skynet Labs Content Calendar Generator',
    },
    posts: calendarData.posts.map(post => {
      const platform = PLATFORMS.find(p => p.id === post.platform);
      return {
        date: post.date,
        platform: platform?.name || post.platform,
        contentType: post.contentType.label,
        pillar: post.pillarName,
        pillarCategory: post.pillarCategory,
        hook: post.hook,
        bodyOutline: post.body,
        hashtags: post.hashtags,
        bestPostingTime: post.bestTime,
        callToAction: post.cta,
        brandVoice: post.voice,
      };
    }),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `content-calendar-${calendarData.niche.toLowerCase().replace(/\s+/g, '-')}.json`, 'application/json');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
