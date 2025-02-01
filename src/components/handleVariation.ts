import { getAudioContext } from "@/lib/audio";
import { getMastraFetchUrl } from "./constants";

export const handleGenerateVariation = async ({
    pianoSequence,
    drumSequence,
    setIsGenerating,
    setDrumSequence,
    setPianoSequence,
    stopSequence,
    toast,
}) => {
    if (!pianoSequence || !drumSequence) return;

    setIsGenerating(true);

    const currentPattern = {
        piano: pianoSequence,
        drums: drumSequence
    };

    try {
        const ctx = getAudioContext();
        ctx.resume();


        const uri = getMastraFetchUrl() + '/api/agents/musicAgent/generate';
        const result = await window.fetch(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [`Please create a variation of this musical pattern, keeping some elements similar but adding creative changes. Here's the current pattern: ${JSON.stringify(currentPattern)}`],
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
                        "C5": { "type": "array", "items": { "type": "integer" } },
                        "B4": { "type": "array", "items": { "type": "integer" } },
                        "A4": { "type": "array", "items": { "type": "integer" } },
                        "G4": { "type": "array", "items": { "type": "integer" } },
                        "F4": { "type": "array", "items": { "type": "integer" } },
                        "E4": { "type": "array", "items": { "type": "integer" } },
                        "D4": { "type": "array", "items": { "type": "integer" } },
                        "C4": { "type": "array", "items": { "type": "integer" } },
                        "B3": { "type": "array", "items": { "type": "integer" } },
                        "A3": { "type": "array", "items": { "type": "integer" } },
                        "G3": { "type": "array", "items": { "type": "integer" } },
                        "Kick": { "type": "array", "items": { "type": "integer" } },
                        "Snare": { "type": "array", "items": { "type": "integer" } },
                        "HiHat": { "type": "array", "items": { "type": "integer" } },
                        "Clap": { "type": "array", "items": { "type": "integer" } },
                        "OpenHat": { "type": "array", "items": { "type": "integer" } },
                        "Tom": { "type": "array", "items": { "type": "integer" } },
                        "Crash": { "type": "array", "items": { "type": "integer" } },
                        "Ride": { "type": "array", "items": { "type": "integer" } },
                        "Shaker": { "type": "array", "items": { "type": "integer" } },
                        "Cowbell": { "type": "array", "items": { "type": "integer" } }
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

        toast({
            title: "Variation generated!",
            description: "A new variation of your beat has been created.",
        });
    } catch (error) {
        console.error('Error generating variation:', error);
        toast({
            title: "Error",
            description: "Failed to generate variation. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsGenerating(false);
    }
};