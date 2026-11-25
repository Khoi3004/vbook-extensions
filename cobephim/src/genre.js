load("config.js");

function execute() {
    var genres = [];
    var seenKey = {};

    var catRes = apiGet("/categories?limit=100");
    if (!catRes.ok) return Response.error(catRes.error);

    var cats = catRes.data && catRes.data.data ? catRes.data.data : [];
    var i;
    for (i = 0; i < cats.length; i++) {
        var c = cats[i];
        if (!c || !c.name || !c.slug) continue;
        var cName = trimText(c.name);
        var cSlug = trimText(c.slug);
        if (!cName || !cSlug) continue;
        var dedupKey = "cat:" + cName.toLowerCase();
        if (seenKey[dedupKey] || seenKey["slug:" + cSlug]) continue;
        seenKey[dedupKey] = true;
        seenKey["slug:" + cSlug] = true;
        genres.push({
            title: cName,
            input: "cat:" + cSlug,
            script: "gen.js"
        });
    }

    var regRes = apiGet("/regions?limit=100");
    if (regRes.ok && regRes.data && regRes.data.data) {
        var regs = regRes.data.data;
        for (i = 0; i < regs.length && i < 30; i++) {
            var r = regs[i];
            if (!r || !r.name || !r.slug) continue;
            var rName = trimText(r.name);
            var rSlug = trimText(r.slug);
            if (!rName || !rSlug) continue;
            var rKey = "reg:" + rName.toLowerCase();
            if (seenKey[rKey] || seenKey["rslug:" + rSlug]) continue;
            seenKey[rKey] = true;
            seenKey["rslug:" + rSlug] = true;
            genres.push({
                title: "Quốc gia: " + rName,
                input: "reg:" + rSlug,
                script: "gen.js"
            });
        }
    }

    return Response.success(genres);
}
