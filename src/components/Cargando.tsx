import { BookOpen } from "lucide-react";

export default function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="relative flex h-24 w-24 items-center justify-center">
        <span className="motion-safe:animate-[aulasync-loader-spin_1.8s_linear_infinite] absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary motion-reduce:hidden" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
          <BookOpen className="h-8 w-8 text-primary" />
        </span>
      </div>
      <p role="status" aria-live="polite" className="mt-5 font-heading font-semibold text-ink">
        {texto}
      </p>
    </div>
  );
}
