export default function ProductLoading() {
  return (
    <div className="shell py-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[640px] animate-pulse rounded-[2rem] bg-white/60" />
        <div className="h-[640px] animate-pulse rounded-[2rem] bg-white/60" />
      </div>
    </div>
  );
}
