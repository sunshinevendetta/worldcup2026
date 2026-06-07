export function getSupportShareText(teamName: string) {
  return `I'm supporting ${teamName} in the World Cup.\n\nThe most-supported team gets all the ETH from claimed support flags.\n\nBack ${teamName}:`;
}

export function getAbsoluteAppUrl(path = "") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}${path}`;
}
