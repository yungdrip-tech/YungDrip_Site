function LoadingCard() {
  return <div className="h-80 animate-pulse rounded-[1.75rem] bg-white/60" />;
}

export default function Loading() {
  return (
    <div className="shell py-16">
      <div className="mb-10 h-24 animate-pulse rounded-[2rem] bg-white/60" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    </div>
  );
}
