import Link from "next/link";
import { Shirt, Image, MessageSquare, Camera, Megaphone } from "lucide-react";
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
        "group flex items-center gap-3 p-4 bg-[#111] border border-[#1e1e1e] rounded-xl",
        "hover:border-[#2e2e2e] hover:bg-[#141414] transition-colors duration-150"
      )}
    >
      <div className="p-2 rounded-lg bg-[#1a1a1a] border border-[#222] text-white shrink-0 group-hover:bg-[#222] transition-colors">
        {iconMap[icon] ?? <Shirt className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold tracking-[-0.1px] text-white truncate">{name}</p>
        <p className="text-xs text-[#666]">{parentName}</p>
      </div>
      <span className="text-[#333] text-lg shrink-0">›</span>
    </Link>
  );
}
