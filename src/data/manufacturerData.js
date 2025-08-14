// data/manufacturerData.js - Centralized manufacturer and game data
export const MANUFACTURER_GAMES = {
  "Games Workshop": [
    "Warhammer 40,000",
    "Warhammer Age of Sigmar",
    "Kill Team",
    "Necromunda",
    "Warcry",
    "Blood Bowl",
    "Warhammer Underworlds",
    "Adeptus Titanicus",
    "Aeronautica Imperialis",
    "Legions Imperialis",
    "Warhammer: The Horus Heresy",
    "Warhammer: The Old World",
    "Middle-earth Strategy Battle Game"
  ],
  "Warlord Games": [
    "Bolt Action",
    "Black Powder",
    "Hail Caesar",
    "Pike & Shotte",
    "Blood Red Skies",
    "Cruel Seas",
    "Victory at Sea",
    "SPQR",
    "Konflikt '47",
    "Judge Dredd",
    "Warlords of Erehwon",
    "Gates of Antares"
  ],
  "Mantic Games": [
    "Kings of War",
    "Firefight",
    "Deadzone",
    "Kings of War: Vanguard",
    "Armada",
    "DreadBall",
    "Dungeon Saga",
    "Star Saga",
    "The Walking Dead: All Out War",
    "Hellboy: The Board Game",
    "Halo: Flashpoint",
    "Project Pandora",
    "Mars Attacks"
  ],
  "Battlefront Miniatures": [
    "Flames of War",
    "Team Yankee",
    "Fate of a Nation"
  ],
  "Corvus Belli": [
    "Infinity",
    "Infinity CodeOne",
    "Aristeia!"
  ],
  "Wyrd Miniatures": [
    "Malifaux",
    "Through the Breach",
    "The Other Side"
  ],
  "CMON Limited": [
    "A Song of Ice and Fire",
    "Zombicide",
    "Blood Rage",
    "Rising Sun",
    "Massive Darkness",
    "Rum & Bones",
    "Arcadia Quest"
  ],
  "Fantasy Flight Games": [
    "Star Wars: Legion",
    "X-Wing Miniatures",
    "Star Wars: Armada",
    "Runewars Miniatures"
  ],
  "Atomic Mass Games": [
    "Marvel: Crisis Protocol",
    "Star Wars: Shatterpoint",
    "Star Wars: Legion"
  ],
  "Catalyst Game Labs": [
    "BattleTech",
    "Alpha Strike"
  ],
  "Perry Miniatures": [
    "American Civil War",
    "Napoleonic Wars",
    "Medieval",
    "Wars of the Roses",
    "Franco-Prussian War",
    "Sudan Campaign",
    "Zulu War"
  ],
  "Steamforged Games": [
    "Warmachine",
    "Guild Ball",
    "Godtear",
    "Resident Evil",
    "Dark Souls",
    "Bardsung"
  ],
  "Victrix Limited": [
    "Ancient Greeks",
    "Ancient Romans",
    "Napoleonic Wars",
    "World War One",
    "World War Two"
  ],
  "Wargames Atlantic": [
    "Death Fields",
    "Classic Fantasy",
    "The Damned",
    "Grognards",
    "Bulldogs"
  ],
  "North Star Military Figures": [
    "Stargrave",
    "Frostgrave",
    "Rangers of Shadow Deep",
    "Ghost Archipelago",
    "Silver Bayonet"
  ],
  "Modiphius Entertainment": [
    "Fallout: Wasteland Warfare",
    "The Elder Scrolls: Call to Arms",
    "Star Trek Adventures",
    "Mutant Chronicles"
  ],
  "Osprey Publishing": [
    "Frostgrave",
    "Stargrave",
    "Gaslands",
    "A Billion Suns",
    "Oathmark"
  ],
  "Para Bellum Wargames": [
    "Conquest: The Last Argument of Kings"
  ],
  "Wargames Foundry": [
    "Ancient & Medieval",
    "Renaissance",
    "English Civil War",
    "Seven Years War",
    "American War of Independence",
    "Napoleonic Wars",
    "American Civil War",
    "Colonial Wars",
    "World War One",
    "World War Two",
    "Darkest Africa",
    "Wild West"
  ],
  "The Plastic Soldier Company": [
    "Quartermaster General",
    "World War Two 15mm",
    "World War Two 1/72"
  ],
  "Gripping Beast": [
    "SAGA",
    "Dark Ages",
    "Vikings",
    "Crusades"
  ],
  "Firelock Games": [
    "Blood & Plunder",
    "Oak & Iron"
  ],
  "Bad Squiddo Games": [
    "7TV",
    "Burrows & Badgers",
    "Historical Figures"
  ],
  "Footsore Miniatures": [
    "SPQR",
    "SAGA",
    "Mortal Gods"
  ],
  "Crusader Miniatures": [
    "World War Two",
    "Ancient & Medieval",
    "Modern Conflicts"
  ],
  "Old Glory Miniatures": [
    "American Civil War",
    "Napoleonic Wars",
    "Ancient Warfare"
  ],
  "Front Rank Figures": [
    "Seven Years War",
    "Napoleonic Wars",
    "American War of Independence"
  ],
  "Steel Fist Miniatures": [
    "Medieval",
    "Ancient Romans",
    "Vikings"
  ],
  "Eureka Miniatures": [
    "World War One",
    "Pirates",
    "Victorian Sci-Fi"
  ],
  "Essex Miniatures": [
    "Ancient & Medieval",
    "Renaissance",
    "English Civil War"
  ],
  "Artizan Designs": [
    "World War Two",
    "Pulp Adventures",
    "Wild West"
  ],
  "Empress Miniatures": [
    "Modern Warfare",
    "Vietnam War",
    "Cold War"
  ],
  "Pendraken Miniatures": [
    "10mm Historical",
    "Fantasy",
    "Sci-Fi"
  ],
  "Baccus 6mm": [
    "6mm Historical",
    "Napoleonic Wars",
    "Ancient Warfare"
  ],
  "The Assault Group": [
    "Ancient & Medieval",
    "Dark Ages",
    "Biblical"
  ],
  "Claymore Castings": [
    "World War One",
    "Inter-War Period",
    "Back of Beyond"
  ],
  "1st Corps": [
    "Ancient & Medieval",
    "Renaissance",
    "Colonial Wars"
  ],
  "Dixon Miniatures": [
    "American Civil War",
    "Wild West",
    "Pirates"
  ],
  "Xyston Miniatures": [
    "15mm Ancients",
    "Classical Period",
    "Hellenistic"
  ],
  "Aventine Miniatures": [
    "28mm Ancients",
    "Republican Romans",
    "Gallic Wars"
  ],
  "Forged in Battle": [
    "15mm World War Two",
    "Team Yankee",
    "Modern Warfare"
  ]
};

// Top 3 most popular manufacturers for radio buttons
export const TOP_MANUFACTURERS = ["Games Workshop", "Warlord Games", "Mantic Games"];

// All other manufacturers for dropdown (sorted alphabetically)
export const OTHER_MANUFACTURERS = Object.keys(MANUFACTURER_GAMES)
  .filter(manufacturer => !TOP_MANUFACTURERS.includes(manufacturer))
  .sort();

// Utility functions
export const getGamesForManufacturer = (manufacturer) => {
  return MANUFACTURER_GAMES[manufacturer] || [];
};

export const getAllManufacturers = () => {
  return Object.keys(MANUFACTURER_GAMES).sort();
};

export const isTopManufacturer = (manufacturer) => {
  return TOP_MANUFACTURERS.includes(manufacturer);
};