load("config.js");

function getQueryParam(url, key) {
    var m = String(url).match(new RegExp("[?&]" + key + "=([^&#]+)"));
    return m && m[1] ? decodeURIComponent(m[1]) : "";
}

function getServerPriority(serverName) {
    var s = String(serverName || "").toLowerCase();
    if (s.indexOf("(vs)") !== -1) return 0;
    if (s.indexOf("thuyết minh") !== -1) return 1;
    if (s.indexOf("lồng tiếng") !== -1) return 2;
    if (s.indexOf("(kk)") !== -1) return 3;
    return 4;
}

function execute(url) {
    var normUrl = normalizeUrl(url);
    var cleanPath = normUrl.replace(/[?#].*$/, "").replace(/\/+$/, "");
    var m = cleanPath.match(/\/(?:phim|xem-phim)\/([^\/]+)\/([^\/]+)$/i);
    if (!m) {
        return Response.error("URL tập phim không hợp lệ");
    }

    var movieSlug = m[1];
    var epSlug = m[2];
    var movieId = getQueryParam(normUrl, "mid");
    var seasonFilter = parseInt(getQueryParam(normUrl, "s") || "0", 10) || 0;

    if (!movieId) {
        var mRes = apiGet("/movies/by-slug/" + encodeURIComponent(movieSlug));
        if (!mRes.ok) return Response.error(mRes.error);
        if (!mRes.data || !mRes.data.movie || !mRes.data.movie.id) {
            return Response.error("Không tìm thấy ID phim");
        }
        movieId = String(mRes.data.movie.id);
    }

    var epRes = apiGet("/episodes/by-idMovie/" + encodeURIComponent(movieId));
    if (!epRes.ok) return Response.error(epRes.error);

    var allEps = epRes.data && epRes.data.length ? epRes.data : [];
    var matched = [];
    var i;
    for (i = 0; i < allEps.length; i++) {
        var ep = allEps[i];
        if (!ep || !ep.id) continue;
        var sNum = parseInt(ep.season_number || "1", 10) || 1;
        if (seasonFilter > 0 && sNum !== seasonFilter) continue;
        if (String(ep.slug || "").toLowerCase() === epSlug.toLowerCase()) {
            matched.push(ep);
        }
    }

    if (matched.length === 0) {
        return Response.error("Không tìm thấy nguồn phát cho tập này");
    }

    matched.sort(function (a, b) {
        var pa = getServerPriority(a.server);
        var pb = getServerPriority(b.server);
        if (pa !== pb) return pa - pb;
        return (a.id || 0) - (b.id || 0);
    });

    var tracks = [];
    var titleCounts = {};
    for (i = 0; i < matched.length; i++) {
        var item = matched[i];
        var baseTitle = trimText(item.server) || ("Server " + (i + 1));
        titleCounts[baseTitle] = (titleCounts[baseTitle] || 0) + 1;
        var uniqueTitle = titleCounts[baseTitle] > 1 ? (baseTitle + " #" + titleCounts[baseTitle]) : baseTitle;
        tracks.push({
            title: uniqueTitle,
            data: JSON.stringify({
                epId: item.id,
                server: uniqueTitle,
                pageUrl: normUrl
            })
        });
    }

    return Response.success(tracks);
}
