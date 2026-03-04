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
    default: "bg-gray-100/80 text-[var(--text-body)] border-gray-200/50",
    orange: "bg-[var(--peach-light)] text-[var(--orange-primary)] border-[var(--glass-border-orange)]",
    green: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50",
    blue: "bg-blue-50/80 text-blue-700 border-blue-200/50",
    purple: "bg-purple-50/80 text-purple-700 border-purple-200/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
