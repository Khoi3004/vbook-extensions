load("config.js");

function execute() {
    var res = fetchDoc("/", false);
    if (!res.ok) return Response.error(res.error);

    var els = res.doc.select("nav.menu-top a.category-detail-1");
    var genres = [];
    var seen = {};
    var i;
    for (i = 0; i < els.size(); i++) {
        var el = els.get(i);
        var title = trimText(el.text());
        var href = trimText(el.attr("href"));
        if (!title || !href) continue;

        var path = extractPath(href);
        if (title === "Tất cả" || path === "/tim-truyen") continue;
        if (seen[path]) continue;
        seen[path] = true;

        genres.push({
            title: title,
            input: path,
            script: "gen.js"
        });
    }

    return Response.success(genres);
}
