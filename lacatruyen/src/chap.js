load("config.js");
load("crypto.js");

function isCipherText(str) {
    return typeof str === "string" && str.indexOf("U2FsdGVkX1") === 0;
}

function tryDecryptContent(candidates, keys) {
    var i, j, raw, dec, dec2;
    for (i = 0; i < candidates.length; i++) {
        raw = trimText(candidates[i]);
        if (!raw) continue;
        if (!isCipherText(raw) && raw.indexOf("<") !== -1) {
            return raw;
        }
        for (j = 0; j < keys.length; j++) {
            if (!keys[j]) continue;
            dec = trimText(decryptWithKey(raw, keys[j]));
            if (!dec) continue;
            if (!isCipherText(dec)) {
                return dec;
            }
            // If decrypted value is still AES-encrypted, try one more layer
            var k;
            for (k = 0; k < keys.length; k++) {
                if (!keys[k]) continue;
                dec2 = trimText(decryptWithKey(dec, keys[k]));
                if (dec2 && !isCipherText(dec2)) {
                    return dec2;
                }
            }
        }
    }
    return "";
}

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
    var riIdx = "";
    var k1 = "";
    var decContentLen = 0;

    if (pp.rs && pp.ri) {
        riIdx = decryptMain(pp.ri);
        var rsVal = (riIdx !== "" && Object.prototype.hasOwnProperty.call(pp.rs, riIdx))
            ? decryptMain(pp.rs[riIdx])
            : undefined;
        // Match site frontend exactly: "".concat(decryptObject(rs)[decrypt(ri)] + comment_count)
        var pass1 = "".concat(rsVal + pp.comment_count);
        var decChapter = decryptObjectWithKey(chapter, pass1);

        if (decChapter && decChapter.title) {
            title = trimText(decChapter.title);
        }

        if (notify !== "not_login" && notify !== "no_package") {
            var decKeyEnc = decChapter && decChapter.key_encrypt ? decChapter.key_encrypt : "";
            k1 = decKeyEnc ? decryptWithKey(decKeyEnc, pass1) : "";
            var decContent = decChapter && decChapter.content ? decChapter.content : "";
            decContentLen = decContent.length;

            var candidates = [
                decContent,
                pp.contentEncrypt || "",
                chapter.content || ""
            ];
            var keys = [
                k1,
                decKeyEnc,
                pass1,
                deriveMainKey()
            ];
            html = tryDecryptContent(candidates, keys);
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
        noticeMsg = "Không thể giải mã toàn bộ nội dung chương này (" +
            "notify=" + String(notify) +
            ", ri=" + String(riIdx) +
            ", cLen=" + String(chapter.content ? chapter.content.length : 0) +
            ", ceLen=" + String(pp.contentEncrypt ? pp.contentEncrypt.length : 0) +
            ", dcLen=" + String(decContentLen) +
            ", k1=" + (k1 ? "ok" : "empty") + ").";
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
