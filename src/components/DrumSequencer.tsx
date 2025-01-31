import React, { useState, useEffect } from 'react';
import { loadDrumSamples, playDrumSound, getAudioContext } from '@/lib/audio';
import { Button } from '@/components/ui/button';

const drumSounds = ['Kick', 'Snare', 'Hi-Hat', 'Clap'];
const steps = Array.from({ length: 8 }, (_, i) => i);

export const DrumSequencer = () => {
  const [activeSteps, setActiveSteps] = useState<Record<string, number[]>>({
    Kick: [],
    Snare: [],
    'Hi-Hat': [],
    Clap: [],
  });
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      await loadDrumSamples();
      setIsAudioInitialized(true);
    };
    initAudio();
  }, []);

  const toggleStep = async (sound: string, step: number) => {
    // Initialize audio context if needed
    const ctx = getAudioContext();
    if (ctx.state !== 'running') {
      await ctx.resume();
    }

    playDrumSound(sound);
    setActiveSteps(prev => ({
      ...prev,
      [sound]: prev[sound].includes(step)
        ? prev[sound].filter(s => s !== step)
        : [...prev[sound], step],
    }));
  };

  return (
    <div className="mt-8 animate-slide-in">
      <h2 className="text-xl font-bold mb-4">Drum Sequencer</h2>
      {!isAudioInitialized && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
          <p>Click anywhere to enable audio playback</p>
        </div>
      )}
      <div className="grid grid-cols-[120px_1fr] gap-4 bg-muted p-4 rounded-lg">
        {drumSounds.map((sound) => (
          <React.Fragment key={sound}>
            <div className="font-medium">{sound}</div>
            <div className="grid grid-cols-8 gap-2">
              {steps.map((step) => (
                <div
                  key={step}
                  onClick={() => toggleStep(sound, step)}
                  className={`drum-pad cursor-pointer w-full aspect-square rounded-md transition-colors ${
                    activeSteps[sound].includes(step)
                      ? 'bg-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};