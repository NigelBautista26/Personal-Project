import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

const ROW_COUNT = 7;
const TILE_SPACING = 16;
const TILE_SIZE = (width - TILE_SPACING * 4) / 3;
const ROW_HEIGHT = TILE_SIZE + 10;
const IMAGES_PER_ROW = 3;

const STOCK_IMAGES = [
  require("../../assets/stock_images/beautiful_profession_d550635a.jpg"),
  require("../../assets/stock_images/beautiful_profession_4e904727.jpg"),
  require("../../assets/stock_images/beautiful_profession_95e1492a.jpg"),
  require("../../assets/stock_images/beautiful_profession_ffa38dc4.jpg"),
  require("../../assets/stock_images/beautiful_profession_3c074fd2.jpg"),
  require("../../assets/stock_images/beautiful_profession_7eaa7b30.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_81d9c578.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_529df077.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_d24f756e.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_f619aac7.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_97901a84.jpg"),
  require("../../assets/stock_images/instagram_travel_pho_05e6e9a8.jpg"),
  require("../../assets/stock_images/travel_couple_advent_253494c1.jpg"),
  require("../../assets/stock_images/travel_couple_advent_35d2ebfd.jpg"),
  require("../../assets/stock_images/travel_couple_advent_73e0916a.jpg"),
  require("../../assets/stock_images/travel_couple_advent_77edf336.jpg"),
  require("../../assets/stock_images/travel_couple_advent_dc9de7bb.jpg"),
  require("../../assets/stock_images/traveler_at_dubai_sk_f1037b31.jpg"),
];

type RowConfig = {
  id: number;
  images: { key: string; source: any }[];
  direction: 1 | -1;
  speed: number;
  width: number;
};

function buildRows(): RowConfig[] {
  const pool: any[] = [];
  while (pool.length < IMAGES_PER_ROW * ROW_COUNT) {
    pool.push(...STOCK_IMAGES);
  }

  const rowWidth = IMAGES_PER_ROW * (TILE_SIZE + TILE_SPACING);
  const rows: RowConfig[] = [];

  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex++) {
    const start = rowIndex * IMAGES_PER_ROW;
    const rowImages = pool.slice(start, start + IMAGES_PER_ROW);

    const images = rowImages.map((source, idx) => ({
      key: `r${rowIndex}-i${idx}`,
      source,
    }));

    const direction: 1 | -1 = rowIndex % 2 === 0 ? 1 : -1;
    const baseSpeed = 22000;
    const speed = baseSpeed + rowIndex * 900;

    rows.push({
      id: rowIndex,
      images,
      direction,
      speed,
      width: rowWidth,
    });
  }

  return rows;
}

export default function PhotoBackground() {
  const rows = useMemo(buildRows, []);
  const translateXs = useRef(rows.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    STOCK_IMAGES.forEach((img) => {
      const resolved = Image.resolveAssetSource(img);
      if (resolved?.uri) {
        Image.prefetch(resolved.uri);
      }
    });
  }, []);

  useEffect(() => {
    const animations = rows.map((row, index) =>
      Animated.loop(
        Animated.timing(translateXs[index], {
          toValue: -row.width,
          duration: row.speed,
          useNativeDriver: true,
        })
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [rows, translateXs]);

  return (
    <View style={styles.container} pointerEvents="none">
      {rows.map((row, rowIndex) => {
        const isReversed = row.direction === -1;
        return (
          <View key={row.id} style={styles.row}>
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [
                  ...(isReversed ? [{ scaleX: -1 as const }] : []),
                  { translateX: translateXs[rowIndex] },
                ],
              }}
            >
              {[...row.images, ...row.images].map((img, idx) => (
                <View
                  key={`${img.key}-${idx}`}
                  style={
                    isReversed ? { transform: [{ scaleX: -1 }] } : undefined
                  }
                >
                  <Image
                    source={img.source}
                    style={styles.tile}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
        );
      })}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },
  row: {
    height: ROW_HEIGHT,
    overflow: "hidden",
    justifyContent: "center",
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 30,
    marginHorizontal: TILE_SPACING / 2,
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});
