import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { Img, RatingBadge } from "./ui.jsx";
import { money } from "../lib/utils.js";

export default function HotelCard({ hotel, query = "" }) {
  return (
    <Link to={`/hotels/${hotel.id}${query}`} className="card block overflow-hidden transition hover:shadow-md">
      <div className="relative">
        <Img src={hotel.image} alt={hotel.name} className="h-44 w-full" />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5"><Heart size={15} /></span>
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-center gap-2 text-sm">
          <RatingBadge value={hotel.rating} /> <span className="text-slate-500">({hotel.review_count} reviews)</span>
        </div>
        <h3 className="font-semibold">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{hotel.location}</p>
        <p className="pt-1"><span className="text-lg font-bold text-brand-600">{money(hotel.price_per_night)}</span> <span className="text-sm text-slate-500">/ night</span></p>
      </div>
    </Link>
  );
}