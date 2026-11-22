load("config.js");
load("crypto.js");

function execute(url) {
    var res = fetchNextData(url);
    if (!res.ok) return Response.error(res.error);

    var pp = res.data;
    if (pp.chapterExists === false || !pp.chapter) {
        return Response.error("Không tìm thấy chương");
    }

    var chapter = pp.chapter;
    var notify = pp.notify || "";
    var previewHtml = pp.previewHtml || "";
    var title = "";
    var html = "";

    if (!notify && pp.rs && pp.ri) {
        var riIdx = decryptMain(pp.ri);
        var rsVal = (riIdx !== "" && pp.rs[riIdx]) ? decryptMain(pp.rs[riIdx]) : "";
        if (rsVal) {
            var pass1 = String(rsVal + pp.comment_count);
            var decChapter = decryptObjectWithKey(chapter, pass1);
            if (decChapter) {
                if (!decChapter.content && pp.contentEncrypt) {
                    decChapter.content = pp.contentEncrypt;
                }
                if (decChapter.title) {
                    title = trimText(decChapter.title);
                }
                if (decChapter.content && decChapter.key_encrypt) {
                    var chKey = decryptWithKey(decChapter.key_encrypt, pass1);
                    if (chKey) {
                        html = decryptWithKey(decChapter.content, chKey);
                    }
                }
            }
            if (!html && chapter.content && chapter.key_encrypt) {
                var singleKey = decryptWithKey(chapter.key_encrypt, pass1);
                if (singleKey) {
                    html = decryptWithKey(chapter.content, singleKey);
                }
            }
        }
    }

    if (html && trimText(html)) {
        return Response.success(html.replace(/\r\n?/g, ""), title);
    }

    var noticeMsg = "";
    if (notify === "not_login") {
        noticeMsg = "Chương này yêu cầu đăng nhập để đọc toàn bộ. Vui lòng đăng nhập trên trình duyệt trong vBook hoặc nhập Cookie Token trong cài đặt tiện ích.";
    } else if (notify === "no_package") {
        var priceInfo = pp.chapterPrice ? (" (" + pp.chapterPrice + " bạc)") : "";
        noticeMsg = "Chương VIP" + priceInfo + " — cần mua chương hoặc gói đọc để xem toàn bộ.";
    } else {
        noticeMsg = "Không thể giải mã toàn bộ nội dung chương này.";
    }

    if (previewHtml && trimText(previewHtml)) {
        var cleanPreview = String(previewHtml).replace(/\r\n?/g, "");
        return Response.success(
            cleanPreview + "<hr><p><i>[La Cà Truyện] " + noticeMsg + "</i></p>",
            title
        );
    }

    return Response.error(noticeMsg);
}
