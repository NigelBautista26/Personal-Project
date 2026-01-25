import { useEffect, useState } from 'react';

const STOCK_IMAGES = [
  '/stock_images/beautiful_profession_d550635a.jpg',
  '/stock_images/beautiful_profession_4e904727.jpg',
  '/stock_images/beautiful_profession_95e1492a.jpg',
  '/stock_images/beautiful_profession_ffa38dc4.jpg',
  '/stock_images/beautiful_profession_3c074fd2.jpg',
  '/stock_images/beautiful_profession_7eaa7b30.jpg',
  '/stock_images/instagram_travel_pho_81d9c578.jpg',
  '/stock_images/instagram_travel_pho_529df077.jpg',
  '/stock_images/instagram_travel_pho_d24f756e.jpg',
  '/stock_images/instagram_travel_pho_f619aac7.jpg',
  '/stock_images/instagram_travel_pho_97901a84.jpg',
  '/stock_images/instagram_travel_pho_05e6e9a8.jpg',
  '/stock_images/travel_couple_advent_253494c1.jpg',
  '/stock_images/travel_couple_advent_35d2ebfd.jpg',
  '/stock_images/travel_couple_advent_73e0916a.jpg',
  '/stock_images/travel_couple_advent_77edf336.jpg',
  '/stock_images/travel_couple_advent_dc9de7bb.jpg',
  '/stock_images/traveler_at_dubai_sk_f1037b31.jpg',
];

const ROW_COUNT = 8;
const IMAGES_PER_ROW = 6;

interface RowConfig {
  id: number;
  images: string[];
  direction: 'normal' | 'reverse';
  duration: number;
}

function buildRows(): RowConfig[] {
  const pool: string[] = [];
  while (pool.length < IMAGES_PER_ROW * ROW_COUNT) {
    pool.push(...STOCK_IMAGES);
  }

  const rows: RowConfig[] = [];

  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex++) {
    const start = rowIndex * IMAGES_PER_ROW;
    const rowImages = pool.slice(start, start + IMAGES_PER_ROW);
    const direction: 'normal' | 'reverse' = rowIndex % 2 === 0 ? 'normal' : 'reverse';
    const baseDuration = 25;
    const duration = baseDuration + rowIndex * 2;

    rows.push({
      id: rowIndex,
      images: rowImages,
      direction,
      duration,
    });
  }

  return rows;
}

export function PhotoBackground() {
  const [rows] = useState<RowConfig[]>(() => buildRows());

  useEffect(() => {
    rows.forEach(row => {
      row.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    });
  }, [rows]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="flex flex-col h-full">
        {rows.map((row) => (
          <div 
            key={row.id} 
            className="flex-1 overflow-hidden flex items-center"
          >
            <div
              className="flex gap-3 animate-scroll"
              style={{
                animationDuration: `${row.duration}s`,
                animationDirection: row.direction,
              }}
            >
              {[...row.images, ...row.images, ...row.images, ...row.images].map((src, idx) => (
                <div
                  key={`${row.id}-${idx}`}
                  className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl sm:rounded-3xl overflow-hidden opacity-90"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}

export default PhotoBackground;
