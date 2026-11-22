load("config.js");

function execute(url, page) {
    var feed = trimText(url) || "updated";
    var pageNum = parseInt(page || "1", 10) || 1;
    var itemsPerPage = 20;
    var res;

    if (feed === "editor_gems") {
        res = apiGet("stories/hidden-gems?tier=editor");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapStoryList(res.data ? res.data.data : []), "");
    }

    if (feed === "trending") {
        res = apiGet("stories/top-trending-month");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapStoryList(res.data ? res.data.data : []), "");
    }

    if (feed === "top_week") {
        res = apiGet("stories/top-view-weeks");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapStoryList(res.data ? res.data.data : []), "");
    }

    if (feed === "top_day") {
        res = apiGet("stories/top-view-day");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapStoryList(res.data ? res.data.data : []), "");
    }

    if (feed === "rising") {
        res = apiGet("stories/rising-stars");
        if (!res.ok) return Response.error(res.error);
        return Response.success(mapStoryList(res.data ? res.data.data : []), "");
    }

    if (feed === "updated" || feed === "free" || feed === "completed") {
        var payload = {
            page: pageNum,
            items_per_page: itemsPerPage,
            search: "",
            sort_by: "updated"
        };
        if (feed === "free") payload.free = true;
        if (feed === "completed") payload.status = "complete";

        res = apiPost("stories/get-search", payload);
        if (!res.ok) return Response.error(res.error);

        var rows = res.data && res.data.data ? res.data.data : [];
        var total = parseInt(res.data && res.data.count ? res.data.count : "0", 10) || 0;
        var hasNext = rows.length >= itemsPerPage && (pageNum * itemsPerPage < total);
        return Response.success(mapStoryList(rows), hasNext ? String(pageNum + 1) : "");
    }

    // Category slug
    res = apiPost("categories/get-story", {
        page: pageNum,
        items_per_page: itemsPerPage,
        slug: feed,
        sort_by: "newest"
    });
    if (!res.ok) return Response.error(res.error);

    var catRows = res.data && res.data.data ? res.data.data : [];
    var catTotal = parseInt(res.data && res.data.count ? res.data.count : "0", 10) || 0;
    var catHasNext = catRows.length >= itemsPerPage && (pageNum * itemsPerPage < catTotal);
    return Response.success(mapStoryList(catRows), catHasNext ? String(pageNum + 1) : "");
}
