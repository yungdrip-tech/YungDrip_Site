export default function ShopLoading() {
  return (
    <div className="shell py-12">
      <div className="mb-8 h-48 animate-pulse rounded-[2rem] bg-white/60" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/60" />
        ))}
      </div>
    </div>
  );
}
