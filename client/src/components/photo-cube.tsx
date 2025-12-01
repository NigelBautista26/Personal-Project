import { useEffect, useState } from "react";

import photo1 from "@assets/stock_images/beautiful_profession_d550635a.jpg";
import photo2 from "@assets/stock_images/beautiful_profession_4e904727.jpg";
import photo3 from "@assets/stock_images/beautiful_profession_95e1492a.jpg";
import photo4 from "@assets/stock_images/beautiful_profession_ffa38dc4.jpg";
import photo5 from "@assets/stock_images/beautiful_profession_3c074fd2.jpg";
import photo6 from "@assets/stock_images/beautiful_profession_7eaa7b30.jpg";

const photos = [photo1, photo2, photo3, photo4, photo5, photo6];

export default function PhotoCube() {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (isReduced) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-2xl overflow-hidden opacity-20"
          style={{
            backgroundImage: `url(${photo1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 perspective-[1000px]">
        <div 
          className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px]"
          style={{
            transformStyle: "preserve-3d",
            animation: "cubeRotate 25s infinite linear",
          }}
        >
          {/* Front face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[0]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Back face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "rotateY(180deg) translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[1]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Right face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "rotateY(90deg) translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[2]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Left face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "rotateY(-90deg) translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[3]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Top face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "rotateX(90deg) translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[4]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Bottom face */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
            style={{
              transform: "rotateX(-90deg) translateZ(100px)",
              backfaceVisibility: "hidden",
            }}
          >
            <img 
              src={photos[5]} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* Gradient overlay to help with form readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <style>{`
        @keyframes cubeRotate {
          0% {
            transform: rotateX(-15deg) rotateY(0deg);
          }
          25% {
            transform: rotateX(15deg) rotateY(90deg);
          }
          50% {
            transform: rotateX(-15deg) rotateY(180deg);
          }
          75% {
            transform: rotateX(15deg) rotateY(270deg);
          }
          100% {
            transform: rotateX(-15deg) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}
