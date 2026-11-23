load("config.js");

function execute(url) {
    var res = fetchDoc(url, false);
    if (!res.ok) return Response.error(res.error);

    var doc = res.doc;
    var titleEl = doc.select("h1.title-manga").first();
    if (!titleEl || !trimText(titleEl.text())) {
        titleEl = doc.select("h1").first();
    }
    var name = titleEl ? trimText(titleEl.text()) : "";
    if (!name) {
        return Response.error("Không tìm thấy thông tin truyện");
    }

    var imgEl = doc.select(".image-info img").first();
    var cover = imgEl
        ? fixImgUrl(imgEl.attr("data-original") || imgEl.attr("data-src") || imgEl.attr("src"))
        : "";

    var otherName = trimText(doc.select(".info-detail-comic li.name-other .detail-info").text());
    var author = trimText(doc.select(".info-detail-comic li.author .detail-info").text());
    var statusText = trimText(doc.select(".info-detail-comic li.status .detail-info").text());
    var group = trimText(doc.select(".info-detail-comic li.translate-group .detail-info").text());
    var views = trimText(doc.select(".info-detail-comic li.view-total .detail-info").text());
    var likes = trimText(doc.select(".info-detail-comic li.view-like .detail-info").text());
    var follows = trimText(doc.select(".info-detail-comic li.total-follow .detail-info").text());

    var ongoing = statusText.toLowerCase().indexOf("hoàn thành") === -1;

    var detailLines = [];
    if (otherName && otherName !== "Đang cập nhật") detailLines.push("Tên khác: " + otherName);
    if (author) detailLines.push("Tác giả: " + author);
    if (statusText) detailLines.push("Tình trạng: " + statusText);
    if (group && group !== "Đang cập nhật") detailLines.push("Nhóm dịch: " + group);
    if (views) detailLines.push("Lượt xem: " + views);
    if (likes) detailLines.push("Lượt thích: " + likes);
    if (follows) detailLines.push("Theo dõi: " + follows);

    var genres = [];
    var seenGenre = {};
    var catEls = doc.select(".info-detail-comic li.category .cat-detail a");
    var i;
    for (i = 0; i < catEls.size(); i++) {
        var cEl = catEls.get(i);
        var gTitle = trimText(cEl.text());
        var gHref = trimText(cEl.attr("href"));
        if (!gTitle || !gHref) continue;
        var gPath = extractPath(gHref);
        if (seenGenre[gPath]) continue;
        seenGenre[gPath] = true;
        genres.push({
            title: gTitle,
            input: gPath,
            script: "gen.js"
        });
    }

    var descEl = doc.select(".summary-content p.detail-summary").first();
    var description = descEl ? descEl.html() : "";

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: detailLines.join("<br>"),
        url: res.url,
        type: "comic",
        format: "comic",
        ongoing: ongoing,
        nsfw: false,
        locale: "vi",
        genres: genres
    });
}
