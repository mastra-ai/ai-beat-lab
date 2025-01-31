import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Music2, Volume2, Settings2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ReactMarkdown from 'react-markdown';
import { playNoteByName, playDrumSound, loadDrumSamples, getAudioContext } from '@/lib/audio';

const STEPS = 16;
const PIANO_NOTES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3'];
const DRUM_SOUNDS = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Open Hat', 'Tom', 'Crash', 'Ride', 'Shaker', 'Cowbell'];

export const Sequencer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reference, setReference] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [pianoSequence, setPianoSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(PIANO_NOTES.map(note => [note, []]))
  );
  const [drumSequence, setDrumSequence] = useState<Record<string, number[]>>(
    Object.fromEntries(DRUM_SOUNDS.map(sound => [sound, []]))
  );
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateSequence = async () => {
    if (!prompt) return;
    setIsGenerating(true);

    try {
      const ctx = getAudioContext();
      ctx.resume();

      const refAgent = `http://localhost:4111/api/agents/musicReferenceAgent/generate`;
      const response = await window.fetch(refAgent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [`Please analyze the users request "${prompt}"`],
        })
      });

      const d = await response.json();
      setReference(d.text);

      const uri = `http://localhost:4111/api/agents/musicAgent/generate`;
      const result = await window.fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [`Please make me a beat based on this information: ${d.text}`],
          output: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "additionalProperties": false,
            "required": [
              "Kick",
              "Snare",
              "Hi-Hat",
              "Clap",
              "Open Hat",
              "Tom",
              "Crash",
              "Ride",
              "Shaker",
              "Cowbell",
              "C5",
              "B4",
              "A4",
              "G4",
              "F4",
              "E4",
              "D4",
              "C4",
              "B3",
              "A3",
              "G3",
            ],
            "properties": {
              "C5": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "B4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "A4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "G4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "F4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "E4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "D4": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
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
              },
              "Clap": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Open Hat": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Tom": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Crash": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Ride": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Shaker": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              },
              "Cowbell": {
                "type": "array",
                "items": {
                  "type": "integer"
                }
              }
            }
          }
        }),
      });

      const data = await result.json();
      
      const pianoSequence = {
        "C5": data.object.C5 || [],
        "B4": data.object.B4 || [],
        "A4": data.object.A4 || [],
        "G4": data.object.G4 || [],
        "F4": data.object.F4 || [],
        "E4": data.object.E4 || [],
        "D4": data.object.D4 || [],
        "C4": data.object.C4 || [],
        'B3': data.object.B3 || [],
        'A3': data.object.A3 || [],
        'G3': data.object.G3 || [],
      };

      const drumSequence = {
        "Kick": data.object.Kick || [],
        "Snare": data.object.Snare || [],
        "Hi-Hat": data.object?.['Hi-Hat'] || [],
        "Clap": data.object.Clap || [],
        "Open Hat": data.object['Open-Hat'] || [],
        "Tom": data.object.Tom || [],
        "Crash": data.object.Crash || [],
        "Ride": data.object.Ride || [],
        "Shaker": data.object.Shaker || [],
        "Cowbell": data.object.Cowbell || [],
      };

      setDrumSequence(drumSequence);
      setPianoSequence(pianoSequence);
      stopSequence();
    } catch (error) {
      console.error('Error generating sequence:', error);
    } finally {
      setIsGenerating(false);
    }
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
    <div className="bg-muted/50 backdrop-blur-sm rounded-xl p-8 shadow-xl animate-slide-in w-full mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Music2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mastra Music Studio
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isPlaying ? stopSequence() : playSequence()}
            className="h-12 w-12 rounded-full hover:bg-primary/20"
          >
            {isPlaying ? 
              <Pause className="h-6 w-6 text-primary" /> : 
              <Play className="h-6 w-6 text-primary" />
            }
          </Button>
          {isPlaying && (
            <Button
              variant="ghost"
              size="icon"
              onClick={stopSequence}
              className="h-12 w-12 rounded-full hover:bg-primary/20"
            >
              <Square className="h-6 w-6 text-primary" />
            </Button>
          )}
        </div>
      </div>

      {!isAudioInitialized && (
        <div className="mb-6 p-4 bg-yellow-100/10 border border-yellow-400/20 rounded-lg text-yellow-200">
          <p className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Loading audio samples...
          </p>
        </div>
      )}

      {reference && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-primary/90">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 flex-shrink-0" />
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{reference}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-[120px_repeat(16,40px)] gap-1">
          <div className="text-sm font-medium text-primary/80">Steps</div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} className="text-center text-xs text-primary/60">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-primary mb-4">Piano Notes</div>
          {PIANO_NOTES.map(note => (
            <div key={note} className="grid grid-cols-[120px_repeat(16,40px)] gap-1 group">
              <div className="text-sm text-primary/80 group-hover:text-primary transition-colors">
                {note}
              </div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => togglePianoStep(note, step)}
                  className={`
                    aspect-square rounded-md cursor-pointer transition-all duration-200 transform hover:scale-95
                    ${pianoSequence[note]?.includes(step)
                      ? 'bg-primary shadow-lg shadow-primary/20'
                      : step === currentStep && isPlaying
                        ? 'bg-primary/30'
                        : 'bg-secondary/40 hover:bg-secondary/60'}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-8">
          <div className="text-sm font-medium text-primary mb-4">Drum Sounds</div>
          {DRUM_SOUNDS.map(sound => (
            <div key={sound} className="grid grid-cols-[120px_repeat(16,40px)] gap-1 group">
              <div className="text-sm text-primary/80 group-hover:text-primary transition-colors">
                {sound}
              </div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => toggleDrumStep(sound, step)}
                  className={`
                    aspect-square rounded-md cursor-pointer transition-all duration-200 transform hover:scale-95
                    ${drumSequence[sound].includes(step)
                      ? 'bg-primary shadow-lg shadow-primary/20'
                      : step === currentStep && isPlaying
                        ? 'bg-primary/30'
                        : 'bg-secondary/40 hover:bg-secondary/60'}
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