import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin, ShieldCheck } from "lucide-react";
import { Img, Stars, AmenityIcon, GuestPicker, Spinner } from "../components/ui.jsx";
import { useFetch } from "../lib/hooks.js";
import { addDays, money, plural, todayStr } from "../lib/utils.js";

export default function HotelDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const { data: hotel, loading, error } = useFetch(`/hotels/${id}/`);
  const [active, setActive] = useState(0);
  const [trip, setTrip] = useState({
    check_in: sp.get("check_in") || addDays(todayStr(), 1),
    check_out: sp.get("check_out") || addDays(todayStr(), 3),
    adults: Number(sp.get("adults") || 2),
    kids: Number(sp.get("kids") || 0),
  });
  const set = (p) => setTrip((t) => ({ ...t, ...p }));

  if (loading) return <Spinner />;
  if (error || !hotel) return <p className="p-16 text-center text-slate-500">We couldn't find this hotel. <Link to="/hotels" className="text-brand-600">Back to results</Link></p>;

  const photos = [hotel.image, ...hotel.images.map((i) => i.image)].filter(Boolean);
  const book = (roomId) => nav(`/checkout/${hotel.id}?${new URLSearchParams({ ...trip, ...(roomId || hotel.rooms[0] ? { room: roomId || hotel.rooms[0].id } : {}) })}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Img src={photos[active]} alt={hotel.name} className="h-64 w-full rounded-xl md:h-96" />
      <div className="mt-3 grid grid-cols-5 gap-3">
        {photos.slice(0, 5).map((p, i) => (
          <button key={i} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
            className={`overflow-hidden rounded-lg ring-2 ${active === i ? "ring-brand-600" : "ring-transparent"}`}>
            <Img src={p} className="h-16 w-full md:h-20" />
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">{hotel.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} />{hotel.location}</p>
            <p className="mt-2 flex items-center gap-2"><Stars value={hotel.rating} size={16} /><span className="font-semibold">{Number(hotel.rating).toFixed(1)}</span>
              <span className="text-sm text-slate-500">({plural(hotel.review_count, "review")})</span></p>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {hotel.amenities.map((a) => <li key={a} className="flex items-center gap-2"><AmenityIcon name={a} size={16} />{a}</li>)}
            </ul>
          </div>

          <section><h2 className="mb-2 text-lg font-bold">About this hotel</h2>
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-slate-600">{hotel.description}</p></section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Available Rooms</h2>
            <div className="space-y-4">
              {hotel.rooms.map((r) => (
                <div key={r.id} className="card flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
                  <Img src={r.image} alt={r.name} className="h-28 w-full rounded-lg sm:w-40" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-sm text-slate-500">{r.beds} · {plural(r.max_guests, "guest")}</p>
                    <p className="mt-1 flex gap-3 text-xs text-slate-500">{r.features.map((f) => <span key={f} className="flex items-center gap-1"><AmenityIcon name={f} size={13} />{f}</span>)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                    <p><span className="text-lg font-bold text-brand-600">{money(r.price_per_night)}</span> <span className="text-sm text-slate-500">/ night</span></p>
                    <button className="btn mt-2 w-28" onClick={() => book(r.id)}>Select</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <p><span className="text-2xl font-bold text-brand-600">{money(hotel.price_per_night)}</span> <span className="text-slate-500">/ night</span></p>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="label">Check-in</span><input type="date" className="input" min={todayStr()} value={trip.check_in}
              onChange={(e) => set({ check_in: e.target.value, check_out: e.target.value >= trip.check_out ? addDays(e.target.value, 1) : trip.check_out })} /></label>
            <label><span className="label">Check-out</span><input type="date" className="input" min={addDays(trip.check_in, 1)} value={trip.check_out} onChange={(e) => set({ check_out: e.target.value })} /></label>
          </div>
          <div><span className="label">Guests</span><GuestPicker adults={trip.adults} kids={trip.kids} onChange={set} /></div>
          <button className="btn w-full" onClick={() => book()}>Book Now</button>
          {hotel.free_cancellation && (
            <p className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck size={16} className="shrink-0 text-green-600" />
              <span><b className="text-ink">Free cancellation</b><br />Cancel up to 24 hours before check-in.</span></p>
          )}
        </aside>
      </div>
    </div>
  );
}