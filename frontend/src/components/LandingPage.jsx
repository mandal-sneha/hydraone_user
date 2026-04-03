import React, { useState, useEffect, useRef } from "react";
import Home from "./LandingPageComponents/Home";
import Services from "./LandingPageComponents/Services";
import CommunityImpact from "./LandingPageComponents/CommunityImpact";
import FAQ from "./LandingPageComponents/FAQ";
import Contact from "./LandingPageComponents/Contact";

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectionRefs = {
    home: useRef(null),
    services: useRef(null),
    communityimpact: useRef(null),
    faq: useRef(null),
    contact: useRef(null),
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = Object.entries(sectionRefs);
      for (let i = sections.length - 1; i >= 0; i--) {
        const [key, ref] = sections[i];
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(key);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (section) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinks = [
    { key: "home", label: "Home" },
    { key: "services", label: "Services" },
    { key: "communityimpact", label: "Community Impact" },
    { key: "faq", label: "FAQ" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen font-sans bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-sky-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
              </svg>
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? "text-sky-800" : "text-white"
              }`}
            >
              Hydra<span className="text-sky-400">One</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map(({ key, label }) => (
              <li key={key}>
                <button
                  onClick={() => scrollTo(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeSection === key
                      ? "bg-sky-100 text-sky-700"
                      : scrolled
                      ? "text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                      : "text-white/90 hover:text-white hover:bg-white/15"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-sky-700 hover:text-sky-900" : "text-white/90 hover:text-white"
              }`}
            >
              Log in
            </a>
            <a
              href="/signup"
              className="bg-gradient-to-r from-sky-400 to-indigo-400 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Get Started
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-slate-700" : "bg-white"}`} />
            <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-slate-700" : "bg-white"}`} />
            <div className={`w-5 h-0.5 transition-all ${scrolled ? "bg-slate-700" : "bg-white"}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-sky-100 px-6 py-4 flex flex-col gap-2 shadow-lg">
            {navLinks.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === key
                    ? "bg-sky-100 text-sky-700"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <a href="/login" className="flex-1 text-center py-2 rounded-xl border border-sky-200 text-sky-700 text-sm font-medium">Log in</a>
              <a href="/signup" className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 text-white text-sm font-semibold">Get Started</a>
            </div>
          </div>
        )}
      </nav>

      {/* Sections */}
      <div ref={sectionRefs.home}><Home scrollTo={scrollTo} /></div>
      <div ref={sectionRefs.services}><Services /></div>
      <div ref={sectionRefs.communityimpact}><CommunityImpact /></div>
      <div ref={sectionRefs.faq}><FAQ /></div>
      <div ref={sectionRefs.contact}><Contact /></div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-sky-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg">HydraOne</span>
          </div>
          <p className="text-sky-300 text-sm text-center">
            © 2025 HydraOne. Smart Water Management for a Sustainable Future.
          </p>
          <div className="flex gap-4 text-sm text-sky-300">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;