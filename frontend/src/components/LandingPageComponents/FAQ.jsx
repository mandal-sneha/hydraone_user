import React, { useState } from "react";

const faqs = [
  {
    question: "What is HydraOne and who is it for?",
    answer:
      "HydraOne is a smart water management platform designed for property owners, housing societies, and tenants. It provides real-time monitoring, usage analytics, fraud detection, and streamlined billing — all in one place.",
  },
  {
    question: "How does the water usage monitoring work?",
    answer:
      "HydraOne connects with smart meters and sensors at your property to continuously track water flow. Data is pushed to your dashboard in real time, and you receive alerts for unusual patterns, leaks, or threshold breaches.",
  },
  {
    question: "Can I manage multiple properties on a single account?",
    answer:
      "Yes! Property owners can register and manage multiple properties from one account. Each property has its own set of tenants, water registrations, and usage reports, all accessible from a unified dashboard.",
  },
  {
    question: "How does tenant invitation and onboarding work?",
    answer:
      "Property owners can send digital invitations to tenants directly through HydraOne. Tenants receive an email link to register, complete face verification, and get linked to the correct property — all without any paperwork.",
  },
  {
    question: "What kind of fraud does HydraOne detect?",
    answer:
      "Our AI engine monitors for patterns like sudden spikes in usage, consumption outside normal hours, unauthorized connections, and mismatches between billing records and actual usage. Suspicious activity is flagged immediately.",
  },
  {
    question: "Is my data secure on HydraOne?",
    answer:
      "Absolutely. HydraOne uses JWT-based authentication, encrypted communication, and secure cloud storage. Face data is processed locally and only embeddings (not raw images) are stored. Your data is never shared with third parties.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "HydraOne is fully responsive and accessible from any browser on mobile or desktop. A dedicated mobile app is currently in development and will be available soon.",
  },
];

const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? "border-sky-300 bg-sky-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200"
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sky-400 font-bold text-sm w-6 flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-slate-800 font-semibold text-base">{faq.question}</span>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
            open ? "bg-sky-500 text-white rotate-45" : "bg-slate-100 text-slate-500"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-5 pl-15">
          <div className="ml-9 text-slate-500 text-sm leading-relaxed">{faq.answer}</div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-sky-100 text-sky-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
              Questions
            </span>
          </h2>
          <p className="text-slate-500 text-lg">
            Can't find what you're looking for? Reach out to our team via the Contact section below.
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-br from-sky-50 to-indigo-50 rounded-3xl p-8 border border-sky-100">
          <p className="text-slate-600 mb-4 text-lg font-medium">Still have questions?</p>
          <p className="text-slate-400 text-sm mb-6">Our support team is here to help you 24/7.</p>
          <a
            href="#contact"
            className="inline-block bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;