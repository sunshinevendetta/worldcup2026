const TEAM_FLAG_CODES: Record<string, string> = {
  algeria: "DZ",
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgium: "BE",
  "bosnia-herzegovina": "BA",
  brazil: "BR",
  canada: "CA",
  "cape-verde": "CV",
  colombia: "CO",
  croatia: "HR",
  curacao: "CW",
  czechia: "CZ",
  "dr-congo": "CD",
  ecuador: "EC",
  egypt: "EG",
  england: "GB-ENG",
  france: "FR",
  germany: "DE",
  ghana: "GH",
  haiti: "HT",
  iran: "IR",
  iraq: "IQ",
  "ivory-coast": "CI",
  japan: "JP",
  jordan: "JO",
  mexico: "MX",
  morocco: "MA",
  netherlands: "NL",
  "new-zealand": "NZ",
  norway: "NO",
  panama: "PA",
  paraguay: "PY",
  portugal: "PT",
  qatar: "QA",
  "saudi-arabia": "SA",
  scotland: "GB-SCT",
  senegal: "SN",
  "south-africa": "ZA",
  "south-korea": "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  tunisia: "TN",
  turkey: "TR",
  "united-states": "US",
  uruguay: "UY",
  uzbekistan: "UZ",
};

export function getTeamFlagEmoji(teamSlug: string) {
  const flagCode = TEAM_FLAG_CODES[teamSlug];
  if (!flagCode) return undefined;

  if (flagCode === "GB-ENG") return subdivisionFlagEmoji("gbeng");
  if (flagCode === "GB-SCT") return subdivisionFlagEmoji("gbsct");

  return countryFlagEmoji(flagCode);
}

export function getTeamShareLabel(teamName: string, teamSlug?: string) {
  const teamFlag = teamSlug ? getTeamFlagEmoji(teamSlug) : undefined;
  return teamFlag ? `${teamFlag} ${teamName}` : teamName;
}

export function getSupportShareText(teamName: string, teamSlug?: string) {
  const teamLabel = getTeamShareLabel(teamName, teamSlug);

  return `I'm supporting ${teamLabel} with 0.001 ETH in the World Cup.\n\nThe most-supported team gets all the ETH from claimed support flags.\n\nBack ${teamLabel}:`;
}

function countryFlagEmoji(countryCode: string) {
  return Array.from(countryCode.toUpperCase(), (char) =>
    String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65),
  ).join("");
}

function subdivisionFlagEmoji(tag: string) {
  const tagCharacters = Array.from(tag, (char) => String.fromCodePoint(0xe0000 + char.charCodeAt(0))).join("");
  return `\u{1F3F4}${tagCharacters}\u{E007F}`;
}

export function getAbsoluteAppUrl(path = "") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}${path}`;
}
