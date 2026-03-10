import { useEffect, useState } from 'react';

export default function SuccessScreen({ clientName }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const colors = ['#13b973', '#17d683', '#0f9a5f', '#3b82f6', '#8b5cf6', '#f59e0b'];
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2 + 2,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 bg-dark-bg/95 flex items-center justify-center z-50 overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
            top: '-20px',
          }}
        />
      ))}

      <div className="text-center animate-scale-up relative z-10">
        {/* Checkmark */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-glow">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-dark-text mb-3">Onboarding Complete!</h2>
        <p className="text-dark-muted text-lg mb-2">
          Thank you{clientName ? `, ${clientName}` : ''}!
        </p>
        <p className="text-dark-muted text-sm max-w-md mx-auto mb-8">
          Your onboarding information has been submitted successfully.
          We will review everything and get back to you shortly.
        </p>

        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-dark-text tracking-wider">SKYNET LABS</p>
            <p className="text-[10px] text-dark-muted tracking-widest uppercase">AI Automation Agency</p>
          </div>
        </div>

        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 text-sm text-primary hover:text-primary-light transition-colors no-underline"
        >
          Visit skynetjoe.com
        </a>
      </div>
    </div>
  );
}
