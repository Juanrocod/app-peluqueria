export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-ap-border border-t-ap-primary" />
        <span className="text-sm text-ap-muted">Cargando...</span>
      </div>
    </div>
  );
}
