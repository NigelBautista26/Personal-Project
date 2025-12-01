import { useEffect, useState } from "react";

import photo1 from "@assets/stock_images/beautiful_profession_d550635a.jpg";
import photo2 from "@assets/stock_images/beautiful_profession_4e904727.jpg";
import photo3 from "@assets/stock_images/beautiful_profession_95e1492a.jpg";
import photo4 from "@assets/stock_images/beautiful_profession_ffa38dc4.jpg";
import photo5 from "@assets/stock_images/beautiful_profession_3c074fd2.jpg";
import photo6 from "@assets/stock_images/beautiful_profession_7eaa7b30.jpg";

const photos = [photo1, photo2, photo3, photo4, photo5, photo6];

interface CubeConfig {
  size: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
  opacity: number;
  startPhotos: number[];
}

const cubeConfigs: CubeConfig[] = [
  // Top row
  { size: 110, top: "2%", left: "5%", delay: 0, duration: 20, opacity: 0.75, startPhotos: [0, 1, 2, 3, 4, 5] },
  { size: 95, top: "5%", left: "40%", delay: -4, duration: 24, opacity: 0.65, startPhotos: [3, 4, 5, 0, 1, 2] },
  { size: 100, top: "3%", left: "72%", delay: -8, duration: 22, opacity: 0.7, startPhotos: [2, 3, 4, 5, 0, 1] },
  
  // Upper-middle row  
  { size: 85, top: "18%", left: "20%", delay: -2, duration: 26, opacity: 0.55, startPhotos: [1, 2, 3, 4, 5, 0] },
  { size: 80, top: "20%", left: "58%", delay: -10, duration: 28, opacity: 0.5, startPhotos: [4, 5, 0, 1, 2, 3] },
  { size: 90, top: "16%", left: "85%", delay: -6, duration: 21, opacity: 0.6, startPhotos: [5, 0, 1, 2, 3, 4] },
  
  // Middle row
  { size: 75, top: "35%", left: "2%", delay: -12, duration: 25, opacity: 0.5, startPhotos: [0, 2, 4, 1, 3, 5] },
  { size: 70, top: "38%", left: "30%", delay: -5, duration: 30, opacity: 0.4, startPhotos: [1, 3, 5, 0, 2, 4] },
  { size: 65, top: "40%", left: "65%", delay: -14, duration: 27, opacity: 0.35, startPhotos: [2, 4, 0, 3, 5, 1] },
  { size: 80, top: "36%", left: "88%", delay: -9, duration: 23, opacity: 0.45, startPhotos: [3, 5, 1, 4, 0, 2] },
  
  // Lower-middle row
  { size: 85, top: "55%", left: "8%", delay: -3, duration: 29, opacity: 0.5, startPhotos: [4, 0, 2, 5, 1, 3] },
  { size: 75, top: "58%", left: "45%", delay: -16, duration: 24, opacity: 0.35, startPhotos: [5, 1, 3, 0, 2, 4] },
  { size: 90, top: "52%", left: "78%", delay: -7, duration: 26, opacity: 0.55, startPhotos: [0, 3, 5, 2, 4, 1] },
  
  // Bottom row
  { size: 95, top: "72%", left: "15%", delay: -11, duration: 22, opacity: 0.6, startPhotos: [1, 4, 0, 3, 5, 2] },
  { size: 80, top: "75%", left: "50%", delay: -1, duration: 28, opacity: 0.5, startPhotos: [2, 5, 1, 4, 0, 3] },
  { size: 100, top: "70%", left: "80%", delay: -13, duration: 25, opacity: 0.65, startPhotos: [3, 0, 2, 5, 1, 4] },
  
  // Very bottom row
  { size: 85, top: "88%", left: "5%", delay: -15, duration: 27, opacity: 0.55, startPhotos: [4, 1, 3, 0, 2, 5] },
  { size: 90, top: "90%", left: "35%", delay: -8, duration: 23, opacity: 0.5, startPhotos: [5, 2, 4, 1, 3, 0] },
  { size: 95, top: "87%", left: "65%", delay: -4, duration: 26, opacity: 0.6, startPhotos: [0, 4, 1, 5, 2, 3] },
];

function SingleCube({ config }: { config: CubeConfig }) {
  const halfSize = config.size / 2;
  
  return (
    <div 
      className="absolute"
      style={{
        top: config.top,
        left: config.left,
        perspective: "800px",
        opacity: config.opacity,
      }}
    >
      <div 
        className="relative"
        style={{
          width: `${config.size}px`,
          height: `${config.size}px`,
          transformStyle: "preserve-3d",
          animation: `cubeRotate ${config.duration}s infinite linear`,
          animationDelay: `${config.delay}s`,
        }}
      >
        {/* Front face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[0]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>

        {/* Back face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `rotateY(180deg) translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[1]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>

        {/* Right face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `rotateY(90deg) translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[2]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>

        {/* Left face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[3]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>

        {/* Top face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `rotateX(90deg) translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[4]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>

        {/* Bottom face */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          <img src={photos[config.startPhotos[5]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

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
        {cubeConfigs.slice(0, 4).map((config, i) => (
          <div 
            key={i}
            className="absolute rounded-xl overflow-hidden"
            style={{
              top: config.top,
              left: config.left,
              width: `${config.size}px`,
              height: `${config.size}px`,
              opacity: config.opacity * 0.5,
              backgroundImage: `url(${photos[config.startPhotos[0]]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cubeConfigs.map((config, i) => (
        <SingleCube key={i} config={config} />
      ))}

      {/* Gradient overlay to help with form readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background/95" />

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
