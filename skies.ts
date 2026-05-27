export const SKY_SUNRISE = [
  '#0c0c28', '#14103c', '#201850', '#302060',
  '#502870', '#743068', '#983860', '#be4848',
  '#d86030', '#ea8030', '#f49848', '#f8ae58',
];

export const SKY_DAY = [
  '#1e5090', '#235898', '#2862a4', '#2e6cb0',
  '#3576bc', '#3e82c8', '#4890d4', '#549ede',
  '#62ace6', '#70b8ec', '#80c0f0', '#92c8f4',
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
