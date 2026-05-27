import { doctoraliaAdapter } from "./adapters/doctoralia";
import { clinicaAdapters, getDeepLinks } from "./adapters/clinicas-directas";
import type { ScraperAdapter, ScraperQuery, ScrapedSlot, AdapterResult } from "./types";

const ALL_ADAPTERS: ScraperAdapter[] = [
  doctoraliaAdapter,
  ...clinicaAdapters,
];

export type { ScrapedSlot, ScraperQuery, AdapterResult };
export { getDeepLinks };

export interface ScraperSearchResult {
  slots: ScrapedSlot[];
  adapterResults: AdapterResult[];
  deepLinks: Array<{ clinica: string; url: string }>;
  isLive: boolean; // true if at least one adapter returned real data
}

// Run all adapters in parallel with a timeout per adapter
async function runAdapter(
  adapter: ScraperAdapter,
  query: ScraperQuery,
  timeoutMs = 10000,
): Promise<AdapterResult> {
  const timeoutPromise = new Promise<AdapterResult>(resolve =>
    setTimeout(() => resolve({ adapter: adapter.name, status: "error", slots: [], error: "timeout" }), timeoutMs),
  );

  const runPromise = adapter.searchAvailability(query).then(
    slots => ({
      adapter: adapter.name,
      status: (slots.length > 0 ? "ok" : "ok") as "ok",
      slots,
    }),
    err => ({
      adapter: adapter.name,
      status: "error" as const,
      slots: [] as ScrapedSlot[],
      error: String(err?.message ?? err),
    }),
  );

  const result = await Promise.race([runPromise, timeoutPromise]);

  // Distinguish blocked (no HTML returned = 403) from other errors
  if (result.status === "ok" && result.slots.length === 0) {
    // Could be blocked or genuinely no results; we keep status as ok
  }

  return result;
}

// Search using ALL adapters, return combined results
export async function searchWithScrapers(query: ScraperQuery): Promise<ScraperSearchResult> {
  const deepLinks = getDeepLinks(query);

  // Run all adapters in parallel
  const adapterResults = await Promise.all(
    ALL_ADAPTERS.map(adapter => runAdapter(adapter, query)),
  );

  // Merge all slots and deduplicate by (doctorNombre + fecha + hora)
  const seen = new Set<string>();
  const slots: ScrapedSlot[] = [];

  for (const result of adapterResults) {
    for (const slot of result.slots) {
      const key = `${slot.doctorNombre}-${slot.fecha}-${slot.hora}`;
      if (!seen.has(key)) {
        seen.add(key);
        slots.push(slot);
      }
    }
  }

  // Sort by date then time
  slots.sort((a, b) => {
    const d = a.fecha.localeCompare(b.fecha);
    return d !== 0 ? d : a.hora.localeCompare(b.hora);
  });

  const isLive = adapterResults.some(r => r.status === "ok" && r.slots.length > 0);

  return { slots, adapterResults, deepLinks, isLive };
}

// Check which adapters are currently reachable (useful for health checks)
export async function checkAdapterAvailability(): Promise<Record<string, boolean>> {
  const results = await Promise.all(
    ALL_ADAPTERS.map(async adapter => ({
      name: adapter.name,
      available: await adapter.isAvailable().catch(() => false),
    })),
  );
  return Object.fromEntries(results.map(r => [r.name, r.available]));
}
