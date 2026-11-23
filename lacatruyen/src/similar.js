load("config.js");

function execute(input, page) {
    var storyId = trimText(input);
    if (!storyId) return Response.success([], "");

    var res = apiGet("stories/similar?story_id=" + encodeURIComponent(storyId) + "&limit=12");
    if (!res.ok) return Response.error(res.error);

    var rows = res.data && res.data.data ? res.data.data : [];
    return Response.success(mapStoryList(rows), "");
}
