load("config.js");

function parsePlayerData(html) {
    var m = html.match(/window\.__PLAYER_DATA__\s*=\s*(\{[\s\S]*?\});\s*(?:\n|<\/script>)/);
    if (!m || !m[1]) return null;
    try {
        return JSON.parse(m[1]);
    } catch (e) {
        return null;
    }
}

function verifyStreamUrl(streamUrl, referer) {
    if (!streamUrl) return false;
    var res = fetch(streamUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Referer": referer || (API_ORIGIN + "/")
        },
        timeout: 12000
    });
    if (!res || !res.ok) return false;
    if (streamUrl.indexOf(".m3u8") !== -1) {
        var body = res.text() || "";
        return body.indexOf("#EXTM3U") !== -1;
    }
    return true;
}

function execute(data) {
    var epId = "";
    var pageUrl = BASE_URL + "/";
    try {
        var payload = JSON.parse(data);
        epId = payload && payload.epId ? String(payload.epId) : "";
        if (payload && payload.pageUrl) pageUrl = normalizeUrl(payload.pageUrl);
    } catch (e) {
        epId = trimText(data);
    }

    if (!epId) {
        return Response.error("Thiếu ID tập phim");
    }

    var embedUrl = API_ORIGIN + "/embed/" + encodeURIComponent(epId);
    var res = fetch(embedUrl, {
        headers: getHeaders(BASE_URL + "/"),
        timeout: 20000
    });
    if (!res || !res.ok) {
        return Response.error("HTTP " + (res ? res.status : 0));
    }

    var html = res.text() || "";
    var playerData = parsePlayerData(html);

    if (playerData && playerData.episode && playerData.episode.playUrl) {
        var playUrl = trimText(playerData.episode.playUrl);
        if (verifyStreamUrl(playUrl, API_ORIGIN + "/")) {
            var subs = [];
            var rawSubs = playerData.episode.subtitles || [];
            var i;
            for (i = 0; i < rawSubs.length; i++) {
                var s = rawSubs[i];
                if (!s || !s.url) continue;
                subs.push({
                    data: trimText(s.url),
                    type: "vtt",
                    label: trimText(s.label) || "Phụ đề",
                    language: trimText(s.language) || "vi"
                });
            }

            return Response.success({
                type: "native",
                data: playUrl,
                host: API_ORIGIN,
                mimeType: playUrl.indexOf(".mp4") !== -1 ? "video/mp4" : "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    "Referer": API_ORIGIN + "/"
                },
                subtitles: subs,
                timeSkip: []
            });
        }
    }

    return Response.success({
        type: "webview",
        data: JSON.stringify({
            embed: embedUrl,
            data: embedUrl,
            host: API_ORIGIN
        }),
        host: pageUrl
    });
}
