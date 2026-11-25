var DEFAULT_DOMAIN = "https://cobephim.wiki";
var BASE_URL = DEFAULT_DOMAIN;
var API_ORIGIN = "https://egluy2hhb21vaw5ndw9pbmhl.darkbytes.xyz";
var HUB_URL = "https://cobelink.xyz";
var IMG_CDN_FALLBACK = "https://zcdn.darkbytes.xyz";
var IS_AUTO_DOMAIN = true;
var USER_CUSTOM_DOMAIN = false;

var LS_DOMAIN_KEY = "cobephim_live_domain";
var LS_API_KEY = "cobephim_api_origin";
var LS_TS_KEY = "cobephim_domain_ts";
var DOMAIN_TTL_MS = 12 * 3600 * 1000;

function trimText(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/^\s+|\s+$/g, "");
}

function cleanOrigin(url) {
    var s = trimText(url).replace(/\/+$/, "");
    if (!s) return "";
    if (s.indexOf("http://") !== 0 && s.indexOf("https://") !== 0) {
        s = "https://" + s;
    }
    var m = s.match(/^(https?:\/\/[^\/?#]+)/i);
    return m ? m[1].toLowerCase() : "";
}

try {
    if (typeof DOMAIN !== "undefined" && DOMAIN) {
        var customDom = cleanOrigin(DOMAIN);
        if (customDom) {
            BASE_URL = customDom;
            USER_CUSTOM_DOMAIN = (customDom !== DEFAULT_DOMAIN);
        }
    }
} catch (e) {}

try {
    if (typeof AUTO_DOMAIN !== "undefined" && AUTO_DOMAIN !== null && AUTO_DOMAIN !== "") {
        IS_AUTO_DOMAIN = String(AUTO_DOMAIN) === "true";
    }
} catch (e) {}

try {
    if (typeof DOMAIN_HUB !== "undefined" && DOMAIN_HUB) {
        var customHub = cleanOrigin(DOMAIN_HUB);
        if (customHub) {
            HUB_URL = customHub;
        }
    }
} catch (e) {}

function readLS(key) {
    try {
        if (typeof localStorage === "undefined") return "";
        return trimText(localStorage.getItem(key));
    } catch (e) {
        return "";
    }
}

function writeLS(key, val) {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(key, String(val));
    } catch (e) {}
}

if (IS_AUTO_DOMAIN) {
    if (!USER_CUSTOM_DOMAIN) {
        var savedDom = cleanOrigin(readLS(LS_DOMAIN_KEY));
        if (savedDom) BASE_URL = savedDom;
    }
    var savedApi = cleanOrigin(readLS(LS_API_KEY));
    if (savedApi) API_ORIGIN = savedApi;
}

function getHeaders(referer) {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Referer": referer || (BASE_URL + "/")
    };
}

function normalizeUrl(url) {
    if (!url) return BASE_URL;
    var s = trimText(url);
    if (s.indexOf("//") === 0) {
        s = "https:" + s;
    }
    if (s.indexOf("http://") !== 0 && s.indexOf("https://") !== 0) {
        if (s.charAt(0) !== "/") s = "/" + s;
        s = BASE_URL + s;
    } else {
        s = s.replace(/^https?:\/\/[^\/]+/i, BASE_URL);
    }
    if (s.length > BASE_URL.length + 1 && s.charAt(s.length - 1) === "/") {
        s = s.slice(0, -1);
    }
    return s;
}

function extractMovieSlug(url) {
    var s = trimText(url).replace(/[?#].*$/, "").replace(/\/+$/, "");
    var m = s.match(/\/(?:phim|xem-phim)\/([^\/]+)/i);
    if (m && m[1]) return m[1];
    var parts = s.split("/");
    return parts.length ? parts[parts.length - 1] : "";
}

function fixCover(url) {
    var s = trimText(url);
    if (!s) return "";
    if (s.indexOf("//") === 0) {
        s = "https:" + s;
    } else if (s.indexOf("/storage/") === 0) {
        s = IMG_CDN_FALLBACK + s;
    } else if (s.charAt(0) === "/") {
        s = BASE_URL + s;
    }
    s = s.replace(/^https?:\/\/icdn\.darkbytes\.xyz\b/i, "https://img.rophimm.vip");
    return s;
}

function isDomainTtlExpired() {
    var ts = parseInt(readLS(LS_TS_KEY) || "0", 10) || 0;
    if (!ts) return true;
    return (new Date().getTime() - ts) >= DOMAIN_TTL_MS;
}

function discoverApiFromSite(siteOrigin) {
    var homeRes = fetch(siteOrigin + "/", {
        headers: getHeaders(siteOrigin + "/"),
        timeout: 15000
    });
    if (!homeRes || !homeRes.ok) return "";
    var html = homeRes.text() || "";
    var m = html.match(/\/_next\/static\/chunks\/app\/layout-[a-zA-Z0-9_-]+\.js/);
    if (!m) {
        m = html.match(/\/_next\/static\/chunks\/app\/\(phim\)\/layout-[a-zA-Z0-9_-]+\.js/);
    }
    if (!m) return "";

    var jsRes = fetch(siteOrigin + m[0], {
        headers: getHeaders(siteOrigin + "/"),
        timeout: 15000
    });
    if (!jsRes || !jsRes.ok) return "";
    var js = jsRes.text() || "";

    // Match the site's API origin function next to "/api/v1"
    var apiM = js.match(/return"(https:\/\/[a-zA-Z0-9.-]+)"\.replace[\s\S]{0,120}"\/api\/v1"/);
    if (apiM && apiM[1]) {
        return cleanOrigin(apiM[1]);
    }
    var dbMatches = js.match(/https:\/\/[a-zA-Z0-9.-]+\.darkbytes\.xyz/g);
    if (dbMatches && dbMatches.length) {
        var i;
        for (i = 0; i < dbMatches.length; i++) {
            if (dbMatches[i].indexOf("zcdn.") === -1 && dbMatches[i].indexOf("icdn.") === -1) {
                return cleanOrigin(dbMatches[i]);
            }
        }
    }
    return "";
}

function resolveDomainFromHub(force) {
    if (!force && !isDomainTtlExpired()) {
        return { ok: true, cached: true, baseUrl: BASE_URL, apiOrigin: API_ORIGIN, changed: false };
    }

    var prevBase = BASE_URL;
    var prevApi = API_ORIGIN;
    var resolvedOrigin = "";

    var hubRes = fetch(HUB_URL + "/", {
        headers: getHeaders(HUB_URL + "/"),
        timeout: 15000
    });
    if (hubRes && hubRes.ok) {
        var html = hubRes.text() || "";
        var rawHref = "";
        try {
            var doc = Html.parse(html);
            var el = doc.select("a#live-url").first();
            if (el) rawHref = trimText(el.attr("href"));
            if (!rawHref) {
                var goEl = doc.select("a#live-go").first();
                if (goEl) rawHref = trimText(goEl.attr("href"));
            }
            if (!rawHref) {
                var ogEl = doc.select("meta[property=\"og:url\"]").first();
                if (ogEl) rawHref = trimText(ogEl.attr("content"));
            }
        } catch (e) {}

        if (!rawHref) {
            var m = html.match(/id="live-url"[^>]*href="([^"]+)"/i) || html.match(/property="og:url"[^>]*content="([^"]+)"/i);
            if (m && m[1]) rawHref = m[1];
        }
        resolvedOrigin = cleanOrigin(rawHref);
    }

    if (resolvedOrigin) {
        var probeRes = fetch(resolvedOrigin + "/live-domain.json", {
            headers: getHeaders(resolvedOrigin + "/"),
            timeout: 10000
        });
        if (probeRes && probeRes.ok && probeRes.url) {
            var finalOrig = cleanOrigin(probeRes.url);
            if (finalOrig) resolvedOrigin = finalOrig;
        }
        if (!USER_CUSTOM_DOMAIN) {
            BASE_URL = resolvedOrigin;
        }
    }

    // Verify API_ORIGIN health; re-discover from site chunks only if current API_ORIGIN fails
    var testRes = fetch(API_ORIGIN + "/api/v1/menus", {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 10000
    });
    if (!testRes || !testRes.ok) {
        var discoveredApi = discoverApiFromSite(BASE_URL);
        if (discoveredApi) {
            API_ORIGIN = discoveredApi;
        }
    }

    writeLS(LS_DOMAIN_KEY, BASE_URL);
    writeLS(LS_API_KEY, API_ORIGIN);
    writeLS(LS_TS_KEY, String(new Date().getTime()));

    if (!resolvedOrigin && (!testRes || !testRes.ok)) {
        return { ok: false, baseUrl: BASE_URL, apiOrigin: API_ORIGIN, message: "Không kết nối được " + HUB_URL + " và API hiện tại" };
    }

    return {
        ok: true,
        baseUrl: BASE_URL,
        apiOrigin: API_ORIGIN,
        changed: (BASE_URL !== prevBase || API_ORIGIN !== prevApi),
        message: "Domain: " + BASE_URL + " | API: " + API_ORIGIN
    };
}

function apiGet(path) {
    if (IS_AUTO_DOMAIN && isDomainTtlExpired()) {
        resolveDomainFromHub(false);
    }

    var res = fetch(API_ORIGIN + "/api/v1" + path, {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 25000
    });

    if ((!res || !res.ok) && IS_AUTO_DOMAIN) {
        var prevApi = API_ORIGIN;
        var prevBase = BASE_URL;
        var sync = resolveDomainFromHub(true);
        if (sync.ok && (API_ORIGIN !== prevApi || BASE_URL !== prevBase)) {
            res = fetch(API_ORIGIN + "/api/v1" + path, {
                headers: getHeaders(BASE_URL + "/"),
                timeout: 25000
            });
        }
    }

    if (!res || !res.ok) {
        return { ok: false, error: "HTTP " + (res ? res.status : 0) };
    }
    try {
        return { ok: true, data: res.json() };
    } catch (e) {
        return { ok: false, error: "Lỗi JSON: " + e };
    }
}

function mapMovieItem(m) {
    if (!m || !m.slug) return null;
    var name = trimText(m.name || m.origin_name);
    if (!name) return null;

    var ep = trimText(m.episode_current);
    var qual = trimText(m.quality);
    var descParts = [];
    if (ep) descParts.push(ep);
    if (qual) descParts.push(qual);
    if (!descParts.length && m.origin_name) descParts.push(trimText(m.origin_name));

    var tag = trimText(m.language || (m.status === "completed" ? "Hoàn tất" : "") || qual);

    return {
        name: name,
        link: BASE_URL + "/phim/" + trimText(m.slug),
        cover: fixCover(m.thumbnail || m.poster || m.image_name),
        description: descParts.join(" • "),
        tag: tag,
        host: BASE_URL
    };
}

function mapMovieList(arr) {
    if (!arr || !arr.length) return [];
    var out = [];
    var seen = {};
    var i;
    for (i = 0; i < arr.length; i++) {
        var mapped = mapMovieItem(arr[i]);
        if (mapped && !seen[mapped.link]) {
            seen[mapped.link] = true;
            out.push(mapped);
        }
    }
    return out;
}
