import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Tag, CalendarCheck, ShieldCheck, Headphones } from "lucide-react";
import { Img, GuestPicker, Spinner } from "../components/ui.jsx";
import HotelCard from "../components/HotelCard.jsx";
import { useFetch, useSiteImages } from "../lib/hooks.js";
import { addDays, todayStr } from "../lib/utils.js";
import axios from "axios";

const WHY = [
  [Tag, "Best Prices", "Get exclusive deals"],
  [CalendarCheck, "Easy Booking", "Book in minutes"],
  [ShieldCheck, "Secure Payments", "Your data is safe"],
  [Headphones, "24/7 Support", "We're here to help"],
];

export default function Home() {
  const nav = useNavigate();
  const { hash } = useLocation();
  const site = useSiteImages();
  const dests = useFetch("/destinations/");
  const featured = useFetch("/hotels/", { featured: 1 });
  const [q, setQ] = useState({ destination: "", check_in: addDays(todayStr(), 1), check_out: addDays(todayStr(), 3), adults: 2, kids: 0 });
  const set = (patch) => setQ((s) => ({ ...s, ...patch }));

  useEffect(() => { if (hash) document.querySelector(hash)?.scrollIntoView(); }, [hash, dests.data]);

  const search = (e) => {
    e.preventDefault();
    nav(`/hotels?${new URLSearchParams(q)}`);
  };

 

  return (
    <>
      <section className="relative">
        <Img src={site.hero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 text-white md:pt-24">
          <h1 className="max-w-lg text-4xl font-extrabold leading-tight md:text-5xl">Find the Perfect Place to Stay</h1>
          <p className="mt-4 max-w-md text-slate-100">Book hotels, apartments and more. Enjoy the best prices, flexible cancellation and a smooth booking experience.</p>
        </div>
      </section>

      <form onSubmit={search} className="relative z-10 mx-auto -mt-16 max-w-6xl px-4">
        <div className="grid gap-3 rounded-xl bg-white p-4 shadow-xl md:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] md:items-end">
          <label className="block"><span className="label flex items-center gap-1"><MapPin size={14} />Destination</span>
            <input className="input" list="dest-list" placeholder="Where are you going?" value={q.destination} onChange={(e) => set({ destination: e.target.value })} />
            <datalist id="dest-list">{dests.data?.map((d) => <option key={d.id} value={d.name} />)}</datalist>
          </label>
          <label className="block"><span className="label flex items-center gap-1"><Calendar size={14} />Check-in</span>
            <input type="date" className="input" min={todayStr()} value={q.check_in}
              onChange={(e) => set({ check_in: e.target.value, check_out: e.target.value >= q.check_out ? addDays(e.target.value, 1) : q.check_out })} />
          </label>
          <label className="block"><span className="label flex items-center gap-1"><Calendar size={14} />Check-out</span>
            <input type="date" className="input" min={addDays(q.check_in, 1)} value={q.check_out} onChange={(e) => set({ check_out: e.target.value })} />
          </label>
          <div><span className="label">Guests</span><GuestPicker adults={q.adults} kids={q.kids} onChange={set} /></div>
          <button className="btn h-[42px] px-8">Search</button>
        </div>
      </form>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14">
        <section id="destinations">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-bold">Popular Destinations</h2>
            <Link to="/hotels" className="text-sm font-medium text-brand-600">View all</Link></div>
          {dests.loading ? <Spinner /> : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {dests.data?.map((d) => (
                <Link key={d.id} to={`/hotels?destination=${encodeURIComponent(d.name)}`} className="card overflow-hidden">
                  <Img src={d.image} alt={d.name} className="h-32 w-full" />
                  <div className="p-3"><p className="font-semibold">{d.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} />{d.country}</p></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-bold">Featured Hotels</h2>
            <Link to="/hotels" className="text-sm font-medium text-brand-600">View all</Link></div>
          {featured.loading ? <Spinner /> : (
            <div className="grid gap-5 md:grid-cols-3">
              {featured.data?.slice(0, 3).map((h) => <HotelCard key={h.id} hotel={h} />)}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold">Why Choose StayBook?</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(([Icon, title, sub]) => (
              <div key={title} className="flex items-center gap-3">
                <span className="rounded-lg bg-brand-50 p-3 text-brand-600"><Icon size={20} /></span>
                <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-slate-500">{sub}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}