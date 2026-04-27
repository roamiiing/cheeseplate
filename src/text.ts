export function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function commandArgs(text: string) {
  return text.replace(/^\/[^\s@]+(?:@\S+)?\s*/, "").trim();
}

export function splitChoices(input: string) {
  return input
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function extractHashTags(text = "") {
  return [...text.matchAll(/#[\wа-яё]+/giu)].map((match) => match[0].slice(1).toLowerCase());
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
