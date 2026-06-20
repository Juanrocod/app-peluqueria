"use client";

export default function ReservarError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#2A1A1A] bg-[#16213A] p-6 text-center">
        <div className="mx-auto mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[rgba(242,97,87,.15)]">
          <span className="text-2xl">!</span>
        </div>
        <div className="mb-2 text-lg font-bold text-white">
          Algo salió mal
        </div>
        <p className="mb-5 text-sm text-[#9DA9C0]">
          No pudimos procesar tu reserva. Por favor intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="w-full rounded-xl bg-[#3B6EF5] py-3 text-sm font-bold text-white"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
