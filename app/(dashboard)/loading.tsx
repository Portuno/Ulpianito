const DashboardLoading = () => {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`kpi-${index}`}
            className="h-28 animate-pulse rounded-lg border bg-card"
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`ius-${index}`}
            className="h-28 animate-pulse rounded-lg border bg-card"
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardLoading;
