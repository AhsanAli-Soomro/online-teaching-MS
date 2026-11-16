import clsx from "clsx";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm",
        hover && "transition-all hover:shadow-md hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={clsx("mb-4 border-b border-slate-100 pb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={clsx("text-lg font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={clsx("text-sm text-slate-500 mt-1", className)}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={clsx("mt-6 border-t border-slate-100 pt-4 flex items-center justify-between", className)}>{children}</div>;
}

export default Card;
