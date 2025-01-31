import { Sequencer } from "@/components/Sequencer";

const Index = () => {
  return (
    <div className="min-h-screen p-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1">
        <Sequencer />
      </div>
      <footer className="text-center text-sm text-primary/60 mt-8">
        Built with mastra.ai
      </footer>
    </div>
  );
};

export default Index;