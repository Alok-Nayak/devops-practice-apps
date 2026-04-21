"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const prom_client_1 = __importDefault(require("prom-client"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const APP_NAME = process.env.APP_NAME || "url-shortener-api";
const urlStore = new Map();
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
const httpRequestCounter = new prom_client_1.default.Counter({
    name: "app_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
});
const shortUrlsCreatedCounter = new prom_client_1.default.Counter({
    name: "app_short_urls_created_total",
    help: "Total number of short URLs created"
});
const redirectsCounter = new prom_client_1.default.Counter({
    name: "app_redirects_total",
    help: "Total number of successful redirects"
});
const activeShortUrlsGauge = new prom_client_1.default.Gauge({
    name: "app_active_short_urls",
    help: "Current number of active short URLs"
});
register.registerMetric(httpRequestCounter);
register.registerMetric(shortUrlsCreatedCounter);
register.registerMetric(redirectsCounter);
register.registerMetric(activeShortUrlsGauge);
function updateActiveShortUrlsGauge() {
    activeShortUrlsGauge.set(urlStore.size);
}
app.use((req, res, next) => {
    res.on("finish", () => {
        const route = req.route?.path || req.path || "unknown";
        httpRequestCounter.inc({
            method: req.method,
            route: String(route),
            status_code: String(res.statusCode)
        });
    });
    next();
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: APP_NAME
    });
});
app.get("/ready", (_req, res) => {
    res.status(200).json({
        status: "ready",
        service: APP_NAME
    });
});
app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
app.get("/api", (_req, res) => {
    res.status(200).json({
        name: APP_NAME,
        version: "1.0.0",
        endpoints: {
            web: "/",
            health: "/health",
            ready: "/ready",
            metrics: "/metrics",
            createShortUrl: "POST /api/shorten",
            getAllUrls: "GET /api/urls",
            getUrlStats: "GET /api/urls/:code",
            deleteUrl: "DELETE /api/urls/:code",
            clearAllUrls: "DELETE /api/urls",
            redirect: "GET /:code"
        }
    });
});
app.post("/api/shorten", (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
        return res.status(400).json({
            error: "A valid URL is required"
        });
    }
    try {
        new URL(url);
    }
    catch {
        return res.status(400).json({
            error: "Invalid URL format"
        });
    }
    const shortCode = crypto_1.default.randomBytes(3).toString("hex");
    const record = {
        originalUrl: url,
        shortCode,
        createdAt: new Date().toISOString(),
        clicks: 0
    };
    urlStore.set(shortCode, record);
    shortUrlsCreatedCounter.inc();
    updateActiveShortUrlsGauge();
    return res.status(201).json({
        message: "Short URL created successfully",
        data: {
            originalUrl: record.originalUrl,
            shortCode: record.shortCode,
            shortUrl: `${BASE_URL}/${record.shortCode}`,
            createdAt: record.createdAt,
            clicks: record.clicks
        }
    });
});
app.get("/api/urls", (_req, res) => {
    const urls = Array.from(urlStore.values()).map((record) => ({
        originalUrl: record.originalUrl,
        shortCode: record.shortCode,
        shortUrl: `${BASE_URL}/${record.shortCode}`,
        createdAt: record.createdAt,
        clicks: record.clicks
    }));
    return res.status(200).json({
        total: urls.length,
        data: urls
    });
});
app.get("/api/urls/:code", (req, res) => {
    const code = String(req.params.code);
    const record = urlStore.get(code);
    if (!record) {
        return res.status(404).json({
            error: "Short URL not found"
        });
    }
    return res.status(200).json({
        data: {
            originalUrl: record.originalUrl,
            shortCode: record.shortCode,
            shortUrl: `${BASE_URL}/${record.shortCode}`,
            createdAt: record.createdAt,
            clicks: record.clicks
        }
    });
});
app.delete("/api/urls/:code", (req, res) => {
    const code = String(req.params.code);
    if (!urlStore.has(code)) {
        return res.status(404).json({
            error: "Short URL not found"
        });
    }
    urlStore.delete(code);
    updateActiveShortUrlsGauge();
    return res.status(200).json({
        message: "Short URL deleted successfully",
        deletedCode: code
    });
});
app.delete("/api/urls", (_req, res) => {
    const totalBeforeClear = urlStore.size;
    urlStore.clear();
    updateActiveShortUrlsGauge();
    return res.status(200).json({
        message: "All short URLs cleared successfully",
        clearedCount: totalBeforeClear
    });
});
app.get("/:code", (req, res) => {
    const code = String(req.params.code);
    const record = urlStore.get(code);
    if (!record) {
        return res.status(404).json({
            error: "Short URL not found"
        });
    }
    record.clicks += 1;
    redirectsCounter.inc();
    return res.redirect(record.originalUrl);
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`${APP_NAME} is running on port ${PORT}`);
});
