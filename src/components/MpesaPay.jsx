import { useEffect, useState } from "react";
import { Check, Loader2, Smartphone } from "lucide-react";
import { api } from "../lib/api.js";
import { ErrorNote } from "./ui.jsx";
import { money } from "../lib/utils.js";

const POLL_MS = 3000;
const MAX_POLLS = 40; // about 2 minutes

export default function MpesaPay({ booking, defaultPhone = "", onPaid }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [phase, setPhase] = useState("idle"); // idle | waiting | success | failed
  const [pay, setPay] = useState(null);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const start = async (e) => {
    e.preventDefault(); setErr(""); setSending(true);
    try {
      setPay(await api(`/bookings/${booking.id}/mpesa/`, { method: "POST", body: { phone } }));
      setPhase("waiting");
    } catch (e2) { setErr(e2.message); } finally { setSending(false); }
  };

  useEffect(() => {
    if (phase !== "waiting" || !pay) return;
    let polls = 0, stopped = false;
    const t = setInterval(async () => {
      polls += 1;
      try {
        const p = await api(`/payments/${pay.id}/`);
        if (stopped) return;
        if (p.status === "success") { clearInterval(t); setPay(p); setPhase("success"); onPaid?.(p); }
        else if (p.status !== "pending") { clearInterval(t); setPay(p); setErr(p.message); setPhase("failed"); }
        else if (polls >= MAX_POLLS) {
          clearInterval(t);
          setErr("We didn't hear back from M-Pesa. If money left your account, your booking will confirm shortly.");
          setPhase("failed");
        }
      } catch { /* network blip: keep polling */ }
    }, POLL_MS);
    return () => { stopped = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pay?.id]);

  if (phase === "success")
    return (
      <div className="space-y-2 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600"><Check /></span>
        <p className="font-semibold">Payment received</p>
        {pay?.receipt && <p className="text-sm text-slate-500">M-Pesa receipt {pay.receipt}</p>}
      </div>
    );

  if (phase === "waiting")
    return (
      <div className="space-y-2 text-center" role="status">
        <Loader2 className="mx-auto animate-spin text-brand-600" />
        <p className="font-semibold">Check your phone</p>
        <p className="text-sm text-slate-600">Enter your M-Pesa PIN to pay KES {pay?.amount_kes?.toLocaleString()}.</p>
      </div>
    );

  return (
    <form onSubmit={start} className="space-y-4">
      <p className="text-sm text-slate-600">We'll send a payment prompt for {money(booking.total)} to your phone.</p>
      <label className="block"><span className="label">M-Pesa phone number</span>
        <span className="relative block">
          <Smartphone size={16} className="absolute left-3 top-3 text-slate-400" />
          <input required type="tel" inputMode="tel" className="input pl-9" placeholder="0712 345 678"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </span></label>
      <ErrorNote>{err}</ErrorNote>
      {pay?.status !== "review" && (
        <button className="btn w-full" disabled={sending}>
          {sending ? "Sending prompt…" : phase === "failed" ? "Try again" : `Pay ${money(booking.total)}`}
        </button>
      )}
    </form>
  );
}