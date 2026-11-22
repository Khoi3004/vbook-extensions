load("config.js");

function execute(url) {
    var res = fetchNextData(url);
    if (!res.ok) return Response.error(res.error);

    var pp = res.data;
    if (pp.storyExists === false || !pp.story) {
        return Response.error("Không tìm thấy truyện");
    }

    var story = pp.story;
    var author = trimText(story.pen_name_user || story.author || story.name_user);
    var ongoing = story.status !== "complete";
    var statusText = ongoing ? "Đang ra" : "Hoàn thành";
    var feeText = (story.not_free === "true" || story.not_free === true) ? "Có chương trả phí" : "Miễn phí";

    var detailLines = [];
    if (author) detailLines.push("Tác giả: " + author);
    detailLines.push("Trạng thái: " + statusText);
    if (story.count_chapter !== undefined && story.count_chapter !== null) {
        detailLines.push("Số chương: " + story.count_chapter);
    }
    if (story.view !== undefined && story.view !== null) {
        detailLines.push("Lượt xem: " + story.view);
    }
    detailLines.push("Hình thức: " + feeText);
    if (story.updated_at) {
        detailLines.push("Cập nhật: " + story.updated_at);
    }

    var genres = [];
    var cats = pp.categories || [];
    var i;
    for (i = 0; i < cats.length; i++) {
        var c = cats[i];
        if (c && c.category_title && c.category_slug) {
            genres.push({
                title: trimText(c.category_title),
                input: trimText(c.category_slug),
                script: "gen.js"
            });
        }
    }

    return Response.success({
        name: trimText(story.title),
        cover: buildCover(story.image),
        author: author,
        description: story.description || story.detail || "",
        detail: detailLines.join("<br>"),
        url: res.url,
        type: "novel",
        format: "novel",
        ongoing: ongoing,
        nsfw: false,
        locale: "vi",
        genres: genres,
        suggests: [
            {
                title: "Truyện tương tự",
                input: String(story.id),
                script: "similar.js"
            }
        ],
        comments: [
            {
                title: "Bình luận",
                input: String(story.id),
                script: "comments.js"
            }
        ]
    });
}
