export const colors = {
  // Parchment body
  parchment: '#f5efe6',
  parchmentBorder: '#d9cdb8',
  parchmentMid: '#c8b89a',

  // Text
  inkDark: '#3b3025',
  inkMid: '#9e8e72',
  inkLight: '#7a6e58',
  inkFaint: '#c8b89a',

  // Accent — used ONCE per screen on the single most important element
  amber: '#c87d3a',

  // Sky / hero backgrounds
  skyDeepNight: '#0d0b18',
  skyNight: '#1a1208',
  skyForest: '#2d3b2a',

  // Greens (treeline)
  tree1: '#1a3818',
  tree2: '#0f2210',
  tree3: '#0c2209',

  // Ground
  groundWarm: '#b86830',
};

export const type = {
  statLarge: { fontSize: 26, fontWeight: '500' as const, color: colors.inkDark },
  headline: { fontSize: 22, fontWeight: '500' as const, color: colors.inkDark },
  label: { fontSize: 10, color: colors.inkMid, textTransform: 'uppercase' as const, letterSpacing: 1.2 },
  body: { fontSize: 14, color: colors.inkMid, lineHeight: 22 },
  speciesName: { fontSize: 14, fontWeight: '500' as const, color: colors.inkDark },
  meta: { fontSize: 11, color: colors.inkMid },
};

export const radius = {
  card: 12,
  button: 14,
  pill: 20,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Treeline point arrays — normalised x (0–1) + y-offset in px
export const TREE1: [number, number][] = [
  [0, 0], [0.04, 32], [0.10, 54], [0.16, 36], [0.22, 64], [0.28, 46],
  [0.34, 74], [0.40, 52], [0.46, 80], [0.52, 58], [0.58, 82], [0.64, 60],
  [0.70, 72], [0.76, 48], [0.82, 66], [0.88, 40], [0.94, 58], [1, 32], [1, 0],
];

export const TREE2: [number, number][] = [
  [0, 0], [0.06, 22], [0.14, 36], [0.22, 26], [0.30, 40], [0.38, 30],
  [0.46, 42], [0.54, 32], [0.62, 42], [0.70, 30], [0.78, 36], [0.86, 26],
  [0.94, 32], [1, 20], [1, 0],
];
