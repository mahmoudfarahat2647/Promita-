import { PromptCard, PromptCardData } from "./prompt-card";

interface PromptGridProps {
  prompts: PromptCardData[];
  onCardClick: (id: string) => void;
}

export function PromptGrid({ prompts, onCardClick }: PromptGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {prompts.map((p) => (
        <PromptCard key={p._id} prompt={p} onClick={onCardClick} />
      ))}
    </div>
  );
}
