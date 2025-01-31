import { Sequencer } from "@/components/Sequencer";

const Index = () => {
  return (
    <div className="min-h-screen p-2 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full">
        <Sequencer />
      </div>
      <footer className="text-center text-xs md:text-sm text-primary/60 mt-4 md:mt-8">
        Built with <a href="https://mastra.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">mastra.ai</a>
      </footer>
    </div>
  );
};

export default Index;