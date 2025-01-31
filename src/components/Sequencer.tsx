import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { playNoteByName, playDrumSound, loadDrumSamples, getAudioContext } from '@/lib/audio';

const STEPS = 16;
const PIANO_NOTES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3'];
const DRUM_SOUNDS = ['Kick', 'Snare', 'Hi-Hat'];

export const Sequencer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [pianoSequence, setPianoSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(PIANO_NOTES.map(note => [note, []]))
  );
  const [drumSequence, setDrumSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(DRUM_SOUNDS.map(sound => [sound, []]))
  );
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
    const isUpbeat = prompt.toLowerCase().includes('upbeat');
    const isJazz = prompt.toLowerCase().includes('jazz');
    const hasHeavyKicks = prompt.toLowerCase().includes('heavy') && prompt.toLowerCase().includes('kick');

    const newPianoSequence: Record<string, number[]> = {};
    const newDrumSequence: Record<string, number[]> = {};

    PIANO_NOTES.forEach(note => {
      const steps: number[] = [];
      const numberOfSteps = isJazz ? 4 : (isUpbeat ? 6 : 3);

      while (steps.length < numberOfSteps) {
        const step = Math.floor(Math.random() * STEPS);
        if (!steps.includes(step)) {
          steps.push(step);
        }
      }
      newPianoSequence[note] = steps.sort((a, b) => a - b);
    });

    DRUM_SOUNDS.forEach(sound => {
      const steps: number[] = [];
      let numberOfSteps;

      if (sound === 'Kick') {
        numberOfSteps = hasHeavyKicks ? 8 : 4;
      } else if (sound === 'Hi-Hat') {
        numberOfSteps = isUpbeat ? 12 : 8;
      } else {
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

    const ctx = getAudioContext();
    ctx.resume();

    window.fetch('https://mastra-test-3b7df025-7faf-4058-9684-34e9a2237830.default.mastra.cloud/api/agents/musicAgent/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [prompt],
        output: {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "additionalProperties": false,
          "required": ["Kick", "Snare", "Hi-Hat", "C4", "B3", "A3", "G3"],
          "properties": {
            "C4": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "B3": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "A3": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "G3": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "Kick": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "Snare": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "Hi-Hat": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            }
          }
        }
      }),
    }).then(res => res.json()).then(data => {
      console.log(data.object);

      const pianoSequence = {
        'C4': data.object.C4 || [],
        'B3': data.object.B3 || [],
        'A3': data.object.A3 || [],
        'G3': data.object.G3 || [],
      }

      const drumSequence = {
        'Kick': data.object.Kick || [],
        'Snare': data.object.Snare || [],
        'Hi-Hat': data.object['Hi-Hat'] || [],
      }

      setDrumSequence(drumSequence);
      setPianoSequence(pianoSequence);

      stopSequence();
    });
  };

  const playSequence = () => {
    const ctx = getAudioContext();
    ctx.resume();

    setIsPlaying(true);
    setCurrentStep(0);

    sequencerInterval.current = window.setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % STEPS;

        Object.entries(pianoSequence).forEach(([note, steps]) => {
          if (steps.includes(prev)) {
            playNoteByName(note);
          }
        });

        Object.entries(drumSequence).forEach(([sound, steps]) => {
          if (steps.includes(prev)) {
            playDrumSound(sound);
          }
        });

        return nextStep;
      });
    }, 200);
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

      {!isAudioInitialized && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg text-black">
          <p>Loading audio samples...</p>
        </div>
      )}

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
        <div className="grid grid-cols-[120px_repeat(16,1fr)] gap-1">
          <div className="text-sm font-medium">Steps</div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-400">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="space-y-1 max-h-[500px] overflow-y-auto">
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
                    ${pianoSequence[note]?.includes(step)
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
