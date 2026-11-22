load("config.js");

function execute(key, page) {
    var keyword = trimText(key);
    var pageNum = parseInt(page || "1", 10) || 1;
    var itemsPerPage = 20;

    var res = apiPost("stories/get-search", {
        page: pageNum,
        items_per_page: itemsPerPage,
        search: keyword,
        sort_by: "updated"
    });
    if (!res.ok) return Response.error(res.error);

    var rows = res.data && res.data.data ? res.data.data : [];
    var total = parseInt(res.data && res.data.count ? res.data.count : "0", 10) || 0;
    var hasNext = rows.length >= itemsPerPage && (pageNum * itemsPerPage < total);
    return Response.success(mapStoryList(rows), hasNext ? String(pageNum + 1) : "");
}
