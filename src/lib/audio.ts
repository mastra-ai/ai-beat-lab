// Create a single audio context for the entire application
let audioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
    // Resume audio context on creation to handle auto-play restrictions
    audioContext.resume();
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

  // Resume the audio context to handle auto-play policy
  await ctx.resume();

  const sampleUrls = {
    'Kick': '/samples/kick-808.wav',
    'Snare': '/samples/snare-808.wav',
    'Hi-Hat': '/samples/hihat-808.wav',
    'Clap': '/samples/clap-808.wav',
  };

  for (const [name, url] of Object.entries(sampleUrls)) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      drumSamples[name] = await ctx.decodeAudioData(arrayBuffer);
      console.log(`Successfully loaded drum sample: ${name}`);
    } catch (error) {
      console.error(`Failed to load drum sample: ${name}`, error);
    }
  }
};

export const playDrumSound = async (name: string) => {
  const ctx = getAudioContext();

  // Ensure context is running
  if (ctx.state !== 'running') {
    await ctx.resume();
  }

  const buffer = drumSamples[name];

  if (buffer) {
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    source.start(ctx.currentTime);
  } else {
    console.warn(`Drum sample not loaded: ${name}`);
  }
};