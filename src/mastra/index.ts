
import { Mastra } from '@mastra/core';
import { musicReferenceAgent, musicAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        musicReferenceAgent,
        musicAgent
    }
})
