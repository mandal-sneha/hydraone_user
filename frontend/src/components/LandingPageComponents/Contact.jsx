import React, { useState } from "react";

const EmailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const contactMethods = [
  {
    Icon: EmailIcon,
    label: "Email Us",
    value: "support@hydraone.in",
    sub: "We reply within 24 hours",
    color: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-600 bg-sky-100",
  },
  {
    Icon: PhoneIcon,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon–Fri, 9 AM – 6 PM IST",
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600 bg-indigo-100",
  },
  {
    Icon: LocationIcon,
    label: "Our Office",
    value: "Kolkata, West Bengal",
    sub: "India — 700001",
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-600 bg-violet-100",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10) e.message = "Message too short";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-sky-100 text-sky-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Get in Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
            We'd Love to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
              Hear From You
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Have a question, want a demo, or need support? Drop us a message and we'll get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left — Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {contactMethods.map((c) => (
              <div key={c.label} className={`rounded-2xl border p-5 ${c.color} flex items-start gap-4`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconColor}`}>
                  <c.Icon />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{c.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}

            {/* Social links placeholder */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-600 mb-3">Follow HydraOne</p>
              <div className="flex gap-3">
                {["𝕏", "in", "f", "▶"].map((s, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-sm font-bold hover:bg-sky-100 transition-colors flex items-center justify-center"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-sky-100">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                  <SuccessIcon />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                <p className="text-slate-500 max-w-sm">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sky-600 text-sm font-semibold hover:underline"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Send us a message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your name"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.name
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        }`}
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="How can we help?"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                        errors.subject
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      }`}
                    />
                    {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us more about your query..."
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none ${
                        errors.message
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      }`}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    Send Message →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;