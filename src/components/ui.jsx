import { useState } from "react";
import {
  Star, Wifi, Waves, Coffee, Umbrella, Utensils, Flower2, Dumbbell, Car, Check, Minus, Plus, Users, Loader2,
} from "lucide-react";

// Every picture comes from the Django API as an absolute URL.
export function Img({ src, alt = "", className = "" }) {
  if (!src) return <div className={`bg-slate-200 ${className}`} aria-hidden />;
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
      ))}
    </span>
  );
}

export const RatingBadge = ({ value }) => (
  <span className="rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">{Number(value).toFixed(1)}</span>
);

const ICONS = [
  ["wifi", Wifi], ["pool", Waves], ["breakfast", Coffee], ["beach", Umbrella],
  ["restaurant", Utensils], ["spa", Flower2], ["gym", Dumbbell], ["parking", Car],
];
export function AmenityIcon({ name = "", size = 15, className = "" }) {
  const Icon = ICONS.find(([k]) => name.toLowerCase().includes(k))?.[1] || Check;
  return <Icon size={size} className={className} />;
}

export const Spinner = () => (
  <div className="flex justify-center p-16 text-brand-600"><Loader2 className="animate-spin" /></div>
);

export const ErrorNote = ({ children }) =>
  children ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p> : null;

export function GuestPicker({ adults, kids, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const Row = ({ label, value, min, k }) => (
    <div className="flex items-center justify-between py-2 text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min}
          onClick={() => onChange({ adults, kids, [k]: value - 1 })}
          className="rounded-full border p-1 disabled:opacity-30"><Minus size={14} /></button>
        <span className="w-4 text-center">{value}</span>
        <button type="button" aria-label={`More ${label}`} disabled={value >= 8}
          onClick={() => onChange({ adults, kids, [k]: value + 1 })}
          className="rounded-full border p-1 disabled:opacity-30"><Plus size={14} /></button>
      </span>
    </div>
  );
  return (
    <div className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="input flex items-center justify-between text-left">
        <span className="flex items-center gap-2"><Users size={16} className="text-slate-400" />{adults} Adult{adults > 1 ? "s" : ""}, {kids} Children</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[220px] rounded-lg border bg-white p-3 shadow-lg">
          <Row label="Adults" value={adults} min={1} k="adults" />
          <Row label="Children" value={kids} min={0} k="kids" />
          <button type="button" className="btn mt-2 w-full" onClick={() => setOpen(false)}>Done</button>
        </div>
      )}
    </div>
  );
}