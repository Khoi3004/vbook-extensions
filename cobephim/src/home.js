function execute() {
    return Response.success([
        { title: "Đề cử Hot", input: "hot", script: "gen.js" },
        { title: "Phim bộ mới", input: "type:series", script: "gen.js" },
        { title: "Phim lẻ mới", input: "type:movie", script: "gen.js" },
        { title: "Xem nhiều tuần", input: "weekly", script: "gen.js" },
        { title: "Hàn Quốc", input: "reg:han-quoc", script: "gen.js" },
        { title: "Trung Quốc", input: "reg:trung-quoc", script: "gen.js" },
        { title: "Âu Mỹ", input: "reg:au-my", script: "gen.js" }
    ]);
}
