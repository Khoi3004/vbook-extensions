load("config.js");

function execute(key, page) {
    var keyword = trimText(key);
    var pageNum = parseInt(page || "1", 10) || 1;
    var path = "/tim-truyen?keyword=" + encodeURIComponent(keyword);
    if (pageNum > 1) {
        path = path + "&page=" + pageNum;
    }

    var res = fetchDoc(path, false);
    if (!res.ok) return Response.error(res.error);

    var items = parseComicList(res.doc);
    var next = parseNextPage(res.doc, pageNum);
    return Response.success(items, next);
}
