import { AIRPORTS } from "../data/airportTemplates.js";

export const CAMPAIGN_KEY = "airport_ops_campaign_v1";

export function loadCampaign() {
  try {
    const raw = localStorage.getItem(CAMPAIGN_KEY);
    if (!raw) return { stars: { "earth-regional": 0 } };
    const parsed = JSON.parse(raw);
    return { stars: { "earth-regional": 0, ...(parsed.stars || {}) } };
  } catch {
    return { stars: { "earth-regional": 0 } };
  }
}

export function saveAirportResult(airportId, stars) {
  const current = loadCampaign();
  const next = {
    ...current,
    stars: {
      ...current.stars,
      [airportId]: Math.max(current.stars?.[airportId] || 0, stars),
    },
  };
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(next));
  return next;
}

export function isAirportUnlocked(airportId, campaign = loadCampaign()) {
  const index = AIRPORTS.findIndex((a) => a.id === airportId);
  if (index <= 0) return true;
  const previous = AIRPORTS[index - 1];
  return (campaign.stars?.[previous.id] || 0) >= 2;
}
