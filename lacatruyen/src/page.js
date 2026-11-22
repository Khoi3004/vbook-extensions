load("config.js");

function execute(url) {
    var res = fetchNextData(url);
    if (!res.ok) return Response.error(res.error);

    var pp = res.data;
    if (pp.storyExists === false || !pp.story || !pp.story.id) {
        return Response.error("Không tìm thấy truyện");
    }

    var storyId = pp.story.id;
    var countChap = parseInt(pp.story.count_chapter || "0", 10) || 0;
    var perPage = 500;
    var totalPages = countChap > 0 ? Math.ceil(countChap / perPage) : 1;

    var pages = [];
    var i;
    for (i = 1; i <= totalPages; i++) {
        pages.push(
            BASE_URL +
            "/api/chapters/list-chapters?id_story=" + storyId +
            "&page=" + i +
            "&items_per_page=" + perPage
        );
    }

    return Response.success(pages);
}
