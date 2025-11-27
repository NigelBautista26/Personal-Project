import { useRoute, Link } from "wouter";
import { ArrowLeft, Heart, Share, Star, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import annaImg from "@assets/generated_images/portrait_of_a_professional_female_photographer_named_anna.png";
import joseImg from "@assets/generated_images/portrait_of_a_professional_male_photographer_named_jose.png";

const photographers = {
  anna: {
    name: "Anna L.",
    location: "London, UK",
    bio: "Professional portrait and lifestyle photographer. I love capturing candid moments and natural light. Let's create something magic!",
    price: "£40",
    rating: 4.9,
    reviews: 128,
    image: annaImg,
    portfolio: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400",
      "https://images.unsplash.com/photo-1519764622345-23439dd776f7?w=400",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
    ]
  },
  jose: {
    name: "Jose V.",
    location: "Shoreditch, London",
    bio: "Street style and urban vibes. If you want edgy, cool content for your socials, I'm your guy.",
    price: "£35",
    rating: 4.7,
    reviews: 84,
    image: joseImg,
    portfolio: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    ]
  }
};

export default function PhotographerProfile() {
  const [match, params] = useRoute("/photographer/:id");
  const id = params?.id || "anna";
  const data = photographers[id as keyof typeof photographers] || photographers.anna;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Image Area */}
      <div className="relative h-72 w-full">
        <img src={data.portfolio[0]} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-center z-10">
          <Link href="/home">
            <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden shadow-xl">
            <img src={data.image} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 mb-2">
             <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-white border border-white/10 hover:border-primary hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{data.name}</h1>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {data.location}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-yellow-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-white">{data.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground underline">{data.reviews} reviews</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            {data.bio}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-white mb-4">Portfolio</h3>
          <div className="grid grid-cols-3 gap-2">
            {data.portfolio.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-card">
                <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-white/10 z-50">
        <div className="max-w-md mx-auto flex gap-4 items-center">
          <div className="flex-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{data.price}</span>
              <span className="text-sm text-muted-foreground">/ hour</span>
            </div>
          </div>
          <Link href={`/book/${id}`}>
            <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}