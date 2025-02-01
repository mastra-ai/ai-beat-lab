import MidiWriter from 'midi-writer-js';
import { TEMPO_PRESETS } from './constants';

export const handleExportMidi = ({ toast, tempo, pianoSequence, drumSequence }) => {    // Create a new MIDI track
    const track = new MidiWriter.Track();

    // Set tempo
    const bpm = TEMPO_PRESETS[tempo].bpm;
    track.setTempo(bpm);

    // Convert piano sequence to MIDI notes
    Object.entries(pianoSequence).forEach(([note, steps]) => {
        steps.forEach(step => {
            // Convert note name to MIDI note number (e.g., 'C4' to 60)
            const noteEvent = new MidiWriter.NoteEvent({
                pitch: note,
                duration: '4',
                startTick: step * 128, // 128 ticks per quarter note
                velocity: 100
            });
            track.addEvent(noteEvent);
        });
    });

    // Convert drum sequence to MIDI notes (using General MIDI drum mapping)
    const drumMapping: Record<string, number> = {
        'Kick': 36,
        'Snare': 38,
        'HiHat': 42,
        'Clap': 39,
        'OpenHat': 46,
        'Tom': 45,
        'Crash': 49,
        'Ride': 51,
        'Shaker': 70,
        'Cowbell': 56
    };

    Object.entries(drumSequence).forEach(([drum, steps]) => {
        const midiNote = drumMapping[drum];
        if (midiNote) {
            steps.forEach(step => {
                const drumEvent = new MidiWriter.NoteEvent({
                    pitch: midiNote,
                    duration: '4',
                    startTick: step * 128,
                    channel: 10, // MIDI channel 10 is reserved for drums
                    velocity: 100
                });
                track.addEvent(drumEvent);
            });
        }
    });

    // Create a write stream
    const writer = new MidiWriter.Writer(track);

    // Create a Blob from the MIDI data
    const blob = new Blob([writer.buildFile()], { type: 'audio/midi' });

    // Create a download link and trigger it
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-beat.midi';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
        title: "MIDI file exported",
        description: "Your beat has been exported as a MIDI file.",
    });
};