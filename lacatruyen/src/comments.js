load("config.js");

function execute(input, page) {
    var storyId = parseInt(trimText(input), 10);
    if (!storyId) return Response.success([], "");

    var pageNum = parseInt(page || "1", 10) || 1;
    var itemsPerPage = 10;

    var res = apiPost("stories/get-comments", {
        story_id: storyId,
        page: pageNum,
        items_per_page: itemsPerPage,
        sort: "newest"
    });
    if (!res.ok) return Response.error(res.error);

    var rows = res.data && res.data.data ? res.data.data : [];
    var items = [];
    var i;
    for (i = 0; i < rows.length; i++) {
        var c = rows[i];
        if (!c) continue;
        items.push({
            name: trimText(c.pen_name_user || c.name_user) || "Ẩn danh",
            avatar: c.image_user ? buildCover(c.image_user) : "",
            content: trimText(c.content),
            description: trimText(c.created_at)
        });
    }

    var total = parseInt(res.data && res.data.count ? res.data.count : "0", 10) || 0;
    var hasNext = rows.length >= itemsPerPage && (pageNum * itemsPerPage < total);
    return Response.success(items, hasNext ? String(pageNum + 1) : "");
}
