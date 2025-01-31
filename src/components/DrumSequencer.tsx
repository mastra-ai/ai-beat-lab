import React, { useState, useEffect, useRef } from 'react';
import { loadDrumSamples, playDrumSound, getAudioContext } from '@/lib/audio';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

const drumSounds = ['Kick', 'Snare', 'Hi-Hat', 'Clap'];
const steps = Array.from({ length: 8 }, (_, i) => i);
const STEP_DURATION_MS = 200; // 120 BPM

export const DrumSequencer = () => {
  const [activeSteps, setActiveSteps] = useState<Record<string, number[]>>({
    Kick: [],
    Snare: [],
    'Hi-Hat': [],
    Clap: [],
  });
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sequencerInterval = useRef<number | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      await loadDrumSamples();
      setIsAudioInitialized(true);
    };
    initAudio();

    return () => {
      if (sequencerInterval.current) {
        clearInterval(sequencerInterval.current);
      }
    };
  }, []);

  const toggleStep = async (sound: string, step: number) => {
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

  const playSequence = () => {
    const ctx = getAudioContext();
    ctx.resume();
    
    setIsPlaying(true);
    setCurrentStep(0);
    
    sequencerInterval.current = window.setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % steps.length;
        
        // Play all active sounds for this step
        Object.entries(activeSteps).forEach(([sound, steps]) => {
          if (steps.includes(prev)) {
            playDrumSound(sound);
          }
        });
        
        return nextStep;
      });
    }, STEP_DURATION_MS);
  };

  const stopSequence = () => {
    if (sequencerInterval.current) {
      clearInterval(sequencerInterval.current);
      sequencerInterval.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSequence();
    } else {
      playSequence();
    }
  };

  return (
    <div className="mt-8 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Drum Sequencer</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={togglePlayback}
            className="transport-button"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          {isPlaying && (
            <Button
              variant="secondary"
              size="icon"
              onClick={stopSequence}
              className="transport-button"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isAudioInitialized && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg text-black">
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
                      : step === currentStep && isPlaying
                      ? 'bg-primary/30'
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