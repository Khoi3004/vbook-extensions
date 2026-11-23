load("config.js");

function execute() {
    var res = apiGet("categories/list");
    if (!res.ok) return Response.error(res.error);

    var list = res.data && res.data.data ? res.data.data : [];
    var genres = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        if (item && item.title && item.slug) {
            genres.push({
                title: trimText(item.title),
                input: trimText(item.slug),
                script: "gen.js"
            });
        }
    }
    return Response.success(genres);
}
