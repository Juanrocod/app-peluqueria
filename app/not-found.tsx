import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="text-center">
        <div className="font-mono-num text-6xl font-bold text-ap-muted">404</div>
        <h2 className="mt-3 text-xl font-bold text-ap-text">Página no encontrada</h2>
        <p className="mt-2 text-sm text-ap-muted">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/reservar"
          className="mt-6 inline-block rounded-xl bg-ap-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-ap-primary-dk"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}