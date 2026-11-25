load("config.js");

function execute(input, page) {
    var feed = trimText(input) || "type:series";
    var pageNum = parseInt(page || "1", 10) || 1;
    var res;

    if (feed === "hot") {
        res = apiGet("/movies/hot");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapMovieList(res.data ? res.data.result : []), "");
    }

    if (feed === "weekly") {
        res = apiGet("/movies/view-weekly");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapMovieList(res.data ? res.data.result : []), "");
    }

    if (feed.indexOf("collection:") === 0) {
        var idx = parseInt(feed.slice(11), 10) || 0;
        res = apiGet("/lists/homepageLists?page=1");
        if (!res.ok) return Response.error(res.error);
        var cols = res.data && res.data.result && res.data.result.collections ? res.data.result.collections : [];
        var col = cols[idx] || null;
        return Response.success(mapMovieList(col && col.movies ? col.movies : []), "");
    }

    var endpoint = "";
    if (feed.indexOf("type:") === 0) {
        endpoint = "/movies/by-type/" + encodeURIComponent(feed.slice(5)) + "?page=" + pageNum;
    } else if (feed.indexOf("cat:") === 0) {
        endpoint = "/movies/by-category/" + encodeURIComponent(feed.slice(4)) + "?page=" + pageNum;
    } else if (feed.indexOf("reg:") === 0) {
        endpoint = "/movies/by-region/" + encodeURIComponent(feed.slice(4)) + "?page=" + pageNum;
    } else {
        endpoint = "/movies/by-category/" + encodeURIComponent(feed) + "?page=" + pageNum;
    }

    res = apiGet(endpoint);
    if (!res.ok) return Response.error(res.error);

    var items = mapMovieList(res.data ? res.data.result : []);
    var meta = res.data && res.data.meta ? res.data.meta : {};
    var totalPage = parseInt(meta.totalPage || meta.totalPages || "1", 10) || 1;
    var next = (items.length > 0 && pageNum < totalPage) ? String(pageNum + 1) : "";
    return Response.success(items, next);
}
