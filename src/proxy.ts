import { HttpsProxyAgent } from "https-proxy-agent";

export type ProxyEnv = Record<string, string | undefined>;

export function getProxyUrl(env: ProxyEnv = process.env, target = "https://api.telegram.org") {
  const noProxy = env.TG_NO_PROXY ?? env.tg_no_proxy;
  if (matchesNoProxy(noProxy, new URL(target).hostname)) return undefined;
  return env.TG_HTTPS_PROXY ?? env.tg_https_proxy ?? env.TG_HTTP_PROXY ?? env.tg_http_proxy;
}

export function proxyMode(env: ProxyEnv = process.env) {
  const url = getProxyUrl(env);
  if (!url) return "off";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`;
  } catch {
    return "configured";
  }
}

export function baseFetchConfig(env: ProxyEnv = process.env) {
  const proxyUrl = getProxyUrl(env);
  return proxyUrl ? { agent: new HttpsProxyAgent(proxyUrl) } : undefined;
}

function matchesNoProxy(noProxy: string | undefined, hostname: string) {
  if (!noProxy) return false;
  return noProxy
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => entry === "*" || hostname === entry || (entry.startsWith(".") && hostname.endsWith(entry)) || hostname.endsWith(`.${entry}`));
}
