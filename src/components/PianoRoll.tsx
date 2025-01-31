import React, { useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';

const notes = ['C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'];

export const PianoRoll = () => {
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleNote = (note: string) => {
    setActiveNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={togglePlay}
          className="transport-button"
        >
          {isPlaying ? <Square size={24} /> : <Play size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <Volume2 size={20} />
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="75"
            className="w-32"
          />
        </div>
      </div>

      <div className="grid grid-cols-8 gap-px bg-secondary p-1 rounded-lg">
        {notes.map((note) => (
          <div
            key={note}
            onClick={() => toggleNote(note)}
            className={`piano-key white ${
              activeNotes.includes(note) ? 'active' : ''
            }`}
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};