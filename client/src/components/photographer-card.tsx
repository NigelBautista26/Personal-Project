import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface PhotographerProps {
  id: string;
  name: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  compact?: boolean;
}

export function PhotographerCard({ id, name, location, price, rating, reviews, image, compact = false }: PhotographerProps) {
  return (
    <Link href={`/photographer/${id}`}>
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
        <img src={image} alt={name} className="w-16 h-16 rounded-xl object-cover" />
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white truncate">{name}</h3>
              <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{location}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-white block">{price}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hourly</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-white">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}