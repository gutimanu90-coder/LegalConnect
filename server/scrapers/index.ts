import { doctoraliaAdapter } from "./adapters/doctoralia";
import { buildAdapterFromConfig, buildDeepLinks } from "./adapters/clinicas-directas";
import type { ScraperAdapter, ScraperQuery, ScrapedSlot, AdapterResult } from "./types";
import type { ClinicaScraperConfig } from "@shared/schema";

export type { ScrapedSlot, ScraperQuery, AdapterResult };

export interface ScraperSearchResult {
  slots: ScrapedSlot[];
  adapterResults: AdapterResult[];
  deepLinks: Array<{ clinica: string; url: string }>;
  isLive: boolean;
}

// Run a single adapter with a timeout
async function runAdapter(
  adapter: ScraperAdapter,
  query: ScraperQuery,
  timeoutMs = 5000,
): Promise<AdapterResult> {
  const timeout = new Promise<AdapterResult>(resolve =>
    setTimeout(
      () => resolve({ adapter: adapter.name, status: "error", slots: [], error: "timeout" }),
      timeoutMs,
    ),
  );

  const run = adapter.searchAvailability(query).then(
    slots => ({ adapter: adapter.name, status: "ok" as const, slots }),
    err => ({
      adapter: adapter.name,
      status: "error" as const,
      slots: [] as ScrapedSlot[],
      error: String(err?.message ?? err),
    }),
  );

  return Promise.race([run, timeout]);
}

// Search using all adapters (Doctoralia + dynamic clinic configs)
export async function searchWithScrapers(
  query: ScraperQuery,
  configs: ClinicaScraperConfig[] = [],
): Promise<ScraperSearchResult> {
  const enabledConfigs = configs.filter(c => c.habilitada);
  const deepLinks = buildDeepLinks(query, enabledConfigs);

  const adapters: ScraperAdapter[] = [
    doctoraliaAdapter,
    ...enabledConfigs.map(buildAdapterFromConfig),
  ];

  const adapterResults = await Promise.all(adapters.map(a => runAdapter(a, query)));

  // Merge and deduplicate by (doctorNombre + fecha + hora)
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

  slots.sort((a, b) => {
    const d = a.fecha.localeCompare(b.fecha);
    return d !== 0 ? d : a.hora.localeCompare(b.hora);
  });

  const isLive = adapterResults.some(r => r.status === "ok" && r.slots.length > 0);

  return { slots, adapterResults, deepLinks, isLive };
}

// Health check: which adapters are reachable
export async function checkAdapterAvailability(
  configs: ClinicaScraperConfig[] = [],
): Promise<Record<string, boolean>> {
  const allAdapters: ScraperAdapter[] = [
    doctoraliaAdapter,
    ...configs.filter(c => c.habilitada).map(buildAdapterFromConfig),
  ];

  const results = await Promise.all(
    allAdapters.map(async a => ({
      name: a.name,
      available: await a.isAvailable().catch(() => false),
    })),
  );

  return Object.fromEntries(results.map(r => [r.name, r.available]));
}
