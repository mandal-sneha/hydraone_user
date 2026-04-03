import React from "react";


const StatCard = ({ value, label, icon }) => (
  <div className="flex flex-col items-center gap-1 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
    <span className="text-3xl">{icon}</span>
    <span className="text-2xl font-bold text-white">{value}</span>
    <span className="text-sky-100 text-xs text-center leading-tight">{label}</span>
  </div>
);

const Home = ({ scrollTo }) => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background — deep institutional navy */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(148deg, #0a3d62 0%, #0c4a6e 20%, #075985 50%, #0369a1 75%, #1e40af 100%)" }} />

      {/* Subtle grid texture for a data/gov feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial highlight — keeps depth without being flashy */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(56,189,248,0.12) 0%, transparent 70%)" }}
      />

      {/* Top shimmer accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span className="text-white text-sm font-medium">Smart Water Management System</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mb-6"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
          Manage Water
          <br />
          <span className="text-sky-100">Smarter.</span>{" "}
          <span className="relative">
            <span className="text-white">Live Better.</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
              <path d="M0,6 Q75,12 150,6 Q225,0 300,6" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="text-sky-100 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          HydraOne brings intelligent water monitoring, usage tracking, and fraud detection
          together — giving residents and property managers complete visibility and control.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a
            href="/signup"
            className="bg-white text-sky-600 font-bold px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base"
          >
            Get Started Free
          </a>
          <button
            onClick={() => scrollTo("services")}
            className="bg-white/20 backdrop-blur-sm border border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/30 transition-all duration-300 text-base"
          >
            Explore Features →
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl w-full">
          <StatCard value="30%" label="Average Water Saved" icon="🌿" />
          <StatCard value="24/7" label="Real-time Monitoring" icon="📡" />
          <StatCard value="500+" label="Properties Managed" icon="🏠" />
        </div>
      </div>
    </section>
  );
};

export default Home;