var BASE_URL = "https://lacatruyen.email";
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

var USER_TOKEN = "";
try {
    if (typeof TOKEN !== "undefined" && TOKEN) {
        USER_TOKEN = String(TOKEN).replace(/^\s+|\s+$/g, "");
    }
} catch (e) {}

var IMAGE_BASE = "https://cms.metruyen.com/storage/uploads";
var RAW_MAIN_KEY = "T5Hr41U5jKTTrtUOXdYZnyx3wjZEKUoxv16Clwwu4D5zIbd0-q9sdfh";
var MAIN_KEY_CACHE = "";

function trimText(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/^\s+|\s+$/g, "");
}

function normalizeUrl(url) {
    if (!url) return BASE_URL;
    var s = trimText(url);
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

function buildCover(img) {
    if (!img) return "";
    var s = trimText(img);
    if (!s) return "";
    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) {
        return s;
    }
    if (s.charAt(0) === "/") {
        return BASE_URL + s;
    }
    return IMAGE_BASE + "/" + s;
}

function getHeaders(isJson) {
    var headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        "Referer": BASE_URL + "/"
    };
    if (isJson) {
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
    }
    if (USER_TOKEN) {
        headers["Cookie"] = "token=" + USER_TOKEN;
    }
    return headers;
}

function apiGet(path) {
    var res = fetch(BASE_URL + "/api/" + path, {
        headers: getHeaders(false),
        timeout: 30000
    });
    if (!res || !res.ok) {
        return { ok: false, error: "HTTP " + (res ? res.status : 0) };
    }
    try {
        return { ok: true, data: res.json() };
    } catch (e) {
        return { ok: false, error: "Invalid JSON: " + e };
    }
}

function apiPost(path, bodyObj) {
    var res = fetch(BASE_URL + "/api/" + path, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(bodyObj),
        timeout: 30000
    });
    if (!res || !res.ok) {
        return { ok: false, error: "HTTP " + (res ? res.status : 0) };
    }
    try {
        return { ok: true, data: res.json() };
    } catch (e) {
        return { ok: false, error: "Invalid JSON: " + e };
    }
}

function fetchNextData(url) {
    var targetUrl = normalizeUrl(url);
    var res = fetch(targetUrl, {
        headers: getHeaders(false),
        timeout: 30000
    });
    if (!res || !res.ok) {
        return { ok: false, error: "HTTP " + (res ? res.status : 0) };
    }
    var html = res.text();
    if (!html) {
        return { ok: false, error: "Empty HTML response" };
    }
    var raw = "";
    try {
        var doc = Html.parse(html);
        var el = doc.select("script#__NEXT_DATA__").first();
        if (el) {
            raw = el.html() || el.text();
        }
    } catch (e) {}
    if (!raw) {
        // Regex fallback for embedded Next.js SSR JSON state when DOM script content is empty
        var m = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (m && m[1]) {
            raw = m[1];
        }
    }
    if (!raw) {
        return { ok: false, error: "Không tìm thấy __NEXT_DATA__" };
    }
    try {
        var parsed = JSON.parse(raw);
        var pageProps = parsed && parsed.props ? parsed.props.pageProps : null;
        if (!pageProps) {
            return { ok: false, error: "Thiếu dữ liệu trang" };
        }
        return { ok: true, data: pageProps, url: targetUrl };
    } catch (e) {
        return { ok: false, error: "Lỗi JSON trang: " + e };
    }
}

function mapStoryItem(item) {
    if (!item) return null;
    var slug = trimText(item.story_slug || item.slug);
    var name = trimText(item.story_title || item.title);
    if (!slug || !name) return null;

    var cover = buildCover(item.story_image || item.image);
    var author = trimText(
        item.pen_name_user ||
        item.author_pen_name ||
        item.story_author ||
        item.author ||
        item.author_name ||
        item.name_user
    );
    var desc = trimText(item.story_description || item.description).replace(/\s+/g, " ");
    var status = trimText(item.story_status || item.status);
    var countChap = item.count_chap !== undefined && item.count_chap !== null
        ? item.count_chap
        : item.chapter_count;

    if (!desc && author) {
        desc = author;
    }

    var tag = "";
    if (status === "complete") {
        tag = "Full";
    } else if (item.name_category) {
        tag = trimText(item.name_category);
    } else if (countChap !== undefined && countChap !== null) {
        tag = String(countChap) + " chương";
    } else if (item.not_free === "false" || item.not_free === false) {
        tag = "Miễn phí";
    }

    return {
        name: name,
        link: BASE_URL + "/story/" + slug,
        cover: cover,
        description: desc,
        tag: tag,
        host: BASE_URL
    };
}

function mapStoryList(arr) {
    if (!arr || !arr.length) return [];
    var out = [];
    var seen = {};
    var i;
    for (i = 0; i < arr.length; i++) {
        var mapped = mapStoryItem(arr[i]);
        if (mapped && !seen[mapped.link]) {
            seen[mapped.link] = true;
            out.push(mapped);
        }
    }
    return out;
}

function deriveMainKey() {
    if (MAIN_KEY_CACHE) return MAIN_KEY_CACHE;
    var parts = RAW_MAIN_KEY.split("-");
    var prefix = parts[0] || "default";
    var suffix = parts[1] || "0000";
    var mul = 1;
    var i;
    for (i = 0; i < suffix.length; i++) {
        mul = (mul * suffix.charCodeAt(i)) % 255;
    }
    var out = [];
    for (i = 0; i < prefix.length; i++) {
        var ch = prefix.charAt(i);
        var code = prefix.charCodeAt(i);
        var shift = (mul + i * code) % 26;
        if (code >= 65 && code <= 90) {
            out.push(String.fromCharCode(((code - 65 + shift) % 26) + 65));
        } else if (code >= 97 && code <= 122) {
            out.push(String.fromCharCode(((code - 97 + shift) % 26) + 97));
        } else {
            out.push(ch);
        }
    }
    MAIN_KEY_CACHE = out.join("");
    return MAIN_KEY_CACHE;
}

function encryptMain(val) {
    if (val === null || val === undefined) return "";
    return CryptoJS.AES.encrypt(String(val), deriveMainKey()).toString();
}

function decryptWithKey(cipher, key) {
    if (!cipher || !key) return "";
    try {
        return CryptoJS.AES.decrypt(String(cipher), String(key)).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "";
    }
}

function decryptMain(cipher) {
    return decryptWithKey(cipher, deriveMainKey());
}

function decryptObjectWithKey(obj, key) {
    if (!obj || typeof obj !== "object" || !key) return null;
    var out = {};
    var k;
    for (k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            if (typeof obj[k] === "string") {
                out[k] = decryptWithKey(obj[k], key);
            } else {
                out[k] = obj[k];
            }
        }
    }
    return out;
}
