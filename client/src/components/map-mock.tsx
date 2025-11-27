import mapBg from "@assets/generated_images/dark_mode_map_interface_background_for_a_mobile_app.png";
import annaImg from "@assets/generated_images/portrait_of_a_professional_female_photographer_named_anna.png";
import joseImg from "@assets/generated_images/portrait_of_a_professional_male_photographer_named_jose.png";
import { MapPin } from "lucide-react";
import { Link } from "wouter";

export function MapMock() {
  // Mock pins positions
  const pins = [
    { id: "anna", x: "40%", y: "35%", img: annaImg, price: "£40" },
    { id: "jose", x: "65%", y: "55%", img: joseImg, price: "£35" },
    { id: "sophie", x: "25%", y: "60%", img: null, price: "£50" }, // Fallback avatar
  ];

  return (
    <div className="absolute inset-0 w-full h-full bg-cover bg-center z-0" style={{ backgroundImage: `url(${mapBg})` }}>
      {/* Overlay gradient for better text visibility at top */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background/90 to-transparent pointer-events-none" />
      
      {pins.map((pin) => (
        <Link key={pin.id} href={`/photographer/${pin.id}`}>
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
            style={{ top: pin.y, left: pin.x }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-card shadow-lg map-pin-shadow transition-transform group-hover:scale-110">
                {pin.img ? (
                  <img src={pin.img} alt="pin" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {pin.price}
                  </div>
                )}
              </div>
              {pin.img && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                  {pin.price}
                </div>
              )}
            </div>
            
            {/* Triangle pointer */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white mt-1 shadow-sm" />
          </div>
        </Link>
      ))}
    </div>
  );
}