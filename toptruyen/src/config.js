var BASE_URL = "https://www.toptruyenzone15.com";
try {
    if (typeof DOMAIN !== "undefined" && DOMAIN) {
        var domVal = String(DOMAIN).replace(/^\s+|\s+$/g, "").replace(/\/+$/, "");
        if (domVal) {
            if (domVal.indexOf("http://") !== 0 && domVal.indexOf("https://") !== 0) {
                domVal = "https://" + domVal;
            }
            BASE_URL = domVal;
        }
    }
} catch (e) {}

var USER_EMAIL = "";
try {
    if (typeof EMAIL !== "undefined" && EMAIL) {
        USER_EMAIL = String(EMAIL).replace(/^\s+|\s+$/g, "");
    }
} catch (e) {}

var USER_PASSWORD = "";
try {
    if (typeof PASSWORD !== "undefined" && PASSWORD) {
        USER_PASSWORD = String(PASSWORD);
    }
} catch (e) {}

var IS_AUTO_LOGIN = true;
try {
    if (typeof AUTO_LOGIN !== "undefined" && AUTO_LOGIN !== null && AUTO_LOGIN !== "") {
        IS_AUTO_LOGIN = String(AUTO_LOGIN) === "true";
    }
} catch (e) {}

var LOGIN_CACHE_KEY = "toptruyen_login_sig";
var LOGIN_CACHE_TTL_MS = 6 * 3600 * 1000;

function trimText(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/^\s+|\s+$/g, "");
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

function extractPath(url) {
    if (!url) return "/";
    var s = trimText(url);
    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) {
        s = s.replace(/^https?:\/\/[^\/]+/i, "");
    }
    if (!s || s.charAt(0) !== "/") {
        s = "/" + s;
    }
    return s;
}

function fixImgUrl(url) {
    var s = trimText(url);
    if (!s) return "";
    if (s.indexOf("//") === 0) {
        return "https:" + s;
    }
    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) {
        return s;
    }
    if (s.charAt(0) !== "/") s = "/" + s;
    return BASE_URL + s;
}

function getHeaders(referer) {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Referer": referer || (BASE_URL + "/")
    };
}

function getLoginCache() {
    try {
        if (typeof cacheStorage === "undefined") return null;
        var raw = cacheStorage.getItem(LOGIN_CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setLoginCache() {
    try {
        if (typeof cacheStorage === "undefined") return;
        cacheStorage.setItem(LOGIN_CACHE_KEY, JSON.stringify({
            u: BASE_URL,
            e: USER_EMAIL,
            t: new Date().getTime()
        }));
    } catch (e) {}
}

function clearLoginCache() {
    try {
        if (typeof cacheStorage === "undefined") return;
        cacheStorage.removeItem(LOGIN_CACHE_KEY);
    } catch (e) {}
}

function checkLoggedIn() {
    var res = fetch(BASE_URL + "/header-login", {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 20000
    });
    if (!res || !res.ok) return false;
    var body = res.text() || "";
    if (!body) return false;
    if (body.indexOf("info-user-login") !== -1) return true;
    return body.indexOf("btn-login") === -1 && body.indexOf("/login\"") === -1 && body.indexOf("/login'") === -1;
}

function ensureLogin(force) {
    if (!USER_EMAIL || !USER_PASSWORD) {
        return { ok: false, skipped: true, message: "Chưa cấu hình Email và Mật khẩu trong cài đặt tiện ích" };
    }
    if (!force && !IS_AUTO_LOGIN) {
        return { ok: false, skipped: true, message: "Tự động đăng nhập đang tắt" };
    }

    if (!force) {
        var cached = getLoginCache();
        if (cached && cached.u === BASE_URL && cached.e === USER_EMAIL) {
            if (new Date().getTime() - (cached.t || 0) < LOGIN_CACHE_TTL_MS) {
                return { ok: true, cached: true, message: "Đã có phiên đăng nhập" };
            }
        }
    }

    var loginUrl = BASE_URL + "/login";
    var pageRes = fetch(loginUrl, {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 30000
    });
    if (!pageRes || !pageRes.ok) {
        return { ok: false, message: "Không tải được trang đăng nhập (HTTP " + (pageRes ? pageRes.status : 0) + ")" };
    }

    if (pageRes.url && pageRes.url.indexOf("/login") === -1) {
        setLoginCache();
        return { ok: true, message: "Đã đăng nhập sẵn" };
    }

    var doc = pageRes.html();
    var tokenEl = doc.select("input[name=\"_token\"]").first();
    var csrfToken = tokenEl ? trimText(tokenEl.attr("value")) : "";
    if (!csrfToken) {
        var metaEl = doc.select("meta[name=\"csrf-token\"]").first();
        csrfToken = metaEl ? trimText(metaEl.attr("content")) : "";
    }
    if (!csrfToken) {
        return { ok: false, message: "Không tìm thấy CSRF _token trên trang đăng nhập" };
    }

    var postUrl = pageRes.url || loginUrl;
    var postOrigin = postUrl.replace(/^(https?:\/\/[^\/]+).*$/i, "$1");
    var postHeaders = getHeaders(postUrl);
    postHeaders["Origin"] = postOrigin;
    postHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    postHeaders["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

    var formBody = "_token=" + encodeURIComponent(csrfToken) +
        "&email=" + encodeURIComponent(USER_EMAIL) +
        "&password=" + encodeURIComponent(USER_PASSWORD) +
        "&remember=1";

    var postRes = fetch(postUrl, {
        method: "POST",
        headers: postHeaders,
        body: formBody,
        timeout: 30000
    });
    if (!postRes) {
        return { ok: false, message: "Không nhận được phản hồi khi đăng nhập" };
    }

    var postErr = "";
    if (postRes.ok) {
        try {
            var postDoc = postRes.html();
            var errEl = postDoc.select(".alert-danger, .invalid-feedback, .help-block strong").first();
            if (errEl) postErr = trimText(errEl.text());
        } catch (e) {}
    }

    var landedOutsideLogin = postRes.url && postRes.url.indexOf("/login") === -1;
    if ((postRes.ok && landedOutsideLogin && !postErr) || checkLoggedIn()) {
        setLoginCache();
        return { ok: true, message: "Đăng nhập thành công (" + USER_EMAIL + ")" };
    }

    clearLoginCache();
    return {
        ok: false,
        message: postErr || ("Đăng nhập thất bại (HTTP " + postRes.status + ", url=" + String(postRes.url || "") + ")")
    };
}

function fetchDoc(url, requireAuth) {
    if (IS_AUTO_LOGIN && USER_EMAIL && USER_PASSWORD) {
        ensureLogin(false);
    }

    var targetUrl = normalizeUrl(url);
    var res = fetch(targetUrl, {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 30000
    });
    if (!res || !res.ok) {
        return { ok: false, error: "HTTP " + (res ? res.status : 0) };
    }

    if (res.url && res.url.indexOf("/login") !== -1) {
        if (USER_EMAIL && USER_PASSWORD) {
            clearLoginCache();
            var loginRes = ensureLogin(true);
            if (loginRes.ok) {
                res = fetch(targetUrl, {
                    headers: getHeaders(BASE_URL + "/"),
                    timeout: 30000
                });
                if (!res || !res.ok) {
                    return { ok: false, error: "HTTP " + (res ? res.status : 0) };
                }
            } else {
                return { ok: false, error: loginRes.message };
            }
        }
        if (requireAuth && res.url && res.url.indexOf("/login") !== -1) {
            return { ok: false, error: "Cần đăng nhập để xem mục này (nhập Email & Mật khẩu trong cài đặt hoặc đăng nhập qua trình duyệt)" };
        }
    }

    return {
        ok: true,
        doc: res.html(),
        url: targetUrl,
        finalUrl: res.url || targetUrl
    };
}

function parseComicList(doc) {
    var items = [];
    var seen = {};
    var els = doc.select(".item-manga");
    var i;
    for (i = 0; i < els.size(); i++) {
        var el = els.get(i);
        var titleLink = el.select(".caption h3 a.title-manga").first();
        if (!titleLink || !trimText(titleLink.attr("href"))) {
            titleLink = el.select(".image-item a").first();
        }
        if (!titleLink) continue;

        var name = trimText(titleLink.text() || titleLink.attr("title"));
        var rawHref = trimText(titleLink.attr("href"));
        if (!name || !rawHref) continue;

        var link = normalizeUrl(rawHref);
        if (seen[link]) continue;
        seen[link] = true;

        var imgEl = el.select(".image-item img").first();
        var cover = imgEl
            ? fixImgUrl(imgEl.attr("data-original") || imgEl.attr("data-src") || imgEl.attr("src"))
            : "";

        var chapEl = el.select(".caption li.chapter-detail a.chapter").first();
        var timeEl = el.select(".caption li.chapter-detail i.time").first();
        var desc = chapEl ? trimText(chapEl.text()) : "";
        var chapTime = timeEl ? trimText(timeEl.text()) : "";
        if (desc && chapTime) {
            desc = desc + " (" + chapTime + ")";
        }

        var tag = "";
        if (!el.select(".icon-hot, .label-hot").isEmpty()) {
            tag = "Hot";
        }

        items.push({
            name: name,
            link: link,
            cover: cover,
            description: desc,
            tag: tag,
            host: BASE_URL
        });
    }
    return items;
}

function parseNextPage(doc, currentPage) {
    var nextEl = doc.select("ul.pagination li.active + li a.page-link").first();
    if (!nextEl || !trimText(nextEl.attr("href"))) {
        nextEl = doc.select("ul.pagination a[rel=next]").first();
    }
    if (nextEl && trimText(nextEl.attr("href"))) {
        return String(currentPage + 1);
    }
    return "";
}
