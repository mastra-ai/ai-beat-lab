export const TEMPO_PRESETS = {
    slow: { label: 'Slow', bpm: 90 },
    medium: { label: 'Medium', bpm: 120 },
    fast: { label: 'Fast', bpm: 138 },
    hardstyle: { label: 'Hardstyle', bpm: 160 },
};


export function getMastraFetchUrl() {
    if (process.env.NODE_ENV === 'production') {
        return 'https://whining-tender-accident-95b472a1-9ed3-42e5-bf98-2b51ec91c0ec.default.mastra.cloud';
    } else {
        return 'http://localhost:4111';
    }
}
