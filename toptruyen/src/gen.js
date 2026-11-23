load("config.js");

function execute(url, page) {
    var path = extractPath(url || "/");
    var pageNum = parseInt(page || "1", 10) || 1;
    var isFollow = path.indexOf("/follow") === 0;

    path = path.replace(/([?&])page=\d+&?/g, "$1").replace(/[?&]$/, "");
    if (pageNum > 1) {
        path = path + (path.indexOf("?") !== -1 ? "&" : "?") + "page=" + pageNum;
    }

    var res = fetchDoc(path, isFollow);
    if (!res.ok) return Response.error(res.error);

    var doc = res.doc;
    if (isFollow && !doc.select(".no-follow a[href*='/login']").isEmpty() && USER_EMAIL && USER_PASSWORD && IS_AUTO_LOGIN) {
        clearLoginCache();
        var reLogin = ensureLogin(true);
        if (reLogin.ok) {
            res = fetchDoc(path, true);
            if (!res.ok) return Response.error(res.error);
            doc = res.doc;
        }
    }

    var items = parseComicList(doc);
    var next = parseNextPage(doc, pageNum);
    return Response.success(items, next);
}
