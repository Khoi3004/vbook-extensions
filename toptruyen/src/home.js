function execute() {
    return Response.success([
        { title: "Mới cập nhật", input: "/", script: "gen.js" },
        { title: "Truyện Hot", input: "/hot", script: "gen.js" },
        { title: "Hoàn thành", input: "/tim-truyen?status=1", script: "gen.js" },
        { title: "Con trai", input: "/truyen-con-trai", script: "gen.js" },
        { title: "Con gái", input: "/truyen-con-gai", script: "gen.js" },
        { title: "Theo dõi", input: "/follow", script: "gen.js" }
    ]);
}
