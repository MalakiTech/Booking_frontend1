import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { api } from "../lib/api.js";
import { Img, ErrorNote } from "../components/ui.jsx";
import { useSiteImages } from "../lib/hooks.js";

const INFO = [
  [Mail, "Email", "malakiopiyo005@gmail.com"],
  [Phone, "Phone", "+254 713892085"],
  [MapPin, "Address", "Egerton, Nakuru, Kenya"],
  [Clock, "Working Hours", "Mon - Sun: 8:00 AM - 8:00 PM"],
];

export default function Contact() {
  const site = useSiteImages();
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState({ busy: false, done: false, err: "" });
  const set = (p) => setF((s) => ({ ...s, ...p }));

  const submit = async (e) => {
    e.preventDefault(); setState({ busy: true, done: false, err: "" });
    try { await api("/contact/", { method: "POST", body: f }); setState({ busy: false, done: true, err: "" }); setF({ name: "", email: "", subject: "", message: "" }); }
    catch (e2) { setState({ busy: false, done: false, err: e2.message }); }
  };

  return (
    <>
      <section className="relative h-56">
        <Img src={site.contact} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 text-white">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-2 max-w-md">We're here to help. Get in touch with our team for any questions or support.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[320px_1fr]">
        <div>
          <h2 className="mb-5 text-lg font-bold">Get in Touch</h2>
          <ul className="space-y-5">
            {INFO.map(([Icon, label, value]) => (
              <li key={label} className="flex items-center gap-3">
                <span className="rounded-lg bg-brand-50 p-2.5 text-brand-600"><Icon size={18} /></span>
                <div className="text-sm"><p className="font-medium">{label}</p><p className="text-slate-500">{value}</p></div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="label">Name</span><input required className="input" placeholder="John Doe" value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
            <label><span className="label">Email</span><input required type="email" className="input" placeholder="john@example.com" value={f.email} onChange={(e) => set({ email: e.target.value })} /></label>
          </div>
          <label className="block"><span className="label">Subject</span>
            <select required className="input" value={f.subject} onChange={(e) => set({ subject: e.target.value })}>
              <option value="">Select a subject</option>
              {["Booking help", "Payments", "Cancellations", "Partnership", "Other"].map((s) => <option key={s}>{s}</option>)}
            </select></label>
          <label className="block"><span className="label">Message</span><textarea required rows={5} className="input" placeholder="Your message..." value={f.message} onChange={(e) => set({ message: e.target.value })} /></label>
          <ErrorNote>{state.err}</ErrorNote>
          {state.done && <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Thanks, your message was sent. We'll reply within one business day.</p>}
          <button className="btn w-full" disabled={state.busy}>{state.busy ? "Sending…" : "Send Message"}</button>
        </form>
      </div>
    </>
  );
}