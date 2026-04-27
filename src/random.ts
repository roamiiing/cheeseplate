export type Random = () => number;

export function pickWeighted<T>(items: T[], probabilities: number[] | undefined, random: Random) {
  if (!probabilities) return items[Math.floor(random() * items.length)]!;
  const roll = random();
  let acc = 0;
  for (let i = 0; i < items.length; i += 1) {
    acc += probabilities[i] ?? 0;
    if (roll <= acc) return items[i]!;
  }
  return items[items.length - 1]!;
}

export function pick<T>(items: T[], random: Random) {
  return pickWeighted(items, undefined, random);
}
