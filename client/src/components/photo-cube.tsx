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
import photo17 from "@assets/stock_images/travel_couple_advent_253494c1.jpg";
import photo18 from "@assets/stock_images/travel_couple_advent_35d2ebfd.jpg";
import photo19 from "@assets/stock_images/travel_couple_advent_73e0916a.jpg";
import photo20 from "@assets/stock_images/travel_couple_advent_77edf336.jpg";
import photo21 from "@assets/stock_images/travel_couple_advent_dc9de7bb.jpg";
import photo22 from "@assets/stock_images/travel_couple_advent_f837ee33.jpg";
import photo23 from "@assets/stock_images/travel_couple_advent_53423cf7.jpg";
import photo24 from "@assets/stock_images/travel_couple_advent_cc19fcf2.jpg";
import photo25 from "@assets/stock_images/travel_couple_advent_883c6da8.jpg";
import photo26 from "@assets/stock_images/travel_couple_advent_60fdbf93.jpg";
import photo27 from "@assets/stock_images/tourist_couple_posin_257e64ff.jpg";
import photo28 from "@assets/stock_images/happy_traveler_woman_7a3c530d.jpg";
import photo29 from "@assets/stock_images/couple_taking_photo__b70143ec.jpg";
import photo30 from "@assets/stock_images/tourist_woman_at_mac_d7ad2bbc.jpg";
import photo31 from "@assets/stock_images/couple_romantic_phot_0a7ea51e.jpg";
import photo32 from "@assets/stock_images/traveler_at_taj_maha_b4dc6427.jpg";
import photo33 from "@assets/stock_images/woman_tourist_tokyo__f3e944d2.jpg";
import photo34 from "@assets/stock_images/couple_at_colosseum__ceb17ec7.jpg";
import photo35 from "@assets/stock_images/traveler_at_great_wa_4d10a265.jpg";
import photo36 from "@assets/stock_images/tourist_woman_sydney_5c4945aa.jpg";
import photo37 from "@assets/stock_images/couple_at_bali_templ_0c5fd15f.jpg";
import photo38 from "@assets/stock_images/traveler_at_maldives_128502f2.jpg";
import photo39 from "@assets/stock_images/woman_tourist_barcel_d93c215c.jpg";
import photo40 from "@assets/stock_images/couple_at_niagara_fa_1fb9f1e5.jpg";
import photo41 from "@assets/stock_images/traveler_at_dubai_sk_f1037b31.jpg";

const photos = [
  photo1, photo2, photo3, photo4, photo5, photo6,
  photo7, photo8, photo9, photo10, photo11, photo12,
  photo13, photo14, photo15, photo16, photo17, photo18,
  photo19, photo20, photo21, photo22, photo23, photo24,
  photo25, photo26, photo27, photo28, photo29, photo30,
  photo31, photo32, photo33, photo34, photo35, photo36,
  photo37, photo38, photo39, photo40, photo41
];

const TOTAL_PHOTOS = photos.length;

interface RowConfig {
  top: string;
  cubeSize: number;
  direction: "left" | "right";
  duration: number;
  opacity: number;
  cubesPerRow: number;
}

const rowConfigs: RowConfig[] = [
  { top: "-2%", cubeSize: 85, direction: "right", duration: 80, opacity: 0.7, cubesPerRow: 4 },
  { top: "8%", cubeSize: 80, direction: "left", duration: 90, opacity: 0.6, cubesPerRow: 4 },
  { top: "18%", cubeSize: 80, direction: "right", duration: 85, opacity: 0.5, cubesPerRow: 5 },
  { top: "28%", cubeSize: 75, direction: "left", duration: 95, opacity: 0.45, cubesPerRow: 5 },
  { top: "38%", cubeSize: 75, direction: "right", duration: 82, opacity: 0.4, cubesPerRow: 5 },
  { top: "48%", cubeSize: 75, direction: "left", duration: 98, opacity: 0.35, cubesPerRow: 5 },
  { top: "58%", cubeSize: 75, direction: "right", duration: 84, opacity: 0.4, cubesPerRow: 5 },
  { top: "68%", cubeSize: 75, direction: "left", duration: 92, opacity: 0.45, cubesPerRow: 5 },
  { top: "78%", cubeSize: 80, direction: "right", duration: 88, opacity: 0.5, cubesPerRow: 5 },
  { top: "88%", cubeSize: 80, direction: "left", duration: 86, opacity: 0.6, cubesPerRow: 4 },
  { top: "98%", cubeSize: 85, direction: "right", duration: 83, opacity: 0.65, cubesPerRow: 4 },
];

function SingleCube({ size, rotateDelay, photoIndex }: { size: number; rotateDelay: number; photoIndex: number }) {
  const halfSize = size / 2;
  const startPhotos = [
    photoIndex % TOTAL_PHOTOS,
    (photoIndex + 7) % TOTAL_PHOTOS,
    (photoIndex + 14) % TOTAL_PHOTOS,
    (photoIndex + 21) % TOTAL_PHOTOS,
    (photoIndex + 28) % TOTAL_PHOTOS,
    (photoIndex + 35) % TOTAL_PHOTOS,
  ];
  
  return (
    <div 
      className="flex-shrink-0 mx-4"
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
  const isRight = config.direction === "right";
  
  return (
    <div 
      className="absolute flex"
      style={{
        top: config.top,
        opacity: config.opacity,
        left: 0,
        right: 0,
      }}
    >
      <div 
        className="flex animate-marquee"
        style={{
          ["--duration" as string]: `${config.duration}s`,
          ["--direction" as string]: isRight ? "reverse" : "normal",
        }}
      >
        {cubes.map((i) => (
          <SingleCube 
            key={`a-${i}`} 
            size={config.cubeSize} 
            rotateDelay={-i * 4 - rowIndex * 3}
            photoIndex={(i * 3 + rowIndex * 7) % TOTAL_PHOTOS}
          />
        ))}
        {cubes.map((i) => (
          <SingleCube 
            key={`b-${i}`} 
            size={config.cubeSize} 
            rotateDelay={-i * 4 - rowIndex * 3}
            photoIndex={(i * 3 + rowIndex * 7) % TOTAL_PHOTOS}
          />
        ))}
      </div>
    </div>
  );
}

export default function PhotoCube() {
  const [isReduced, setIsReduced] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Preload a few key images, then fade in the whole component
    const imagesToPreload = photos.slice(0, 6);
    let loadedCount = 0;
    
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 3) {
          // Show after just 3 images are ready for faster perceived load
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 3) {
          setIsLoaded(true);
        }
      };
      img.src = src;
    });

    // Fallback: show after 500ms even if images aren't loaded
    const timeout = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  if (isReduced) {
    return (
      <>
        {/* Glass blur placeholder while loading */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
          style={{ opacity: isLoaded ? 0 : 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute inset-0 backdrop-blur-xl bg-background/30" />
        </div>
        
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ease-out"
          style={{ opacity: isLoaded ? 1 : 0 }}
        >
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
      </>
    );
  }

  return (
    <>
      {/* Glass blur placeholder while loading */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
        style={{ opacity: isLoaded ? 0 : 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 backdrop-blur-xl bg-background/30" />
      </div>
      
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ease-out"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
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
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee var(--duration, 60s) linear infinite;
            animation-direction: var(--direction, normal);
          }
        `}</style>
      </div>
    </>
  );
}
