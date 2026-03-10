import { useState, useMemo } from 'react';
import { PLATFORMS, CONTENT_PILLARS, PILLAR_DISTRIBUTION } from '../data/contentLibrary';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import ContentModal from './ContentModal';
import DraggableCalendar from './DraggableCalendar';

export default function CalendarView({ calendarData, setCalendarData, onReset, onRegenerate }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar | list

  const platformMap = useMemo(() => {
    const m = {};
    PLATFORMS.forEach(p => { m[p.id] = p; });
    return m;
  }, []);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const map = {};
    calendarData.posts.forEach(post => {
      if (!map[post.date]) map[post.date] = [];
      map[post.date].push(post);
    });
    return map;
  }, [calendarData.posts]);

  // Generate 30-day date range
  const dateRange = useMemo(() => {
    const dates = [];
    const start = new Date(calendarData.startDate + 'T00:00:00');
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [calendarData.startDate]);

  // Stats
  const stats = useMemo(() => {
    const totalPosts = calendarData.posts.length;
    const platformBreakdown = {};
    const typeBreakdown = {};
    const pillarBreakdown = {};

    calendarData.posts.forEach(post => {
      platformBreakdown[post.platform] = (platformBreakdown[post.platform] || 0) + 1;
      typeBreakdown[post.contentType.label] = (typeBreakdown[post.contentType.label] || 0) + 1;
      pillarBreakdown[post.pillarCategory] = (pillarBreakdown[post.pillarCategory] || 0) + 1;
    });

    return { totalPosts, platformBreakdown, typeBreakdown, pillarBreakdown };
  }, [calendarData.posts]);

  const handlePostMove = (activeId, overDate) => {
    setCalendarData(prev => {
      const newPosts = prev.posts.map(post => {
        if (post.id === activeId) {
          const newDateObj = new Date(overDate + 'T00:00:00');
          const startObj = new Date(prev.startDate + 'T00:00:00');
          const dayDiff = Math.round((newDateObj - startObj) / (1000 * 60 * 60 * 24));
          return {
            ...post,
            date: overDate,
            day: dayDiff,
            dateObj: newDateObj,
          };
        }
        return post;
      });
      return { ...prev, posts: newPosts };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Bar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Your 30-Day Content Calendar
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {calendarData.niche} &middot; {calendarData.platforms.map(p => platformMap[p]?.name).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-dark-600 text-gray-300 hover:text-white border border-dark-400 hover:border-gray-500 transition-all"
          >
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-dark-600 text-gray-300 hover:text-white border border-dark-400 hover:border-gray-500 transition-all"
          >
            Print
          </button>
          <button
            onClick={() => exportToCSV(calendarData)}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-dark-600 text-gray-300 hover:text-white border border-dark-400 hover:border-gray-500 transition-all"
          >
            CSV
          </button>
          <button
            onClick={() => exportToJSON(calendarData)}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-dark-600 text-gray-300 hover:text-white border border-dark-400 hover:border-gray-500 transition-all"
          >
            JSON
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-all"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-dark-700 border border-dark-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.totalPosts}</div>
          <div className="text-xs text-gray-400 mt-1">Total Posts</div>
        </div>
        <div className="bg-dark-700 border border-dark-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{calendarData.platforms.length}</div>
          <div className="text-xs text-gray-400 mt-1">Platforms</div>
        </div>
        <div className="bg-dark-700 border border-dark-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{calendarData.pillars.length}</div>
          <div className="text-xs text-gray-400 mt-1">Content Pillars</div>
        </div>
        <div className="bg-dark-700 border border-dark-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">30</div>
          <div className="text-xs text-gray-400 mt-1">Days Planned</div>
        </div>
      </div>

      {/* Content Pillars */}
      <div className="no-print bg-dark-700 border border-dark-500 rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Content Pillars</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {calendarData.pillars.map((pillar, i) => {
            const categories = ['education', 'entertainment', 'engagement', 'promotion', 'personal'];
            const dist = Object.values(PILLAR_DISTRIBUTION)[i] || 0.2;
            const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
            return (
              <div key={pillar} className="bg-dark-600 rounded-lg p-3 border border-dark-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                  <span className="text-xs font-medium text-white truncate">{pillar}</span>
                </div>
                <div className="text-[10px] text-gray-500 capitalize">{categories[i]} &middot; {Math.round(dist * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Legend */}
      <div className="no-print flex flex-wrap gap-3 mb-4">
        {calendarData.platforms.map(platformId => {
          const platform = platformMap[platformId];
          if (!platform) return null;
          return (
            <div key={platformId} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: platform.color }} />
              <span className="text-xs text-gray-400">{platform.name}</span>
              <span className="text-xs text-gray-600">({stats.platformBreakdown[platformId] || 0})</span>
            </div>
          );
        })}
      </div>

      {/* Calendar / List */}
      {viewMode === 'calendar' ? (
        <DraggableCalendar
          dateRange={dateRange}
          postsByDate={postsByDate}
          platformMap={platformMap}
          onPostClick={setSelectedPost}
          onPostMove={handlePostMove}
        />
      ) : (
        <ListView
          dateRange={dateRange}
          postsByDate={postsByDate}
          platformMap={platformMap}
          onPostClick={setSelectedPost}
        />
      )}

      {/* Content Modal */}
      {selectedPost && (
        <ContentModal
          post={selectedPost}
          platform={platformMap[selectedPost.platform]}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

function ListView({ dateRange, postsByDate, platformMap, onPostClick }) {
  return (
    <div className="space-y-2">
      {dateRange.map(date => {
        const posts = postsByDate[date] || [];
        if (posts.length === 0) return null;
        const d = new Date(date + 'T00:00:00');
        return (
          <div key={date} className="bg-dark-700 border border-dark-500 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-dark-600 border-b border-dark-500">
              <span className="text-sm font-semibold text-white">
                {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-gray-500 ml-2">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-dark-500">
              {posts.map(post => {
                const platform = platformMap[post.platform];
                return (
                  <button
                    key={post.id}
                    onClick={() => onPostClick(post)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-dark-600 transition-colors text-left"
                  >
                    <span
                      className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: (platform?.color || '#666') + '25', color: platform?.color || '#666' }}
                    >
                      {platform?.icon || '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{post.hook}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {post.contentType.emoji} {post.contentType.label} &middot; {post.bestTime} &middot; {post.pillarName}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
