import { Sequencer } from "@/components/Sequencer";

const Index = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex-1">
        <Sequencer />
      </div>
      <footer className="text-center text-sm text-primary/60 mt-8">
        Built with <a href="https://mastra.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">mastra.ai</a>
      </footer>
    </div>
  );
};

export default Index;