"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-3 text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-ap-text">Algo salió mal</h2>
        <p className="mt-1 text-sm text-ap-muted">
          Ocurrió un error inesperado. Intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-ap-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ap-primary-dk"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}