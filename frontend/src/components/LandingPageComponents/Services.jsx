import React, { useRef, useEffect, useState } from "react";

const MonitoringIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M6 8l3 3 3-3 3 3 3-3" />
  </svg>
);

const HeadcountIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M20 8h2M21 7v2" />
  </svg>
);

const GuestIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
  </svg>
);

const InsightsIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <path d="M2 20h20" />
  </svg>
);

const FineIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const services = [
  {
    Icon: MonitoringIcon,
    title: "Real-time Water Monitoring",
    description:
      "Municipal authorities and residents get live visibility into household water consumption. Anomalies, spikes, and irregular usage are flagged instantly — enabling proactive governance rather than reactive reporting.",
    color: "from-sky-100 to-sky-50",
    accent: "bg-sky-600",
    iconColor: "text-sky-600",
    tag: "Core Feature",
  },
  {
    Icon: HeadcountIcon,
    title: "Headcount-Based Water Allocation",
    description:
      "Water is allocated based on the actual number of verified residents present each day — not property size or fixed estimates. Family members can be marked absent, ensuring no water is wasted on unoccupied slots.",
    color: "from-indigo-100 to-indigo-50",
    accent: "bg-indigo-600",
    iconColor: "text-indigo-600",
    tag: "Key Innovation",
  },
  {
    Icon: GuestIcon,
    title: "Guest Management & Invitation System",
    description:
      "Residents can formally invite guests by specifying arrival time and stay duration. The system automatically adjusts water allocation for that period and tracks the guest's entire stay — creating an auditable, fraud-resistant record.",
    color: "from-violet-100 to-violet-50",
    accent: "bg-violet-500",
    iconColor: "text-violet-600",
    tag: "Transparency",
  },
  {
    Icon: CameraIcon,
    title: "Camera-Based Entry Monitoring",
    description:
      "Entry and exit cameras powered by RetinaFace detection and InceptionResNetV1 facial embeddings verify every individual entering or leaving a property. Each event is logged in real time, updating occupancy counts automatically.",
    color: "from-cyan-100 to-cyan-50",
    accent: "bg-cyan-600",
    iconColor: "text-cyan-700",
    tag: "AI Security",
  },
  {
    Icon: InsightsIcon,
    title: "Usage Insights & Reports",
    description:
      "Residents view daily, monthly, and yearly consumption through pie charts, line trends, and bar breakdowns. Administrators access property-level and municipality-level analytics for data-driven water governance.",
    color: "from-sky-100 to-slate-50",
    accent: "bg-sky-500",
    iconColor: "text-sky-600",
    tag: "Analytics",
  },
  {
    Icon: FineIcon,
    title: "Fine & Penalty Enforcement",
    description:
      "Households that exceed their allocated quota or are found with fraudulent guest registrations are automatically penalized. Violation days are flagged on the admin dashboard with fine details — guest ID, scheduled vs. actual exit, and amount imposed.",
    color: "from-rose-50 to-red-50",
    accent: "bg-rose-500",
    iconColor: "text-rose-600",
    tag: "Accountability",
  },
];

const ServiceCard = ({ service, index }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group bg-gradient-to-br ${service.color} rounded-3xl p-7 border border-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-default ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${service.iconColor}`}>
          <service.Icon />
        </div>
        <span className={`text-xs font-semibold text-white px-3 py-1 rounded-full ${service.accent}`}>
          {service.tag}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-700 transition-colors">
        {service.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
    </div>
  );
};

const Services = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-sky-100 text-sky-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
            Everything You Need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
              Manage Water Intelligently
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From monitoring to fraud detection — HydraOne covers every aspect of modern water management.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;