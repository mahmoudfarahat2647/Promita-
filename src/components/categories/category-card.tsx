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
        "flex items-center gap-3 p-4 bg-[#111] border border-[#222] rounded-xl",
        "hover:border-[#444] hover:bg-[#1a1a1a] transition-colors duration-150"
      )}
    >
      <div className="p-2 rounded-lg bg-[#1a1a1a] text-white shrink-0">
        {iconMap[icon] ?? <Shirt className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        <p className="text-xs text-[#666]">{parentName}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#444] shrink-0" />
    </Link>
  );
}
