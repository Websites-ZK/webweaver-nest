const AnimatedSpheres = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Gradient glow blobs */}
      <div className="absolute -top-20 -left-20 h-[500px] w-[500px] animate-glow-pulse rounded-full bg-primary/[0.12] blur-3xl will-change-[opacity,transform]" />
      <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] animate-glow-pulse rounded-full bg-accent/[0.10] blur-3xl will-change-[opacity,transform]" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/3 right-1/4 h-[350px] w-[350px] animate-glow-pulse rounded-full bg-secondary/[0.08] blur-3xl will-change-[opacity,transform]" style={{ animationDelay: "-6s" }} />

      {/* Wave layer 1 — primary */}
      <svg
        className="absolute bottom-0 left-0 h-[320px] w-[200%] animate-wave opacity-20 will-change-transform"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,160 C320,260 640,60 960,160 C1280,260 1440,80 1440,160 C1600,240 1760,60 1920,160 C2080,260 2240,80 2400,160 C2560,240 2720,100 2880,160 L2880,320 L0,320 Z"
          fill="hsl(var(--primary))"
        />
      </svg>

      {/* Wave layer 2 — accent, reverse */}
      <svg
        className="absolute bottom-0 left-0 h-[260px] w-[200%] animate-wave-reverse opacity-[0.16] will-change-transform"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,200 C240,100 480,280 720,180 C960,80 1200,260 1440,200 C1680,140 1920,280 2160,180 C2400,80 2640,240 2880,200 L2880,320 L0,320 Z"
          fill="hsl(var(--accent))"
        />
      </svg>

      {/* Wave layer 3 — secondary, slowest */}
      <svg
        className="absolute bottom-0 left-0 h-[220px] w-[200%] animate-wave-slow opacity-[0.14] will-change-transform"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,240 C360,140 720,300 1080,220 C1440,140 1800,280 2160,240 C2520,200 2700,280 2880,240 L2880,320 L0,320 Z"
          fill="hsl(var(--secondary))"
        />
      </svg>

      {/* Wave layer 4 — primary lighter, top area (hangs from top) */}
      <svg
        className="absolute top-0 left-0 h-[200px] w-[200%] animate-wave-reverse opacity-[0.08]"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 L2880,0 L2880,140 C2640,220 2400,80 2160,160 C1920,240 1680,100 1440,160 C1200,220 960,80 720,140 C480,200 240,100 0,160 Z"
          fill="hsl(var(--primary))"
        />
      </svg>
    </div>
  );
};

export default AnimatedSpheres;
