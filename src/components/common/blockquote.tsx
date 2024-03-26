export function Blockquote({ children }: { children?: React.ReactNode }) {
  return (
    <blockquote className="relative my-5 pl-5 border-l-4 boder-slate-200/30">
      {children}
    </blockquote>
  );
}
