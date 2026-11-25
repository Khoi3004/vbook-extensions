load("config.js");

function parseEpOrder(ep) {
    var nameNum = parseFloat(String(ep.name || "").replace(/[^\d.]/g, ""));
    if (!isNaN(nameNum)) return nameNum;
    var slugNum = parseFloat(String(ep.slug || "").replace(/[^\d.]/g, ""));
    if (!isNaN(slugNum)) return slugNum;
    return 999999;
}

function execute(url) {
    var slug = extractMovieSlug(url);
    if (!slug) return Response.error("URL phim không hợp lệ");

    var mRes = apiGet("/movies/by-slug/" + encodeURIComponent(slug));
    if (!mRes.ok) return Response.error(mRes.error);

    var movie = mRes.data && mRes.data.movie ? mRes.data.movie : null;
    if (!movie || !movie.id) {
        return Response.error("Không tìm thấy thông tin phim");
    }

    var epRes = apiGet("/episodes/by-idMovie/" + encodeURIComponent(String(movie.id)));
    if (!epRes.ok) return Response.error(epRes.error);

    var rawList = epRes.data && epRes.data.length ? epRes.data : [];
    var groups = {};
    var groupList = [];
    var seasonSet = {};
    var i;

    for (i = 0; i < rawList.length; i++) {
        var ep = rawList[i];
        if (!ep || !ep.slug) continue;
        var season = parseInt(ep.season_number || "1", 10) || 1;
        var epSlug = trimText(ep.slug);
        var key = String(season) + "::" + epSlug.toLowerCase();
        seasonSet[season] = true;

        if (!groups[key]) {
            groups[key] = {
                season: season,
                slug: epSlug,
                name: trimText(ep.name),
                order: parseEpOrder(ep),
                firstId: ep.id
            };
            groupList.push(groups[key]);
        }
    }

    groupList.sort(function (a, b) {
        if (a.season !== b.season) return a.season - b.season;
        if (a.order !== b.order) return a.order - b.order;
        return (a.firstId || 0) - (b.firstId || 0);
    });

    var multiSeason = Object.keys(seasonSet).length > 1;
    var movieSlug = trimText(movie.slug || slug);
    var episodes = [];

    for (i = 0; i < groupList.length; i++) {
        var g = groupList[i];
        var label = g.name || g.slug;
        if (/^\d+(\.\d+)?$/.test(label)) {
            label = "Tập " + label;
        }
        if (multiSeason) {
            label = "Phần " + g.season + " - " + label;
        }
        episodes.push({
            name: label,
            url: BASE_URL + "/phim/" + movieSlug + "/" + g.slug + "?mid=" + movie.id + "&s=" + g.season,
            description: "",
            lock: false,
            pay: false
        });
    }

    return Response.success(episodes);
}
