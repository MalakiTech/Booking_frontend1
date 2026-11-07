import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, Lock, CreditCard, Smartphone, Building } from "lucide-react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Img, Stars, Spinner, ErrorNote } from "../components/ui.jsx";
import { addDays, money, nightsBetween, plural, TAX_RATE, todayStr } from "../lib/utils.js";
import MpesaPay from "../components/MpesaPay.jsx";



const METHODS = [
  ["mpesa", "M-Pesa", "Pay with M-Pesa", Smartphone],
  ["card", "Credit/Debit Card", "Coming soon", CreditCard, true],
  ["pay_at_hotel", "Pay at Hotel", "Pay when you arrive", Building],
];

const STEPS = ["Details", "Payment", "Confirmation"];

export default function Checkout() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const { data: hotel, loading } = useFetch(`/hotels/${id}/`);

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    room: sp.get("room") || "",
    check_in: sp.get("check_in") || addDays(todayStr(), 1),
    check_out: sp.get("check_out") || addDays(todayStr(), 3),
    adults: Number(sp.get("adults") || 2),
    children: Number(sp.get("kids") || 0),
    guest_name: user?.name || "", guest_email: user?.email || "", guest_phone: "",
    special_requests: "", payment_method: "mpesa",
  });
  const set = (p) => setF((s) => ({ ...s, ...p }));

  useEffect(() => { if (hotel && !f.room && hotel.rooms[0]) set({ room: String(hotel.rooms[0].id) }); }, [hotel]); // eslint-disable-line

  if (loading) return <Spinner />;
  if (!hotel) return <p className="p-16 text-center text-slate-500">Hotel not found.</p>;

  const room = hotel.rooms.find((r) => String(r.id) === String(f.room));
  const nights = nightsBetween(f.check_in, f.check_out);
  const subtotal = (room?.price_per_night || 0) * nights;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes;

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (nights < 1) return setErr("Check-out must be after check-in.");
    setBusy(true);
    try {
      const b = await api("/bookings/", { method: "POST", body: { ...f, hotel: hotel.id, room: Number(f.room) } });
      setBooking(b);
      setStep(f.payment_method === "pay_at_hotel" ? 3 : 2);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
 

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Complete Your Booking</h1>

      <ol className="mx-auto my-8 flex max-w-xl items-center">
        {STEPS.map((s, i) => {
          const n = i + 1, done = step > n, on = step === n;
          return (
            <li key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${done || on ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {done ? <Check size={16} /> : n}</span>
                <span className="text-xs text-slate-500">{s}</span>
              </div>
              {n < 3 && <span className={`mx-2 mb-5 h-px flex-1 ${done ? "bg-brand-600" : "bg-slate-200"}`} />}
            </li>
          );
        })}
      </ol>

      {step === 3 ? (
        <div className="card mx-auto max-w-lg space-y-3 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"><Check /></span>
          <h2 className="text-xl font-bold">{booking?.status === "confirmed" ? "Booking confirmed" : "Booking received"}</h2>
          <p className="text-sm text-slate-500">Reference <b className="text-ink">{booking?.reference}</b>. A confirmation was sent to {f.guest_email}.</p>
          <Link to="/bookings" className="btn mt-2">View my bookings</Link>
        </div>
           ) : step === 2 ? (
        <div className="card mx-auto max-w-lg space-y-4 p-6">
          <h2 className="text-lg font-bold">Pay with M-Pesa</h2>
          <MpesaPay booking={booking} defaultPhone={f.guest_phone}
            onPaid={() => { setBooking({ ...booking, status: "confirmed" }); setTimeout(() => setStep(3), 1200); }} />
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="card space-y-4 p-5">
              <h2 className="font-semibold">Booking Details</h2>
              <div className="flex gap-3">
                <Img src={hotel.image} className="h-20 w-24 rounded-lg" />
                <div><p className="font-semibold">{hotel.name}</p><p className="text-sm text-slate-500">{hotel.location}</p><Stars value={hotel.rating} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label">Check-in</span><input type="date" required className="input" min={todayStr()} value={f.check_in} onChange={(e) => set({ check_in: e.target.value })} /></label>
                <label><span className="label">Check-out</span><input type="date" required className="input" min={addDays(f.check_in, 1)} value={f.check_out} onChange={(e) => set({ check_out: e.target.value })} /></label>
                <label><span className="label">Adults</span>
                  <select className="input" value={f.adults} onChange={(e) => set({ adults: +e.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></label>
                <label><span className="label">Children</span>
                  <select className="input" value={f.children} onChange={(e) => set({ children: +e.target.value })}>{[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
              </div>
              <label className="block"><span className="label">Room type</span>
                <select className="input" value={f.room} onChange={(e) => set({ room: e.target.value })}>
                  {hotel.rooms.map((r) => <option key={r.id} value={r.id}>{r.name} – {money(r.price_per_night)}/night</option>)}
                </select></label>
            </section>

            <section className="card space-y-4 p-5">
              <h2 className="font-semibold">Guest Information</h2>
              <label className="block"><span className="label">Full Name</span><input required className="input" value={f.guest_name} onChange={(e) => set({ guest_name: e.target.value })} /></label>
              <label className="block"><span className="label">Email Address</span><input required type="email" className="input" value={f.guest_email} onChange={(e) => set({ guest_email: e.target.value })} /></label>
              <label className="block"><span className="label">Phone Number</span><input required type="tel" className="input" placeholder="+254 712 345 678" value={f.guest_phone} onChange={(e) => set({ guest_phone: e.target.value })} /></label>
              <label className="block"><span className="label">Special Requests (Optional)</span><textarea rows={3} className="input" placeholder="Any special requests?" value={f.special_requests} onChange={(e) => set({ special_requests: e.target.value })} /></label>
            </section>
          </div>

          <aside className="space-y-4 md:sticky md:top-24 md:h-fit">
            <section className="card space-y-2 p-5 text-sm">
              <h2 className="font-semibold">Payment Summary</h2>
              <p className="flex justify-between"><span>Room ({plural(nights, "night")})</span><span>{money(subtotal)}</span></p>
              <p className="flex justify-between"><span>Taxes and fees</span><span>{money(taxes)}</span></p>
              <p className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>{money(total)}</span></p>
            </section>
            <section className="card space-y-2 p-5">
              <h2 className="font-semibold">Choose Payment Method</h2>
              {METHODS.map(([v, title, sub, Icon, off]) => (
                <label key={v} className={`flex items-center gap-3 rounded-lg border p-3 ${off ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${f.payment_method === v ? "border-brand-600 bg-brand-50" : ""}`}>
                  <input type="radio" name="pay" disabled={off} className="accent-brand-600" checked={f.payment_method === v} onChange={() => set({ payment_method: v })} />
                  <Icon size={20} className="text-slate-500" />
                  <span className="text-sm"><b className="block">{title}</b><span className="text-xs text-slate-500">{sub}</span></span>
                </label>
              ))}
            </section>
            <ErrorNote>{err}</ErrorNote>
            <button className="btn w-full" disabled={busy || !room}>{busy ? "Saving…" : "Proceed to Payment"}</button>
            <p className="flex items-center justify-center gap-1 text-xs text-slate-500"><Lock size={12} />Your booking information is secure.</p>
          </aside>
        </form>
      )}
    </div>
  );
}