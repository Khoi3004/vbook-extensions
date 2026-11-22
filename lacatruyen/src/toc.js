load("config.js");
load("crypto.js");

function getQueryParam(url, key) {
    var m = String(url).match(new RegExp("[?&]" + key + "=([^&#]+)"));
    return m && m[1] ? decodeURIComponent(m[1]) : "";
}

function execute(url) {
    var storyId = getQueryParam(url, "id_story");
    var pageStr = getQueryParam(url, "page") || "1";
    var ippStr = getQueryParam(url, "items_per_page") || "500";

    if (!storyId) {
        var pageRes = fetchNextData(url);
        if (!pageRes.ok) return Response.error(pageRes.error);
        if (!pageRes.data || !pageRes.data.story || !pageRes.data.story.id) {
            return Response.error("Không tìm thấy ID truyện");
        }
        storyId = String(pageRes.data.story.id);
    }

    var res = apiPost("chapters/list-chapters", {
        id_story: encryptMain(storyId),
        page: encryptMain(pageStr),
        items_per_page: encryptMain(ippStr),
        order: encryptMain("asc")
    });
    if (!res.ok) return Response.error(res.error);

    if (!res.data || !res.data.data) {
        return Response.error("Không tải được danh sách chương");
    }

    var decrypted = decryptMain(res.data.data);
    if (!decrypted) {
        return Response.error("Giải mã danh sách chương thất bại");
    }

    var list;
    try {
        list = JSON.parse(decrypted);
    } catch (e) {
        return Response.error("Lỗi phân tích danh sách chương");
    }

    var chapters = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var ch = list[i];
        if (!ch || !ch.slug) continue;
        chapters.push({
            name: trimText(ch.title) || ("Chương " + (ch.chapter_order || (i + 1))),
            url: BASE_URL + "/chapter/" + trimText(ch.slug),
            pay: false,
            lock: false
        });
    }

    return Response.success(chapters);
}
