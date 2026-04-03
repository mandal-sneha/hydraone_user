import React, { useRef, useEffect, useState } from "react";

const WaterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0 0 14 0C19 9.5 12 2 12 2z" />
    <path d="M12 14a2 2 0 0 1-2-2" />
  </svg>
);

const CityIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="7" height="12" />
    <rect x="14" y="5" width="7" height="16" />
    <path d="M10 21V5l4-2" />
    <path d="M3 21h18" />
    <path d="M6 12h1M6 15h1M16 8h1M16 11h1M16 14h1" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ScaleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 9l9-6 9 6" />
    <path d="M6 12l-3 6h6l-3-6zM18 12l-3 6h6l-3-6z" />
  </svg>
);

const LeafIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 0 0 4.63 21C15 21 21 15 21 6a1 1 0 0 0-1-1c-1.07 0-3.5.5-3.5.5" />
    <path d="M12 18c0-5 3-9 9-12" />
  </svg>
);

const sdgs = [
  {
    number: "SDG 6",
    title: "Clean Water & Sanitation",
    color: "border-sky-400 bg-sky-50",
    numberColor: "text-sky-600 bg-sky-100",
    iconColor: "text-sky-600 bg-sky-100",
    Icon: WaterIcon,
    how: "HydraOne's core mechanism — headcount-based water allocation — directly advances SDG 6 by ensuring every household receives water proportional to actual need. By eliminating over-allocation and tracking unauthorized consumption, the platform promotes equitable, efficient access to safe water across municipalities.",
  },
  {
    number: "SDG 11",
    title: "Sustainable Cities & Communities",
    color: "border-indigo-400 bg-indigo-50",
    numberColor: "text-indigo-600 bg-indigo-100",
    iconColor: "text-indigo-600 bg-indigo-100",
    Icon: CityIcon,
    how: "The platform's three-tier administrative hierarchy — state, district, and municipality — mirrors India's urban governance structure. By giving local bodies real-time oversight of water distribution within their jurisdiction, HydraOne equips cities to manage shared resources more inclusively and responsibly.",
  },
];

const pillars = [
  {
    title: "Transparency",
    body: "Every drop tracked, every bill justified. Residents can see exactly what they use and when.",
    Icon: EyeIcon,
    color: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-600 bg-sky-100",
  },
  {
    title: "Equity",
    body: "Ensuring fair water distribution across tenants and properties with automated usage enforcement.",
    Icon: ScaleIcon,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600 bg-indigo-100",
  },
  {
    title: "Sustainability",
    body: "Encouraging mindful usage through data-driven insights that promote conservation habits.",
    Icon: LeafIcon,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600 bg-emerald-100",
  },
];

const CommunityImpact = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-indigo-100 text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
            Building a Water-Conscious
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
              Community Together
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            HydraOne isn't just a platform — it's a movement toward responsible water use for every household.
          </p>
        </div>

        {/* SDG Cards */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 px-3">
              UN Sustainable Development Goals Alignment
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sdgs.map((sdg, i) => (
              <div
                key={sdg.number}
                className={`rounded-3xl p-6 border-2 ${sdg.color} transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* SDG badge + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-black tracking-widest px-3 py-1.5 rounded-full ${sdg.numberColor}`}>
                    {sdg.number}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sdg.iconColor}`}>
                    <sdg.Icon />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-3 leading-snug">
                  {sdg.title}
                </h3>

                {/* Divider */}
                <div className="h-px bg-white/80 mb-3" />

                <p className="text-slate-500 text-sm leading-relaxed">{sdg.how}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`rounded-3xl p-6 border ${p.color} ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } transition-all duration-500`}
              style={{ transitionDelay: `${(i + 3) * 120}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${p.iconColor}`}>
                <p.Icon />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Testimonial / Quote */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">"</div>
            <p className="text-xl md:text-2xl font-semibold max-w-2xl mx-auto leading-relaxed mb-6">
              Since adopting HydraOne, our housing society has cut water disputes by 80% and reduced waste significantly. It's transformed how we manage our community.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg font-bold">R</div>
              <div className="text-left">
                <div className="font-semibold text-sm">Rohit Mukherjee</div>
                <div className="text-sky-200 text-xs">Society Manager, Kolkata</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;