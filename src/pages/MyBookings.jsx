import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Heart, Settings, User, CreditCard, LogOut, BookOpen } from "lucide-react";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Img, Spinner, ErrorNote } from "../components/ui.jsx";
import { fmtDate, todayStr } from "../lib/utils.js";
import MpesaPay from "../components/MpesaPay.jsx";


const BADGE = {
  confirmed: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700", completed: "bg-slate-100 text-slate-600",
};
const SIDE = [[BookOpen, "My Bookings"], [User, "Profile"], [Heart, "Favorites"], [CreditCard, "Payment Methods"], [Settings, "Settings"]];

export default function MyBookings() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const { data, loading, error } = useFetch("/bookings/");
  const [tab, setTab] = useState("upcoming");
  const [local, setLocal] = useState({}); // id -> updated booking after cancel/pay
  const [err, setErr] = useState("");
  const [payingId, setPayingId] = useState(null);

  const act = async (b, action) => {
    setErr("");
    try { const u = await api(`/bookings/${b.id}/${action}/`, { method: "POST" }); setLocal((l) => ({ ...l, [b.id]: u })); }
    catch (e) { setErr(e.message); }
  };

  const all = (data || []).map((b) => local[b.id] || b);
  const isUpcoming = (b) => b.status !== "cancelled" && b.check_out >= todayStr();
  const list = all.filter((b) => (tab === "upcoming" ? isUpcoming(b) : !isUpcoming(b)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <p className="text-slate-500">View and manage your bookings</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1" aria-label="Account">
          {SIDE.map(([Icon, label], i) => (
            <span key={label} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${i === 0 ? "bg-brand-50 font-medium text-brand-600" : "text-slate-600"}`}>
              <Icon size={16} />{label}</span>
          ))}
          <button onClick={async () => { await logout(); nav("/"); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"><LogOut size={16} />Logout</button>
        </nav>

        <div>
          <div role="tablist" className="mb-4 flex gap-6 border-b text-sm font-medium">
            {[["upcoming", "Upcoming"], ["past", "Past Bookings"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`pb-3 ${tab === k ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <ErrorNote>{err || error?.message}</ErrorNote>
          {loading ? <Spinner /> : !list.length ? (
            <div className="card p-10 text-center text-slate-500">
              {tab === "upcoming" ? "No upcoming trips yet." : "No past bookings."}{" "}
              <Link to="/hotels" className="font-medium text-brand-600">Find a place to stay</Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {list.map((b) => (
                <li key={b.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap">
                  <Img src={b.hotel_image} alt={b.hotel_name} className="h-32 w-full rounded-lg sm:w-48" />
                  <div className="flex-1 space-y-1 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold">{b.hotel_name}</h2>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${BADGE[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="flex items-center gap-1.5 text-slate-500"><MapPin size={13} />{b.hotel_location}</p>
                    <p className="flex items-center gap-1.5 text-slate-500"><Calendar size={13} />Check-in: {fmtDate(b.check_in)}</p>
                    <p className="flex items-center gap-1.5 text-slate-500"><Calendar size={13} />Check-out: {fmtDate(b.check_out)}</p>
                    <p className="flex items-center gap-1.5 text-slate-500"><Users size={13} />{b.adults} Adults, {b.children} Children</p>
                    <div className="flex gap-2 pt-2">
                      <Link to={`/hotels/${b.hotel}`} className="btn-outline">View Details</Link>
                     
                      {isUpcoming(b) && (
                        <button className="inline-flex items-center rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" onClick={() => act(b, "cancel")}>Cancel Booking</button>
                      )}
                    </div>
                  </div>
                  
                    {payingId === b.id && (
                    <div className="basis-full border-t pt-4">
                      <MpesaPay booking={b} defaultPhone={b.guest_phone}
                        onPaid={() => { setLocal((l) => ({ ...l, [b.id]: { ...b, status: "confirmed" } })); setPayingId(null); }} />
                    </div>
                  )}
                   
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}