import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { playNoteByName, playDrumSound } from '@/lib/audio';

const STEPS = 16;
const PIANO_NOTES = ['C4', 'B3', 'A3', 'G3'];
const DRUM_SOUNDS = ['Kick', 'Snare', 'Hi-Hat'];

export const Sequencer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [pianoSequence, setPianoSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(PIANO_NOTES.map(note => [note, []]))
  );
  const [drumSequence, setDrumSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(DRUM_SOUNDS.map(sound => [sound, []]))
  );
  const sequencerInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (sequencerInterval.current) {
        clearInterval(sequencerInterval.current);
      }
    };
  }, []);

  const togglePianoStep = (note: string, step: number) => {
    setPianoSequence(prev => ({
      ...prev,
      [note]: prev[note].includes(step)
        ? prev[note].filter(s => s !== step)
        : [...prev[note], step],
    }));
    playNoteByName(note);
  };

  const toggleDrumStep = (sound: string, step: number) => {
    setDrumSequence(prev => ({
      ...prev,
      [sound]: prev[sound].includes(step)
        ? prev[sound].filter(s => s !== step)
        : [...prev[sound], step],
    }));
    playDrumSound(sound);
  };

  const generateRandomSequence = () => {
    // Mock different patterns based on keywords in the prompt
    const isUpbeat = prompt.toLowerCase().includes('upbeat');
    const isJazz = prompt.toLowerCase().includes('jazz');
    const hasHeavyKicks = prompt.toLowerCase().includes('heavy') && prompt.toLowerCase().includes('kick');

    // Generate new sequences
    const newPianoSequence: Record<string, number[]> = {};
    const newDrumSequence: Record<string, number[]> = {};

    // Generate piano sequence
    PIANO_NOTES.forEach(note => {
      const steps: number[] = [];
      const numberOfSteps = isJazz ? 4 : (isUpbeat ? 6 : 3); // Jazz uses fewer, more strategic notes
      
      while (steps.length < numberOfSteps) {
        const step = Math.floor(Math.random() * STEPS);
        if (!steps.includes(step)) {
          steps.push(step);
        }
      }
      newPianoSequence[note] = steps.sort((a, b) => a - b);
    });

    // Generate drum sequence
    DRUM_SOUNDS.forEach(sound => {
      const steps: number[] = [];
      let numberOfSteps;
      
      if (sound === 'Kick') {
        numberOfSteps = hasHeavyKicks ? 8 : 4;
      } else if (sound === 'Hi-Hat') {
        numberOfSteps = isUpbeat ? 12 : 8;
      } else { // Snare
        numberOfSteps = isJazz ? 6 : 4;
      }

      while (steps.length < numberOfSteps) {
        const step = Math.floor(Math.random() * STEPS);
        if (!steps.includes(step)) {
          steps.push(step);
        }
      }
      newDrumSequence[sound] = steps.sort((a, b) => a - b);
    });

    return { newPianoSequence, newDrumSequence };
  };

  const handleGenerateSequence = () => {
    if (!prompt) return;
    
    // Simulate API call delay
    const { newPianoSequence, newDrumSequence } = generateRandomSequence();
    
    // Update sequences
    setPianoSequence(newPianoSequence);
    setDrumSequence(newDrumSequence);
  };

  const playSequence = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    sequencerInterval.current = window.setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % STEPS;
        
        // Play piano notes for current step
        Object.entries(pianoSequence).forEach(([note, steps]) => {
          if (steps.includes(prev)) {
            playNoteByName(note);
          }
        });
        
        // Play drum sounds for current step
        Object.entries(drumSequence).forEach(([sound, steps]) => {
          if (steps.includes(prev)) {
            playDrumSound(sound);
          }
        });
        
        return nextStep;
      });
    }, 200); // 120 BPM
  };

  const stopSequence = () => {
    if (sequencerInterval.current) {
      clearInterval(sequencerInterval.current);
      sequencerInterval.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="bg-muted rounded-lg p-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Sequence Editor</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => isPlaying ? stopSequence() : playSequence()}
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

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Describe the beat you want (e.g. 'upbeat jazz rhythm with heavy kicks')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleGenerateSequence}>
          Generate
        </Button>
      </div>

      <div className="space-y-6">
        {/* Step numbers */}
        <div className="grid grid-cols-[120px_repeat(16,1fr)] gap-1">
          <div className="text-sm font-medium">Steps</div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-400">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Piano sequence */}
        <div className="space-y-1">
          <div className="text-sm font-medium mb-2">Piano Notes</div>
          {PIANO_NOTES.map(note => (
            <div key={note} className="grid grid-cols-[120px_repeat(16,1fr)] gap-1">
              <div className="text-sm">{note}</div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => togglePianoStep(note, step)}
                  className={`
                    h-8 rounded cursor-pointer transition-colors
                    ${pianoSequence[note].includes(step)
                      ? 'bg-primary'
                      : step === currentStep && isPlaying
                      ? 'bg-primary/30'
                      : 'bg-secondary hover:bg-secondary/80'}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Drum sequence */}
        <div className="space-y-1">
          <div className="text-sm font-medium mb-2">Drum Sounds</div>
          {DRUM_SOUNDS.map(sound => (
            <div key={sound} className="grid grid-cols-[120px_repeat(16,1fr)] gap-1">
              <div className="text-sm">{sound}</div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => toggleDrumStep(sound, step)}
                  className={`
                    h-8 rounded cursor-pointer transition-colors
                    ${drumSequence[sound].includes(step)
                      ? 'bg-primary'
                      : step === currentStep && isPlaying
                      ? 'bg-primary/30'
                      : 'bg-secondary hover:bg-secondary/80'}
                  `}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};