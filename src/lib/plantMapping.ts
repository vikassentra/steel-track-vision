export const PLANT_ABBREV: Record<string, string> = {
  "All": "All",
  "BOF": "Basic Oxygen Furnace (BOF)",
  "SP": "Sinter plant",
  "BF": "Blast Furnace",
  "RM": "Rebar mill",
  "COP": "Coke oven",
  "HT": "Heat treatment",
  "BRT": "BRT",
};

export const PLANT_ABBREVS = ["All", "COP", "SP", "BF", "BOF", "RM", "HT", "BRT"] as const;

export const getPlantFullName = (abbrev: string): string =>
  PLANT_ABBREV[abbrev] ?? abbrev;
