export default function FacilitySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Memuat fasilitas">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-xl border border-orange-100 bg-orange-50/60"
        />
      ))}
    </div>
  );
}
