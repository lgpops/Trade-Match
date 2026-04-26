import type { TradeKey } from "./trades";
import type { CollarType, Ethnicity } from "./demographics";

export type Gender = "male" | "female";

export type SeedProfile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  collarType: CollarType;
  ethnicity: Ethnicity;
  heightCm: number;
  trade: TradeKey;
  yearsOnTools: number;
  suburb: string;
  distanceKm: number;
  bio: string;
  rig: string;
  weekendMove: string;
  brewOfChoice: string;
  photo: any;
};

export const SEED_PROFILES: SeedProfile[] = [
  {
    id: "p1",
    name: "Jack",
    age: 31,
    gender: "male",
    collarType: "blue",
    ethnicity: "white",
    heightCm: 183,
    trade: "carpenter",
    yearsOnTools: 12,
    suburb: "Marrickville",
    distanceKm: 4,
    bio: "Custom decks and pergolas by day, smoking brisket on weekends. Looking for someone who's keen on weekend road trips and doesn't mind sawdust on the couch.",
    rig: "HiLux dual cab, cream",
    weekendMove: "Surf at North Narra",
    brewOfChoice: "Cold VB after knock-off",
    photo: require("../assets/images/profile1.png"),
  },
  {
    id: "p2",
    name: "Mia",
    age: 28,
    gender: "female",
    collarType: "blue",
    ethnicity: "asian",
    heightCm: 168,
    trade: "electrician",
    yearsOnTools: 7,
    suburb: "Brunswick",
    distanceKm: 6,
    bio: "Domestic and commercial sparky. Run my own small crew. I know my way around a dance floor as well as a switchboard. Bonus points if you cook.",
    rig: "White Transit, kitted out",
    weekendMove: "Live music in Fitzroy",
    brewOfChoice: "Espresso martini",
    photo: require("../assets/images/profile2.png"),
  },
  {
    id: "p3",
    name: "Tommo",
    age: 34,
    gender: "male",
    collarType: "blue",
    ethnicity: "pacificIslander",
    heightCm: 188,
    trade: "plumber",
    yearsOnTools: 15,
    suburb: "Bondi",
    distanceKm: 9,
    bio: "Maintenance plumber, on call most weeks but I make weekends count. Fishing tinny on Pittwater. Two kelpies. Looking for the real deal.",
    rig: "Iveco van, blue",
    weekendMove: "Sunrise paddle out",
    brewOfChoice: "Stone & Wood pale",
    photo: require("../assets/images/profile3.png"),
  },
  {
    id: "p4",
    name: "Sienna",
    age: 27,
    gender: "female",
    collarType: "blue",
    ethnicity: "latino",
    heightCm: 171,
    trade: "painter",
    yearsOnTools: 6,
    suburb: "West End",
    distanceKm: 3,
    bio: "Heritage interiors and a soft spot for a moody charcoal feature wall. Pottery class on Tuesdays. Will judge your colour palette but kindly.",
    rig: "Old Mazda ute, charcoal",
    weekendMove: "Farmers market then a long lunch",
    brewOfChoice: "Natural wine, anything orange",
    photo: require("../assets/images/profile4.png"),
  },
  {
    id: "p5",
    name: "Dave",
    age: 30,
    gender: "male",
    collarType: "blue",
    ethnicity: "mixed",
    heightCm: 176,
    trade: "landscaper",
    yearsOnTools: 9,
    suburb: "Newtown",
    distanceKm: 5,
    bio: "Native gardens and dry stone walls. Outside whenever I can be. Camping in the Blue Mountains most long weekends. Bring your own swag.",
    rig: "Tipper truck and a trailer full of mulch",
    weekendMove: "Trail run with the dog",
    brewOfChoice: "Kombucha, controversial I know",
    photo: require("../assets/images/profile5.png"),
  },
  {
    id: "p6",
    name: "Priya",
    age: 32,
    gender: "female",
    collarType: "white",
    ethnicity: "southAsian",
    heightCm: 165,
    trade: "consultant",
    yearsOnTools: 9,
    suburb: "Surry Hills",
    distanceKm: 7,
    bio: "Construction project consultant who swaps site meetings for rooftop dinners. Equal parts spreadsheets, site boots and passport stamps.",
    rig: "Company EV, always at 80%",
    weekendMove: "Gallery hop then a wine bar",
    brewOfChoice: "Flat white, extra hot",
    photo: require("../assets/images/profile2.png"),
  },
  {
    id: "p7",
    name: "Ethan",
    age: 36,
    gender: "male",
    collarType: "white",
    ethnicity: "black",
    heightCm: 191,
    trade: "engineer",
    yearsOnTools: 13,
    suburb: "Southbank",
    distanceKm: 8,
    bio: "Structural engineer, decent cook, terrible golfer. I like people who can talk shop for five minutes then switch off for the rest of the night.",
    rig: "Road bike and a very tidy sedan",
    weekendMove: "Long lunch after a morning ride",
    brewOfChoice: "Single origin batch brew",
    photo: require("../assets/images/profile3.png"),
  },
  {
    id: "p8",
    name: "Grace",
    age: 29,
    gender: "female",
    collarType: "white",
    ethnicity: "white",
    heightCm: 174,
    trade: "designer",
    yearsOnTools: 8,
    suburb: "Paddington",
    distanceKm: 5,
    bio: "Interior designer with a soft spot for heritage homes and people who mean what they say. Weekends are markets, swims and dinner with mates.",
    rig: "Mini Cooper with too many sample books",
    weekendMove: "Ocean pool before breakfast",
    brewOfChoice: "Piccolo",
    photo: require("../assets/images/profile4.png"),
  },
];
