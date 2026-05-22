export const SPECIES: string[] = [
  // Wildfowl
  'Mute Swan', 'Bewick\'s Swan', 'Whooper Swan',
  'Pink-footed Goose', 'White-fronted Goose', 'Greylag Goose', 'Canada Goose',
  'Barnacle Goose', 'Brent Goose', 'Egyptian Goose',
  'Shelduck', 'Mandarin Duck', 'Wigeon', 'Gadwall', 'Teal', 'Garganey',
  'Mallard', 'Pintail', 'Shoveler', 'Pochard', 'Scaup', 'Tufted Duck',
  'Common Scoter', 'Goldeneye', 'Smew', 'Goosander', 'Red-breasted Merganser',

  // Gamebirds
  'Red-legged Partridge', 'Grey Partridge', 'Pheasant', 'Red Grouse',

  // Grebes
  'Little Grebe', 'Great Crested Grebe',

  // Cormorant
  'Cormorant',

  // Herons & Egrets
  'Bittern', 'Spoonbill', 'Great White Egret', 'Grey Heron', 'Little Egret',

  // Raptors
  'White-tailed Eagle', 'Marsh Harrier', 'Hen Harrier', 'Goshawk',
  'Sparrowhawk', 'Buzzard', 'Osprey', 'Red Kite',
  'Kestrel', 'Merlin', 'Hobby', 'Peregrine',

  // Rails & Crakes
  'Water Rail', 'Spotted Crake', 'Moorhen', 'Coot', 'Common Crane',

  // Waders
  'Avocet', 'Oystercatcher',
  'Ringed Plover', 'Little Ringed Plover', 'Golden Plover', 'Grey Plover', 'Lapwing',
  'Knot', 'Sanderling', 'Little Stint', 'Curlew Sandpiper', 'Dunlin', 'Ruff',
  'Jack Snipe', 'Snipe', 'Woodcock',
  'Black-tailed Godwit', 'Bar-tailed Godwit', 'Whimbrel', 'Curlew',
  'Spotted Redshank', 'Redshank', 'Greenshank',
  'Green Sandpiper', 'Wood Sandpiper', 'Common Sandpiper', 'Turnstone',

  // Gulls
  'Little Gull', 'Black-headed Gull', 'Mediterranean Gull', 'Common Gull',
  'Yellow-legged Gull', 'Herring Gull', 'Lesser Black-backed Gull', 'Great Black-backed Gull',

  // Terns
  'Sandwich Tern', 'Common Tern', 'Arctic Tern', 'Little Tern', 'Black Tern',

  // Pigeons & Doves
  'Feral Pigeon', 'Stock Dove', 'Wood Pigeon', 'Collared Dove', 'Turtle Dove',

  // Cuckoo
  'Cuckoo',

  // Owls
  'Barn Owl', 'Little Owl', 'Tawny Owl', 'Long-eared Owl', 'Short-eared Owl',

  // Nightjar
  'Nightjar',

  // Swift
  'Swift',

  // Kingfisher & Hoopoe
  'Kingfisher', 'Hoopoe',

  // Woodpeckers
  'Great Spotted Woodpecker', 'Lesser Spotted Woodpecker', 'Green Woodpecker',

  // Larks
  'Woodlark', 'Skylark',

  // Swallows & Martins
  'Sand Martin', 'Swallow', 'House Martin',

  // Pipits & Wagtails
  'Tree Pipit', 'Meadow Pipit', 'Rock Pipit', 'Water Pipit',
  'Yellow Wagtail', 'Grey Wagtail', 'Pied Wagtail',

  // Waxwing · Dipper · Wren · Starling
  'Waxwing', 'Dipper', 'Wren', 'Starling',

  // Dunnock & Sparrows
  'Dunnock', 'House Sparrow', 'Tree Sparrow',

  // Chats & Thrushes
  'Robin', 'Nightingale', 'Black Redstart', 'Common Redstart',
  'Whinchat', 'Stonechat', 'Wheatear', 'Ring Ouzel',
  'Blackbird', 'Fieldfare', 'Song Thrush', 'Redwing', 'Mistle Thrush',

  // Flycatchers
  'Spotted Flycatcher', 'Pied Flycatcher',

  // Warblers
  'Cetti\'s Warbler', 'Grasshopper Warbler', 'Sedge Warbler', 'Marsh Warbler', 'Reed Warbler',
  'Dartford Warbler', 'Yellow-browed Warbler',
  'Lesser Whitethroat', 'Whitethroat', 'Garden Warbler', 'Blackcap',
  'Wood Warbler', 'Chiffchaff', 'Willow Warbler',

  // Crests
  'Goldcrest', 'Firecrest',

  // Tits & Allies
  'Long-tailed Tit', 'Coal Tit', 'Marsh Tit', 'Willow Tit', 'Blue Tit', 'Great Tit',
  'Nuthatch', 'Treecreeper', 'Bearded Tit',

  // Corvids
  'Jay', 'Magpie', 'Jackdaw', 'Rook', 'Carrion Crow', 'Raven',

  // Finches
  'Chaffinch', 'Brambling', 'Greenfinch', 'Goldfinch', 'Siskin',
  'Twite', 'Lesser Redpoll', 'Common Crossbill', 'Bullfinch', 'Hawfinch',

  // Buntings
  'Lapland Bunting', 'Snow Bunting', 'Yellowhammer', 'Corn Bunting', 'Reed Bunting',
];

function matchScore(name: string, query: string): number {
  const lower = name.toLowerCase();
  const q = query.toLowerCase();
  if (lower.startsWith(q)) return 3;
  if (lower.split(' ').some(w => w.startsWith(q))) return 2;
  if (lower.includes(q)) return 1;
  return 0;
}

export function rankSpecies(
  query: string,
  sessionSet: ReadonlySet<string>,
  loggedSet: ReadonlySet<string>,
  phenologySet: ReadonlySet<string>,
  limit = 8,
): string[] {
  const results: { species: string; score: number }[] = [];
  for (const s of SPECIES) {
    const ms = matchScore(s, query);
    if (ms === 0) continue;
    let priority = 0;
    if (sessionSet.has(s)) priority = 30;
    else if (loggedSet.has(s)) priority = 20;
    else if (phenologySet.has(s)) priority = 10;
    results.push({ species: s, score: ms + priority });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(x => x.species);
}
