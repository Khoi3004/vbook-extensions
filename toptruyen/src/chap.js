load("config.js");

function execute(url) {
    var res = fetchDoc(url, false);
    if (!res.ok) return Response.error(res.error);

    var doc = res.doc;
    var imgs = doc.select("div[id^=page_].page-chapter img");
    var fallbackMode = false;
    if (imgs.isEmpty()) {
        imgs = doc.select(".page-chapter img");
        fallbackMode = true;
    }

    var list = [];
    var seen = {};
    var i;
    for (i = 0; i < imgs.size(); i++) {
        var img = imgs.get(i);
        var raw = trimText(img.attr("data-original") || img.attr("data-src") || img.attr("src"));
        if (!raw) continue;
        if (fallbackMode && raw.indexOf("/comics/top/") !== -1) continue;

        var imgUrl = fixImgUrl(raw);
        if (!imgUrl || seen[imgUrl]) continue;
        seen[imgUrl] = true;
        list.push(imgUrl);
    }

    if (list.length === 0) {
        return Response.error("Không tìm thấy ảnh chương");
    }

    return Response.success(list);
}
