function execute() {
    return Response.success([
        { title: "Mới cập nhật", input: "updated", script: "gen.js" },
        { title: "Thịnh hành tháng", input: "trending", script: "gen.js" },
        { title: "Đọc nhiều tuần", input: "top_week", script: "gen.js" },
        { title: "Miễn phí", input: "free", script: "gen.js" },
        { title: "Hoàn thành", input: "completed", script: "gen.js" },
        { title: "Đề cử biên tập", input: "editor_gems", script: "gen.js" }
    ]);
}
