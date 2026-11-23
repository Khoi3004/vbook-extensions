function execute() {
    return Response.success([
        {
            id: "quick_nav",
            title: "Danh mục nhanh",
            subtitle: "",
            type: "chip",
            items: [
                {
                    name: "Theo dõi",
                    action: { type: "list", name: "Truyện đang theo dõi", script: "gen.js", input: "/follow" }
                },
                {
                    name: "Top ngày",
                    action: { type: "list", name: "Top Ngày", script: "gen.js", input: "/tim-truyen?sort=6" }
                },
                {
                    name: "Top tuần",
                    action: { type: "list", name: "Top Tuần", script: "gen.js", input: "/tim-truyen?sort=5" }
                },
                {
                    name: "Top tháng",
                    action: { type: "list", name: "Top Tháng", script: "gen.js", input: "/tim-truyen?sort=3" }
                },
                {
                    name: "Top All",
                    action: { type: "list", name: "Top Tất Cả", script: "gen.js", input: "/tim-truyen?sort=2" }
                },
                {
                    name: "Truyện Hot",
                    action: { type: "list", name: "Truyện Hot", script: "gen.js", input: "/hot" }
                },
                {
                    name: "Hoàn thành",
                    action: { type: "list", name: "Đã Hoàn Thành", script: "gen.js", input: "/tim-truyen?status=1" }
                },
                {
                    name: "Con trai",
                    action: { type: "list", name: "Truyện Con Trai", script: "gen.js", input: "/truyen-con-trai" }
                },
                {
                    name: "Con gái",
                    action: { type: "list", name: "Truyện Con Gái", script: "gen.js", input: "/truyen-con-gai" }
                }
            ]
        },
        {
            id: "follow",
            title: "Đang theo dõi",
            subtitle: "Danh sách truyện bạn đang theo dõi",
            type: "horizontal_list",
            script: "gen.js",
            input: "/follow",
            more: {
                type: "list",
                name: "Truyện đang theo dõi",
                script: "gen.js",
                input: "/follow"
            }
        },
        {
            id: "hot_banner",
            title: "",
            subtitle: "",
            type: "banner",
            script: "gen.js",
            input: "/hot"
        },
        {
            id: "top_day",
            title: "Top Ngày",
            subtitle: "Đọc nhiều nhất hôm nay",
            type: "ranking",
            script: "gen.js",
            input: "/tim-truyen?sort=6",
            more: {
                type: "list",
                name: "Top Ngày",
                script: "gen.js",
                input: "/tim-truyen?sort=6"
            }
        },
        {
            id: "top_week",
            title: "Top Tuần",
            subtitle: "Nổi bật trong tuần",
            type: "horizontal_list",
            script: "gen.js",
            input: "/tim-truyen?sort=5",
            more: {
                type: "list",
                name: "Top Tuần",
                script: "gen.js",
                input: "/tim-truyen?sort=5"
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
