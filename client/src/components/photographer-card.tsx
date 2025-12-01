import { Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface PhotographerProps {
  id: string;
  name: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  compact?: boolean;
  sessionState?: 'available' | 'in_session' | 'offline';
  nextAvailableAt?: string | null;
}

export function PhotographerCard({ id, name, location, price, rating, reviews, image, compact = false, sessionState = 'available', nextAvailableAt }: PhotographerProps) {
  const getStatusDisplay = () => {
    if (sessionState === 'in_session') {
      const nextTime = nextAvailableAt 
        ? format(new Date(nextAvailableAt), 'h:mm a')
        : '';
      return {
        color: 'bg-yellow-500',
        text: nextTime ? `Free at ${nextTime}` : 'In Session',
      };
    } else if (sessionState === 'available') {
      return {
        color: 'bg-green-500',
        text: 'Available Now',
      };
    } else {
      return {
        color: 'bg-gray-500',
        text: 'Offline',
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <Link href={`/photographer/${id}`}>
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
        <div className="relative">
          <img src={image} alt={name} loading="lazy" className="w-16 h-16 rounded-xl object-cover" />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.color} border-2 border-card`} />
        </div>
        
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

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-white">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
            <span className={`text-[10px] font-medium ${sessionState === 'in_session' ? 'text-yellow-400' : sessionState === 'available' ? 'text-green-400' : 'text-gray-400'}`}>
              {status.text}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}