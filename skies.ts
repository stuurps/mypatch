export const SKY_SUNRISE = [
  '#0c0c28', '#14103c', '#201850', '#302060',
  '#502870', '#743068', '#983860', '#be4848',
  '#d86030', '#ea8030', '#f49848', '#f8ae58',
];

export const SKY_DAY = [
  '#0c1624', '#102030', '#162c40', '#1e3a54',
  '#264a6a', '#305c82', '#3a6e9a', '#4480b0',
  '#5092c4', '#5ca4d8', '#68b4e8', '#74c0f0',
];

export const SKY_SUNSET = [
  '#0e0a1a', '#1a1030', '#2e1840', '#4a2248',
  '#6a2c40', '#8e3830', '#b85020', '#d46828',
  '#e88030', '#f09840', '#f8ae4a', '#e89840',
];

export const SKY_NIGHT = [
  '#04040c', '#060610', '#080814', '#0a0a18',
  '#0c0c1c', '#0e0e20', '#100e22', '#120e24',
  '#140e26', '#160e28', '#14102a', '#12102c',
];

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export function timeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour <= 8) return 'dawn';
  if (hour >= 9 && hour <= 16) return 'day';
  if (hour >= 17 && hour <= 20) return 'dusk';
  return 'night';
}

export function skyForSighting(): string[] {
  return {
    dawn: SKY_SUNRISE,
    day: SKY_DAY,
    dusk: SKY_SUNSET,
    night: SKY_NIGHT,
  }[timeOfDayFromHour(new Date().getHours())];
}
