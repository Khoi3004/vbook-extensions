load("config.js");

function execute(url) {
    var slug = extractMovieSlug(url);
    if (!slug) return Response.error("URL phim không hợp lệ");

    var res = apiGet("/movies/by-slug/" + encodeURIComponent(slug));
    if (!res.ok) return Response.error(res.error);

    var movie = res.data && res.data.movie ? res.data.movie : null;
    if (!movie || !movie.name) {
        return Response.error("Không tìm thấy thông tin phim");
    }

    var directors = [];
    if (movie.directors && movie.directors.length) {
        var i;
        for (i = 0; i < movie.directors.length; i++) {
            var d = movie.directors[i];
            if (d && d.name && trimText(d.name) !== "Đang cập nhật") {
                directors.push(trimText(d.name));
            }
        }
    }

    var actors = [];
    if (movie.actors && movie.actors.length) {
        var j;
        for (j = 0; j < movie.actors.length && j < 8; j++) {
            if (movie.actors[j] && movie.actors[j].name) {
                actors.push(trimText(movie.actors[j].name));
            }
        }
    }

    var detailLines = [];
    if (movie.origin_name) detailLines.push("Tên gốc: " + trimText(movie.origin_name));
    if (movie.publish_year) detailLines.push("Năm phát hành: " + movie.publish_year);
    if (movie.episode_current) detailLines.push("Tình trạng: " + trimText(movie.episode_current));
    if (movie.episode_total) detailLines.push("Tổng số tập: " + trimText(movie.episode_total));
    if (movie.episode_time) detailLines.push("Thời lượng: " + trimText(movie.episode_time));
    if (movie.quality) detailLines.push("Chất lượng: " + trimText(movie.quality));
    if (movie.language) detailLines.push("Ngôn ngữ: " + trimText(movie.language));
    if (movie.imdb_rating && String(movie.imdb_rating) !== "0.0" && String(movie.imdb_rating) !== "0") {
        detailLines.push("IMDb: " + movie.imdb_rating);
    }
    if (actors.length) detailLines.push("Diễn viên: " + actors.join(", "));

    var genres = [];
    if (movie.categories && movie.categories.length) {
        var k;
        for (k = 0; k < movie.categories.length; k++) {
            var c = movie.categories[k];
            if (c && c.name && c.slug) {
                genres.push({
                    title: trimText(c.name),
                    input: "cat:" + trimText(c.slug),
                    script: "gen.js"
                });
            }
        }
    }

    var ongoing = trimText(movie.status).toLowerCase() !== "completed";

    return Response.success({
        name: trimText(movie.name),
        cover: fixCover(movie.thumbnail || movie.poster || movie.image_name),
        author: directors.join(", "),
        description: movie.description || "",
        detail: detailLines.join("<br>"),
        url: BASE_URL + "/phim/" + trimText(movie.slug || slug),
        type: "video",
        format: "series",
        ongoing: ongoing,
        nsfw: false,
        locale: "vi",
        genres: genres
    });
}
