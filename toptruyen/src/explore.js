function execute() {
    return Response.success([
        {
            id: "hot_banner",
            title: "",
            subtitle: "",
            type: "banner",
            script: "gen.js",
            input: "/hot"
        },
        {
            id: "boy",
            title: "Truyện Con Trai",
            subtitle: "Hành động, huyền huyễn, võ thuật",
            type: "horizontal_list",
            script: "gen.js",
            input: "/truyen-con-trai",
            more: {
                type: "list",
                name: "Truyện Con Trai",
                script: "gen.js",
                input: "/truyen-con-trai"
            }
        },
        {
            id: "girl",
            title: "Truyện Con Gái",
            subtitle: "Ngôn tình, xuyên không, học đường",
            type: "horizontal_list",
            script: "gen.js",
            input: "/truyen-con-gai",
            more: {
                type: "list",
                name: "Truyện Con Gái",
                script: "gen.js",
                input: "/truyen-con-gai"
            }
        },
        {
            id: "completed",
            title: "Đã Hoàn Thành",
            subtitle: "Đọc trọn bộ không cần chờ",
            type: "horizontal_list",
            script: "gen.js",
            input: "/tim-truyen?status=1",
            more: {
                type: "list",
                name: "Đã Hoàn Thành",
                script: "gen.js",
                input: "/tim-truyen?status=1"
            }
        },
        {
            id: "latest",
            title: "Mới cập nhật",
            subtitle: "Chương mới nhất trong ngày",
            type: "grid",
            script: "gen.js",
            input: "/",
            more: {
                type: "list",
                name: "Mới cập nhật",
                script: "gen.js",
                input: "/"
            }
        }
    ]);
}
