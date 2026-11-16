import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function Badge({
  children,
  variant = "default", // default, success, warning, danger, info, indigo
  size = "md", // sm, md
  className = "",
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1 rounded-full border",
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
