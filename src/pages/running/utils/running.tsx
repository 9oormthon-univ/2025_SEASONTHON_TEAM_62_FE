import type { GraphLink, GraphNode } from '../pathPage';

export function normalizeWaypoints(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];

  if (raw.length > 0 && typeof raw[0] === 'string') {
    return (raw as string[])
      .map((s) => s.split(',').map((v) => parseFloat(String(v).trim())))
      .filter((p) => p.length === 2 && p.every((n) => Number.isFinite(n)))
      .map(([lat, lng]) => [lat, lng]);
  }

  return (raw as any[])
    .map((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) return null;
      const a = pair[0];
      const b = pair[1];
      const lat = typeof a === 'string' ? parseFloat(a) : a;
      const lng = typeof b === 'string' ? parseFloat(b) : b;
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? ([lat, lng] as [number, number])
        : null;
    })
    .filter(Boolean) as [number, number][];
}

export function toNodesAndLinks(waypoints: [number, number][]) {
  const nodes: GraphNode[] = waypoints.map(([lat, lng], i) => ({
    id: i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : `n${i}`,
    lat,
    lng,
  }));
  const links: GraphLink[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({ id: `seg-${i}`, from: nodes[i].id, to: nodes[i + 1].id });
  }
  return { nodes, links };
}

export function etaTextFromMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}시간 ` : ''}${m}분`;
}

export function estimateSteps(km: number) {
  return Math.round(km * 1300);
}
