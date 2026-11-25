load("config.js");

function execute(key, page) {
    var q = trimText(key);
    var pageNum = parseInt(page || "1", 10) || 1;

    if (q.indexOf("cat:") === 0 || q.indexOf("reg:") === 0 || q.indexOf("type:") === 0) {
        var ep = q.indexOf("cat:") === 0
            ? "/movies/by-category/" + encodeURIComponent(q.slice(4)) + "?page=" + pageNum
            : (q.indexOf("reg:") === 0
                ? "/movies/by-region/" + encodeURIComponent(q.slice(4)) + "?page=" + pageNum
                : "/movies/by-type/" + encodeURIComponent(q.slice(5)) + "?page=" + pageNum);
        var fRes = apiGet(ep);
        if (!fRes.ok) return Response.error(fRes.error);
        var fItems = mapMovieList(fRes.data ? fRes.data.result : []);
        var fMeta = fRes.data && fRes.data.meta ? fRes.data.meta : {};
        var fTotal = parseInt(fMeta.totalPage || fMeta.totalPages || "1", 10) || 1;
        return Response.success(fItems, (fItems.length > 0 && pageNum < fTotal) ? String(pageNum + 1) : "");
    }

    if (!q) {
        var defaultRes = apiGet("/movies/by-type/series?page=" + pageNum);
        if (!defaultRes.ok) return Response.error(defaultRes.error);
        var dItems = mapMovieList(defaultRes.data ? defaultRes.data.result : []);
        var dMeta = defaultRes.data && defaultRes.data.meta ? defaultRes.data.meta : {};
        var dTotal = parseInt(dMeta.totalPage || dMeta.totalPages || "1", 10) || 1;
        return Response.success(dItems, (dItems.length > 0 && pageNum < dTotal) ? String(pageNum + 1) : "");
    }

    var res = apiGet("/movies/search?keyword=" + encodeURIComponent(q) + "&page=" + pageNum + "&limit=32");
    if (!res.ok) return Response.error(res.error);

    var items = mapMovieList(res.data ? res.data.result : []);
    var meta = res.data && res.data.meta ? res.data.meta : {};
    var totalPage = parseInt(meta.totalPage || meta.totalPages || "1", 10) || 1;
    var next = (items.length > 0 && pageNum < totalPage) ? String(pageNum + 1) : "";
    return Response.success(items, next);
}
