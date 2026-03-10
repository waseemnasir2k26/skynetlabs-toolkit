import { useEffect } from 'react';

export default function ContentModal({ post, platform, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const d = new Date(post.date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const pillarColors = {
    education: '#3b82f6',
    entertainment: '#8b5cf6',
    engagement: '#f59e0b',
    promotion: '#ef4444',
    personal: '#10b981',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeInBackdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-700 border border-dark-500 rounded-xl shadow-2xl animate-modalIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-700 border-b border-dark-500 px-5 py-4 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: (platform?.color || '#666') + '25', color: platform?.color || '#666' }}
            >
              {platform?.icon || '?'}
            </span>
            <div>
              <div className="text-sm font-semibold text-white">{platform?.name || 'Unknown'}</div>
              <div className="text-xs text-gray-400">{dateStr}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* Content Type & Pillar */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-dark-600 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-md border border-dark-400">
              {post.contentType.emoji} {post.contentType.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border"
              style={{
                backgroundColor: (pillarColors[post.pillarCategory] || '#666') + '15',
                borderColor: (pillarColors[post.pillarCategory] || '#666') + '40',
                color: pillarColors[post.pillarCategory] || '#666',
              }}
            >
              {post.pillarName}
            </span>
            <span className="inline-flex items-center gap-1 bg-dark-600 text-gray-400 text-xs px-2.5 py-1 rounded-md border border-dark-400 capitalize">
              {post.voice}
            </span>
          </div>

          {/* Hook */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
              Hook / Headline
            </label>
            <p className="text-white text-sm font-medium leading-relaxed bg-dark-600 rounded-lg p-3 border border-dark-400">
              {post.hook}
            </p>
          </div>

          {/* Body Outline */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
              Body Outline
            </label>
            <p className="text-gray-300 text-sm leading-relaxed bg-dark-600 rounded-lg p-3 border border-dark-400">
              {post.body}
            </p>
          </div>

          {/* Best Time & CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                Best Posting Time
              </label>
              <div className="bg-dark-600 rounded-lg p-3 border border-dark-400 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-sm font-medium">{post.bestTime}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                Call to Action
              </label>
              <div className="bg-dark-600 rounded-lg p-3 border border-dark-400">
                <span className="text-primary text-sm font-medium">{post.cta}</span>
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
              Suggested Hashtags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-dark-600 text-primary/80 text-xs px-2 py-1 rounded border border-dark-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-dark-500 bg-dark-800/50 rounded-b-xl">
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-2.5 rounded-lg border border-primary/20 transition-all"
          >
            Need help creating this content? Let's talk
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeInBackdrop { animation: fadeInBackdrop 0.2s ease-out; }
        .animate-modalIn { animation: modalIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
