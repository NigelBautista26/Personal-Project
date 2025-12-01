import { useEffect, useState } from "react";

import photo1 from "@assets/stock_images/beautiful_profession_d550635a.jpg";
import photo2 from "@assets/stock_images/beautiful_profession_4e904727.jpg";
import photo3 from "@assets/stock_images/beautiful_profession_95e1492a.jpg";
import photo4 from "@assets/stock_images/beautiful_profession_ffa38dc4.jpg";
import photo5 from "@assets/stock_images/beautiful_profession_3c074fd2.jpg";
import photo6 from "@assets/stock_images/beautiful_profession_7eaa7b30.jpg";
import photo7 from "@assets/stock_images/instagram_travel_pho_81d9c578.jpg";
import photo8 from "@assets/stock_images/instagram_travel_pho_529df077.jpg";
import photo9 from "@assets/stock_images/instagram_travel_pho_d24f756e.jpg";
import photo10 from "@assets/stock_images/instagram_travel_pho_f619aac7.jpg";
import photo11 from "@assets/stock_images/instagram_travel_pho_97901a84.jpg";
import photo12 from "@assets/stock_images/instagram_travel_pho_05e6e9a8.jpg";
import photo13 from "@assets/stock_images/instagram_travel_pho_1335fc3c.jpg";
import photo14 from "@assets/stock_images/instagram_travel_pho_7bccb283.jpg";
import photo15 from "@assets/stock_images/instagram_travel_pho_eada20e0.jpg";
import photo16 from "@assets/stock_images/instagram_travel_pho_34fd34b8.jpg";

const photos = [
  photo1, photo2, photo3, photo4, photo5, photo6,
  photo7, photo8, photo9, photo10, photo11, photo12,
  photo13, photo14, photo15, photo16
];

interface RowConfig {
  top: string;
  cubeSize: number;
  direction: "left" | "right";
  duration: number;
  opacity: number;
  cubesPerRow: number;
}

const rowConfigs: RowConfig[] = [
  { top: "0%", cubeSize: 100, direction: "right", duration: 60, opacity: 0.7, cubesPerRow: 6 },
  { top: "12%", cubeSize: 90, direction: "left", duration: 70, opacity: 0.6, cubesPerRow: 7 },
  { top: "23%", cubeSize: 85, direction: "right", duration: 65, opacity: 0.5, cubesPerRow: 7 },
  { top: "34%", cubeSize: 80, direction: "left", duration: 75, opacity: 0.4, cubesPerRow: 8 },
  { top: "44%", cubeSize: 75, direction: "right", duration: 62, opacity: 0.35, cubesPerRow: 8 },
  { top: "54%", cubeSize: 80, direction: "left", duration: 78, opacity: 0.4, cubesPerRow: 8 },
  { top: "65%", cubeSize: 85, direction: "right", duration: 64, opacity: 0.5, cubesPerRow: 7 },
  { top: "76%", cubeSize: 90, direction: "left", duration: 72, opacity: 0.6, cubesPerRow: 7 },
  { top: "88%", cubeSize: 95, direction: "right", duration: 68, opacity: 0.65, cubesPerRow: 6 },
];

function SingleCube({ size, rotateDelay, photoIndex }: { size: number; rotateDelay: number; photoIndex: number }) {
  const halfSize = size / 2;
  const startPhotos = [
    photoIndex % 16,
    (photoIndex + 3) % 16,
    (photoIndex + 6) % 16,
    (photoIndex + 9) % 16,
    (photoIndex + 12) % 16,
    (photoIndex + 15) % 16,
  ];
  
  return (
    <div 
      className="flex-shrink-0 mx-2"
      style={{
        perspective: "600px",
      }}
    >
      <div 
        className="relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: "preserve-3d",
          animation: `cubeRotate 35s infinite linear`,
          animationDelay: `${rotateDelay}s`,
        }}
      >
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[0]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[1]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[2]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[3]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[4]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)`, backfaceVisibility: "hidden" }}
        >
          <img src={photos[startPhotos[5]]} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ config, rowIndex }: { config: RowConfig; rowIndex: number }) {
  const cubes = Array.from({ length: config.cubesPerRow }, (_, i) => i);
  
  return (
    <div 
      className="absolute left-0 right-0 flex"
      style={{
        top: config.top,
        opacity: config.opacity,
      }}
    >
      <div 
        className="flex"
        style={{
          animation: `marquee${config.direction === "right" ? "Right" : "Left"} ${config.duration}s linear infinite`,
        }}
      >
        {cubes.map((i) => (
          <SingleCube 
            key={`a-${i}`} 
            size={config.cubeSize} 
            rotateDelay={-i * 3 - rowIndex * 2}
            photoIndex={i + rowIndex}
          />
        ))}
        {cubes.map((i) => (
          <SingleCube 
            key={`b-${i}`} 
            size={config.cubeSize} 
            rotateDelay={-i * 3 - rowIndex * 2 - 10}
            photoIndex={i + rowIndex + 3}
          />
        ))}
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
        {rowConfigs.slice(0, 4).map((config, i) => (
          <div 
            key={i}
            className="absolute left-0 right-0 flex gap-4 px-4"
            style={{ top: config.top, opacity: config.opacity * 0.5 }}
          >
            {Array.from({ length: 4 }, (_, j) => (
              <div 
                key={j}
                className="rounded-xl overflow-hidden flex-shrink-0"
                style={{
                  width: `${config.cubeSize}px`,
                  height: `${config.cubeSize}px`,
                  backgroundImage: `url(${photos[(i + j) % 6]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {rowConfigs.map((config, i) => (
        <MarqueeRow key={i} config={config} rowIndex={i} />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background/90" />

      <style>{`
        @keyframes cubeRotate {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          25% { transform: rotateX(15deg) rotateY(90deg); }
          50% { transform: rotateX(-15deg) rotateY(180deg); }
          75% { transform: rotateX(15deg) rotateY(270deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
