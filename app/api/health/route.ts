import { NextResponse } from "next/server";
import { getGotenbergEndpoints } from "@/lib/convert/gotenbergClient";

export const runtime = "edge";

export async function GET() {
  const endpoints = getGotenbergEndpoints();

  const servers = await Promise.all(
    endpoints.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${url}/health`, { method: "GET", signal: controller.signal });
        clearTimeout(timeoutId);
        return {
          url,
          connected: res.ok,
          status: res.status,
        };
      } catch (err: any) {
        return {
          url,
          connected: false,
          error: err.message || "Connection failed",
        };
      }
    })
  );

  const hasAnyHealthy = servers.some((s) => s.connected);

  return NextResponse.json({
    status: hasAnyHealthy ? "ok" : "degraded",
    app: "ncpdf",
    version: "1.0.0",
    gotenberg: {
      servers,
      activeCount: servers.filter((s) => s.connected).length,
      totalConfigured: servers.length,
      primaryUrl: endpoints[0] || null,
      fallbackUrl: endpoints[1] || null,
    },
    timestamp: new Date().toISOString(),
  });
}
