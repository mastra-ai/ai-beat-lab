// Create a single audio context for the entire application
let audioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Simple synthesizer using oscillator
export const playNote = (frequency: number, duration: number = 0.5) => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Apply simple envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

// Convert note names to frequencies
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C3': 130.81,
  'D3': 146.83,
  'E3': 164.81,
  'F3': 174.61,
  'G3': 196.00,
  'A3': 220.00,
  'B3': 246.94,
  'C4': 261.63,
};

export const playNoteByName = (noteName: string) => {
  const frequency = NOTE_FREQUENCIES[noteName];
  if (frequency) {
    playNote(frequency);
  }
};

// Drum sounds using audio buffer
const drumSamples: { [key: string]: AudioBuffer | null } = {
  'Kick': null,
  'Snare': null,
  'Hi-Hat': null,
  'Clap': null,
};

export const loadDrumSamples = async () => {
  const ctx = getAudioContext();
  const sampleUrls = {
    'Kick': '/samples/kick.wav',
    'Snare': '/samples/snare.wav',
    'Hi-Hat': '/samples/hihat.wav',
    'Clap': '/samples/clap.wav',
  };

  for (const [name, url] of Object.entries(sampleUrls)) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      drumSamples[name] = await ctx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn(`Failed to load drum sample: ${name}`);
    }
  }
};

export const playDrumSound = (name: string) => {
  const ctx = getAudioContext();
  const buffer = drumSamples[name];
  
  if (buffer) {
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    source.start(ctx.currentTime);
  }
};