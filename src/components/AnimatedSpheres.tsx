const AnimatedSpheres = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Large primary sphere — top left */}
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] animate-float-slow rounded-full bg-primary/[0.07] blur-3xl" />
      {/* Accent sphere — top right */}
      <div className="absolute -top-20 -right-16 h-[320px] w-[320px] animate-float-reverse rounded-full bg-accent/[0.06] blur-3xl" />
      {/* Secondary sphere — center */}
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 animate-float-slower rounded-full bg-secondary/[0.05] blur-3xl" />
      {/* Small accent glow — bottom left */}
      <div className="absolute -bottom-16 left-1/4 h-[240px] w-[240px] animate-glow-pulse rounded-full bg-accent/[0.08] blur-3xl" />
      {/* Primary glow — bottom right */}
      <div className="absolute -bottom-32 -right-20 h-[360px] w-[360px] animate-float-slow rounded-full bg-primary/[0.06] blur-3xl" style={{ animationDelay: "-8s" }} />
    </div>
  );
};

export default AnimatedSpheres;
