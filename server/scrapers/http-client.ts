import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// Shared HTTP client that mimics a real browser and supports optional proxy
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
};

function createClient(): AxiosInstance {
  const config: AxiosRequestConfig = {
    timeout: 12000,
    headers: DEFAULT_HEADERS,
    maxRedirects: 5,
  };

  // Support optional HTTP proxy (e.g. residential proxy service)
  // Set SCRAPER_PROXY_URL=http://user:pass@residential-proxy.example.com:8080
  if (process.env.SCRAPER_PROXY_URL) {
    const proxyUrl = new URL(process.env.SCRAPER_PROXY_URL);
    config.proxy = {
      protocol: proxyUrl.protocol.replace(":", ""),
      host: proxyUrl.hostname,
      port: parseInt(proxyUrl.port),
      auth: proxyUrl.username
        ? { username: proxyUrl.username, password: proxyUrl.password }
        : undefined,
    };
  }

  return axios.create(config);
}

export const httpClient = createClient();

// Fetch HTML from a URL, return null if blocked (403/429/CAPTCHA)
export async function fetchHtml(url: string, extraHeaders?: Record<string, string>): Promise<string | null> {
  try {
    const res = await httpClient.get<string>(url, {
      headers: extraHeaders,
      responseType: "text",
    });
    if (res.status === 200) return res.data as string;
    return null;
  } catch (err: any) {
    const status = err?.response?.status;
    // 403 = IP blocked, 429 = rate limited, 503 = Cloudflare challenge
    if ([403, 429, 503].includes(status)) return null;
    throw err;
  }
}

// Small delay to be respectful to target servers
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
