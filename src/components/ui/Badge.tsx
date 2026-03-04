import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "orange" | "green" | "blue" | "purple";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-[var(--text-body)] border-white/10",
    orange: "bg-[var(--orange-primary)]/10 text-blue-300 border-[var(--orange-primary)]/25",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/25",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
