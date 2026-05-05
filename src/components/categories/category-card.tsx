import Link from "next/link";
import { ChevronRight, Shirt, Image, MessageSquare, Camera, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  shirt: <Shirt className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  "message-square": <MessageSquare className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
};

interface CategoryCardProps {
  name: string;
  parentName: string;
  icon: string;
  href: string;
}

export function CategoryCard({ name, parentName, icon, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-4 bg-white border border-[var(--border-light)] rounded-xl",
        "hover-lift-shadow transition-all duration-300"
      )}
    >
      <div className="p-2 rounded-lg bg-[var(--card-warm)] text-black shrink-0">
        {iconMap[icon] ?? <Shirt className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black truncate">{name}</p>
        <p className="text-xs text-gray-400">{parentName}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </Link>
  );
}
