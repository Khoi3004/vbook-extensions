load("config.js");

function execute(url) {
    var res = fetchDoc(url, false);
    if (!res.ok) return Response.error(res.error);

    var rows = res.doc.select("#list-chapter-dt ul li");
    var chapters = [];
    var i;
    for (i = 0; i < rows.size(); i++) {
        var row = rows.get(i);
        var style = trimText(row.attr("style")).toLowerCase().replace(/\s+/g, "");
        if (style.indexOf("display:none") !== -1) continue;

        var a = row.select("a.chapter").first();
        if (!a) continue;

        if (trimText(a.attr("data-id")) === "9999") continue;

        var name = trimText(a.text());
        var href = trimText(a.attr("href"));
        if (!name || !href) continue;

        chapters.push({
            name: name,
            url: normalizeUrl(href),
            pay: false,
            lock: false
        });
    }

    chapters.reverse();
    return Response.success(chapters);
}
