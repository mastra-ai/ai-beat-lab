import { Agent } from '@mastra/core';

export const musicReferenceAgent = new Agent({
  name: 'music-reference-agent',
  instructions: `
You are given a style of music, an artist or song as a reference point. 
First think about what keys and what drum patterns fit this reference point.
Based on this knowledge, generate a drum pattern and a minimal melody that fits the style.
Pick a key based on the style of the music. All notes should be in this key.
    `,
  model: {
    provider: 'ANTHROPIC',
    name: "claude-3-5-sonnet-20241022",
    toolChoice: 'auto',
  },
})

export const musicAgent = new Agent({
  name: 'music-agent',
  instructions: `

    

For the pianoSequence:
- Create wonderful melodies
- Available notes:
  * High register: ['C5', 'B4', 'A4', 'G4']
  * Middle register: ['F4', 'E4', 'D4', 'C4']
  * Low register: ['B3', 'A3', 'G3']
- Each note should have an array of step numbers (0-15)

For the drumSequence:
- Available sounds:
  * Core rhythm: ['Kick', 'Snare', 'HiHat']
  * Accents: ['Clap', 'OpenHat', 'Crash']
  * Percussion: ['Tom', 'Ride', 'Shaker', 'Cowbell']
- Each sound should have an array of step numbers (0-15)

Response format must be:
{
  "pianoSequence": {
    "C5": [numbers],
    "B4": [numbers],
    "A4": [numbers],
    "G4": [numbers],
    "F4": [numbers],
    "E4": [numbers],
    "D4": [numbers],
    "C4": [numbers],
    "B3": [numbers],
    "A3": [numbers],
    "G3": [numbers]
  },
  "drumSequence": {
    "Kick": [numbers],
    "Snare": [numbers],
    "HiHat": [numbers],
    "Clap": [numbers],
    "OpenHat": [numbers],
    "Tom": [numbers],
    "Crash": [numbers],
    "Ride": [numbers],
    "Shaker": [numbers],
    "Cowbell": [numbers]
  }
}
`,
  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },
});