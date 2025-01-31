import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Music2, Volume2, Settings2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ReactMarkdown from 'react-markdown';
import { playNoteByName, playDrumSound, loadDrumSamples, getAudioContext } from '@/lib/audio';
import { useIsMobile } from '@/hooks/use-mobile';

const STEPS = 16;
const PIANO_NOTES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3'];
const DRUM_SOUNDS = ['Kick', 'Snare', 'HiHat', 'Clap', 'OpenHat', 'Tom', 'Crash', 'Ride', 'Shaker', 'Cowbell'];

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
  const [isReferenceExpanded, setIsReferenceExpanded] = useState(true);

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
              "HiHat",
              "Clap",
              "OpenHat",
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
              "HiHat": {
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
              "OpenHat": {
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
      })

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
        "HiHat": data.object?.['HiHat'] || [],
        "Clap": data.object.Clap || [],
        "OpenHat": data.object['OpenHat'] || [],
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

  const isMobile = useIsMobile();

  return (
    <div className="bg-muted/50 backdrop-blur-sm rounded-xl p-4 md:p-8 shadow-xl animate-slide-in w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Music2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <div className="space-y-0.5 md:space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Beat Laboratory
            </h1>
            <p className="text-xs md:text-sm text-primary/70">Where AI drops beats and humans drop jaws</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isPlaying ? stopSequence() : playSequence()}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full hover:bg-primary/20"
          >
            {isPlaying ?
              <Pause className="h-5 w-5 md:h-6 md:w-6 text-primary" /> :
              <Play className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            }
          </Button>
          {isPlaying && (
            <Button
              variant="ghost"
              size="icon"
              onClick={stopSequence}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full hover:bg-primary/20"
            >
              <Square className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </Button>
          )}
        </div>
      </div>

      {!isAudioInitialized && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-100/10 border border-yellow-400/20 rounded-lg text-yellow-200">
          <p className="flex items-center gap-2 text-sm md:text-base">
            <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
            Loading audio samples...
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Enter your music prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full text-sm md:text-base"
        />
        <Button
          onClick={handleGenerateSequence}
          disabled={isGenerating || !prompt}
          className="w-full md:w-auto md:ml-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>

      {reference && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-lg overflow-hidden transition-all duration-300">
          <button
            onClick={() => setIsReferenceExpanded(!isReferenceExpanded)}
            className="w-full p-3 md:p-4 flex items-center justify-between text-left hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Settings2 className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-primary/80" />
              <span className="font-medium text-primary text-sm md:text-base">AI Music Analysis</span>
            </div>
            {isReferenceExpanded ? (
              <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-primary/60" />
            ) : (
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-primary/60" />
            )}
          </button>
          {isReferenceExpanded && (
            <div className="p-3 md:p-4 pt-0">
              <div className="max-h-[150px] md:max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent prose prose-invert prose-sm max-w-none w-full">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-primary/90 leading-relaxed mb-2 text-sm md:text-base">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-primary/90">{children}</ul>,
                    li: ({ children }) => <li className="text-primary/90 text-sm md:text-base">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                    em: ({ children }) => <em className="text-primary/90 italic">{children}</em>,
                  }}
                >
                  {reference}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6 overflow-x-auto pb-4">
        <div className="grid grid-cols-[100px_repeat(16,32px)] gap-1.5 min-w-[612px]">
          <div className="text-xs md:text-sm font-medium text-primary/80">Steps</div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} className="text-center text-xs text-primary/60">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="space-y-3 min-w-[612px]">
          <div className="text-xs md:text-sm font-medium text-primary mb-2">Piano Notes</div>
          {PIANO_NOTES.map(note => (
            <div key={note} className="grid grid-cols-[100px_repeat(16,32px)] gap-1.5 group">
              <div className="text-xs md:text-sm text-primary/80 group-hover:text-primary transition-colors">
                {note}
              </div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => togglePianoStep(note, step)}
                  className={`
                    aspect-square rounded-sm cursor-pointer transition-all duration-200 transform hover:scale-95
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

        <div className="space-y-3 mt-6 min-w-[612px]">
          <div className="text-xs md:text-sm font-medium text-primary mb-2">Drum Sounds</div>
          {DRUM_SOUNDS.map(sound => (
            <div key={sound} className="grid grid-cols-[100px_repeat(16,32px)] gap-1.5 group">
              <div className="text-xs md:text-sm text-primary/80 group-hover:text-primary transition-colors">
                {sound}
              </div>
              {Array.from({ length: STEPS }, (_, step) => (
                <div
                  key={step}
                  onClick={() => toggleDrumStep(sound, step)}
                  className={`
                    aspect-square rounded-sm cursor-pointer transition-all duration-200 transform hover:scale-95
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
