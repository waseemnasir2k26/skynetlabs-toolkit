import { useState } from 'react';
import { NICHES, PLATFORMS, GOALS, FREQUENCIES, VOICES } from '../data/contentLibrary';

const STEPS = ['Niche', 'Platforms', 'Goals', 'Frequency', 'Voice'];

export default function SetupWizard({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    niche: '',
    platforms: [],
    goals: [],
    frequencies: {},
    voice: '',
  });

  const canProceed = () => {
    switch (step) {
      case 0: return config.niche !== '';
      case 1: return config.platforms.length > 0;
      case 2: return config.goals.length > 0;
      case 3: return config.platforms.every(p => config.frequencies[p]);
      case 4: return config.voice !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      onGenerate(config);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(0, s - 1));
  };

  const togglePlatform = (id) => {
    setConfig(prev => {
      const platforms = prev.platforms.includes(id)
        ? prev.platforms.filter(p => p !== id)
        : [...prev.platforms, id];
      const frequencies = { ...prev.frequencies };
      if (!platforms.includes(id)) delete frequencies[id];
      else if (!frequencies[id]) frequencies[id] = 'daily';
      return { ...prev, platforms, frequencies };
    });
  };

  const toggleGoal = (goal) => {
    setConfig(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Free Tool
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          30-Day Content Calendar Generator
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Create a complete social media content plan tailored to your business
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`h-1 w-full rounded-full transition-colors duration-300 ${
              i <= step ? 'bg-primary' : 'bg-dark-500'
            }`} />
            <span className={`text-[10px] font-medium transition-colors ${
              i <= step ? 'text-primary' : 'text-gray-600'
            }`}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6 sm:p-8 min-h-[320px]">
        {step === 0 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-1">What's your business niche?</h3>
            <p className="text-gray-400 text-sm mb-6">This helps us generate relevant content ideas</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NICHES.map(niche => (
                <button
                  key={niche}
                  onClick={() => setConfig(prev => ({ ...prev, niche }))}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    config.niche === niche
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-dark-600 border-dark-400 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-1">Select your platforms</h3>
            <p className="text-gray-400 text-sm mb-6">Choose all platforms you want to post on</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`px-4 py-4 rounded-xl text-sm font-medium transition-all border flex flex-col items-center gap-2 ${
                    config.platforms.includes(platform.id)
                      ? 'border-primary bg-primary/10'
                      : 'bg-dark-600 border-dark-400 hover:border-gray-500'
                  }`}
                >
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: platform.color + '30', color: platform.color }}
                  >
                    {platform.icon}
                  </span>
                  <span className={config.platforms.includes(platform.id) ? 'text-white' : 'text-gray-300'}>
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-1">What are your content goals?</h3>
            <p className="text-gray-400 text-sm mb-6">Select one or more goals</p>
            <div className="space-y-2">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all border text-left flex items-center gap-3 ${
                    config.goals.includes(goal)
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-dark-600 border-dark-400 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                    config.goals.includes(goal) ? 'bg-primary border-primary' : 'border-gray-600'
                  }`}>
                    {config.goals.includes(goal) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-1">Posting frequency per platform</h3>
            <p className="text-gray-400 text-sm mb-6">How often do you want to post on each platform?</p>
            <div className="space-y-4">
              {config.platforms.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                return (
                  <div key={platformId} className="bg-dark-600 rounded-lg p-4 border border-dark-400">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: platform.color + '30', color: platform.color }}
                      >
                        {platform.icon}
                      </span>
                      <span className="text-white font-medium text-sm">{platform.name}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FREQUENCIES.map(freq => (
                        <button
                          key={freq.id}
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            frequencies: { ...prev.frequencies, [platformId]: freq.id }
                          }))}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-all border ${
                            config.frequencies[platformId] === freq.id
                              ? 'bg-primary/15 border-primary text-primary'
                              : 'bg-dark-700 border-dark-400 text-gray-400 hover:text-white hover:border-gray-500'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-1">Choose your brand voice</h3>
            <p className="text-gray-400 text-sm mb-6">What tone resonates with your audience?</p>
            <div className="space-y-2">
              {VOICES.map(voice => {
                const descriptions = {
                  Professional: 'Polished, authoritative, and trustworthy',
                  Casual: 'Relaxed, friendly, and conversational',
                  Bold: 'Confident, provocative, and attention-grabbing',
                  Educational: 'Informative, clear, and value-packed',
                  Fun: 'Playful, energetic, and entertaining',
                };
                return (
                  <button
                    key={voice}
                    onClick={() => setConfig(prev => ({ ...prev, voice }))}
                    className={`w-full px-4 py-3 rounded-lg text-sm transition-all border text-left ${
                      config.voice === voice
                        ? 'bg-primary/15 border-primary'
                        : 'bg-dark-600 border-dark-400 hover:border-gray-500'
                    }`}
                  >
                    <span className={`font-medium ${config.voice === voice ? 'text-primary' : 'text-gray-300'}`}>{voice}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{descriptions[voice]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            step === 0
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-dark-600'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            canProceed()
              ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20'
              : 'bg-dark-500 text-gray-500 cursor-not-allowed'
          }`}
        >
          {step === STEPS.length - 1 ? (
            <>
              Generate Calendar
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          ) : (
            <>
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
