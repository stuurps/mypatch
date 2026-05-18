export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export type WatchSpecies = {
  species: string;
  hint: string;
  imminent: boolean;
};

export const SEASONAL_WATCH: Record<Season, WatchSpecies[]> = {
  spring: [
    { species: 'Chiffchaff', hint: 'early migrant, listen for the call', imminent: true },
    { species: 'Sand Martin', hint: 'first hirundines of the year', imminent: true },
    { species: 'Swallow', hint: 'first arrivals expected', imminent: true },
    { species: 'Willow Warbler', hint: 'summer visitor arriving', imminent: false },
    { species: 'Wheatear', hint: 'upland migrant passing through', imminent: false },
    { species: 'House Martin', hint: 'arrives a few weeks after Swallow', imminent: false },
    { species: 'Yellow Wagtail', hint: 'bright visitor to wet grassland', imminent: false },
    { species: 'Common Sandpiper', hint: 'passage migrant along waterways', imminent: false },
  ],
  summer: [
    { species: 'Swift', hint: 'aerial screamer, mid-summer peak', imminent: true },
    { species: 'Hobby', hint: 'hunting swallows and dragonflies', imminent: true },
    { species: 'Reed Warbler', hint: 'singing from reedbeds', imminent: false },
    { species: 'Sedge Warbler', hint: 'loud singer in waterside scrub', imminent: false },
    { species: 'Common Tern', hint: 'graceful fisher over open water', imminent: false },
  ],
  autumn: [
    { species: 'Redwing', hint: 'first winter thrushes arriving', imminent: true },
    { species: 'Fieldfare', hint: 'large thrush from Scandinavia', imminent: true },
    { species: 'Woodcock', hint: 'roding at dusk in woodland edges', imminent: false },
    { species: 'Wigeon', hint: 'whistling wildfowl building on water', imminent: false },
    { species: 'Teal', hint: 'small dabbling duck in numbers', imminent: false },
  ],
  winter: [
    { species: 'Siskin', hint: 'gold-streaked finch in alder trees', imminent: true },
    { species: 'Redwing', hint: 'flocking on berried hedgerows', imminent: true },
    { species: 'Bittern', hint: 'visible in hard weather, walks reeds', imminent: false },
    { species: 'Fieldfare', hint: 'large thrush in mixed winter flocks', imminent: false },
    { species: 'Snipe', hint: 'flushed from wet and rushy grassland', imminent: false },
  ],
};

export function currentSeason(): Season {
  const m = new Date().getMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

export function getWatchSpecies(season?: Season): WatchSpecies[] {
  return SEASONAL_WATCH[season ?? currentSeason()];
}
