import { useEffect, useState } from 'react';

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300',
  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=300',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300',
  'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=300',
  'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=300',
  'https://images.unsplash.com/photo-1533856493584-0c6ca8ca9ce3?w=300',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300',
];

const ROW_COUNT = 7;
const IMAGES_PER_ROW = 4;

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
              {[...row.images, ...row.images, ...row.images].map((src, idx) => (
                <div
                  key={`${row.id}-${idx}`}
                  className="flex-shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden opacity-90"
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
