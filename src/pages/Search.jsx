import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, ChevronDown } from "lucide-react";
import { Img, Stars, AmenityIcon, Spinner } from "../components/ui.jsx";
import { useFetch } from "../lib/hooks.js";
import { money, tripParams, plural } from "../lib/utils.js";

const AMENITIES = ["Free WiFi", "Swimming Pool", "Breakfast Included", "Beachfront"];
const TYPES = [["hotel", "Hotel"], ["resort", "Resort"], ["apartment", "Apartment"], ["villa", "Villa"], ["guest_house", "Guest House"]];

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />{label}
    </label>
  );
}

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [dest, setDest] = useState(sp.get("destination") || "");

  const update = (fn) => { const n = new URLSearchParams(sp); fn(n); setSp(n, { replace: true }); };
  const set = (k, v) => update((n) => (v === "" || v == null ? n.delete(k) : n.set(k, v)));
  const toggle = (k, v) => update((n) => {
    const cur = n.getAll(k); n.delete(k);
    (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).forEach((x) => n.append(k, x));
  });

  const ratings = sp.getAll("rating").map(Number);
  const params = {
    destination: sp.get("destination"),
    max_price: sp.get("max_price"),
    min_rating: ratings.length ? Math.min(...ratings) : "",
    amenities: sp.getAll("amenity"),
    types: sp.getAll("type"),
    free_cancellation: sp.get("free_cancellation"),
    ordering: sp.get("ordering") || "recommended",
  };
  const { data, loading } = useFetch("/hotels/", params);
  const trip = tripParams(sp);
  const tripQ = trip.toString() ? `?${trip}` : "";
  const maxPrice = Number(sp.get("max_price") || 500);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <form onSubmit={(e) => { e.preventDefault(); set("destination", dest); }}
        className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <MapPin className="text-brand-600" size={18} />
        <input className="input max-w-xs" placeholder="Destination" value={dest} onChange={(e) => setDest(e.target.value)} />
        <input type="date" className="input w-auto" value={sp.get("check_in") || ""} onChange={(e) => set("check_in", e.target.value)} aria-label="Check-in" />
        <input type="date" className="input w-auto" value={sp.get("check_out") || ""} onChange={(e) => set("check_out", e.target.value)} aria-label="Check-out" />
        <button className="btn ml-auto">Modify Search</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="card h-fit space-y-6 p-5">
          <h2 className="text-lg font-bold">Filters</h2>
          <div>
            <p className="label">Price per night</p>
            <input type="range" min="50" max="500" step="10" value={maxPrice} className="w-full accent-brand-600"
              aria-label="Maximum price" onChange={(e) => set("max_price", e.target.value >= 500 ? "" : e.target.value)} />
            <p className="text-xs text-slate-500">$0 - ${maxPrice}</p>
          </div>
          <div>
            <p className="label">Hotel Rating</p>
            {[5, 4, 3, 2, 1].map((r) => (
              <Check key={r} label={`${r} star${r > 1 ? "s" : ""}`} checked={sp.getAll("rating").includes(String(r))} onChange={() => toggle("rating", String(r))} />
            ))}
          </div>
          <div>
            <p className="label">Amenities</p>
            {AMENITIES.map((a) => <Check key={a} label={a} checked={sp.getAll("amenity").includes(a)} onChange={() => toggle("amenity", a)} />)}
            <Check label="Free Cancellation" checked={sp.get("free_cancellation") === "1"} onChange={() => set("free_cancellation", sp.get("free_cancellation") === "1" ? "" : "1")} />
          </div>
          <div>
            <p className="label">Property Type</p>
            {TYPES.map(([v, l]) => <Check key={v} label={l} checked={sp.getAll("type").includes(v)} onChange={() => toggle("type", v)} />)}
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold">{loading ? "Searching…" : `${data?.length ?? 0} hotels found`}</p>
            <label className="flex items-center gap-2 text-sm text-slate-500">Sort by
              <span className="relative">
                <select className="input appearance-none pr-8" value={params.ordering} onChange={(e) => set("ordering", e.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: low to high</option>
                  <option value="price_high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2 top-3.5" />
              </span>
            </label>
          </div>

          {loading ? <Spinner /> : !data?.length ? (
            <p className="card p-10 text-center text-slate-500">No hotels match these filters. Try widening your price range or removing a filter.</p>
          ) : (
            <ul className="space-y-4">
              {data.map((h) => (
                <li key={h.id} className="card flex flex-col overflow-hidden sm:flex-row">
                  <Img src={h.image} alt={h.name} className="h-44 w-full sm:h-auto sm:w-60" />
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:flex-row">
                    <div className="space-y-1.5">
                      <h3 className="font-semibold">{h.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{h.location}</p>
                      <p className="flex items-center gap-2 text-sm"><Stars value={h.rating} /><span className="font-medium">{Number(h.rating).toFixed(1)}</span>
                        <span className="text-slate-500">({plural(h.review_count, "review")})</span></p>
                      <p className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
                        {h.amenities.slice(0, 3).map((a) => <span key={a} className="flex items-center gap-1"><AmenityIcon name={a} size={13} />{a}</span>)}
                      </p>
                    </div>
                    <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-end">
                      <p className="text-sm text-slate-500">from <span className="text-lg font-bold text-ink">{money(h.price_per_night)}</span> /night</p>
                      <Link to={`/hotels/${h.id}${tripQ}`} className="btn">View Details</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}