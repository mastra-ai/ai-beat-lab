import { PianoRoll } from "@/components/PianoRoll";
import { DrumSequencer } from "@/components/DrumSequencer";

const Index = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Web Music Studio</h1>
      <div className="max-w-4xl mx-auto">
        <PianoRoll />
        <DrumSequencer />
      </div>
    </div>
  );
};

export default Index;