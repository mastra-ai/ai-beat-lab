import React, { useState } from 'react';

const drumSounds = ['Kick', 'Snare', 'Hi-Hat', 'Clap'];
const steps = Array.from({ length: 8 }, (_, i) => i);

export const DrumSequencer = () => {
  const [activeSteps, setActiveSteps] = useState<Record<string, number[]>>({
    Kick: [],
    Snare: [],
    'Hi-Hat': [],
    Clap: [],
  });

  const toggleStep = (sound: string, step: number) => {
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
      <div className="grid grid-cols-[120px_1fr] gap-4 bg-muted p-4 rounded-lg">
        {drumSounds.map((sound) => (
          <React.Fragment key={sound}>
            <div className="font-medium">{sound}</div>
            <div className="grid grid-cols-8 gap-2">
              {steps.map((step) => (
                <div
                  key={step}
                  onClick={() => toggleStep(sound, step)}
                  className={`drum-pad ${
                    activeSteps[sound].includes(step) ? 'active' : ''
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