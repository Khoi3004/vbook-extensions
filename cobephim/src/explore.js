function execute() {
    return Response.success([
        {
            id: "quick_nav",
            title: "Danh mục nhanh",
            subtitle: "",
            type: "chip",
            items: [
                {
                    name: "Phim bộ",
                    action: { type: "list", name: "Phim bộ mới", script: "gen.js", input: "type:series" }
                },
                {
                    name: "Phim lẻ",
                    action: { type: "list", name: "Phim lẻ mới", script: "gen.js", input: "type:movie" }
                },
                {
                    name: "Xem nhiều tuần",
                    action: { type: "list", name: "Xem nhiều trong tuần", script: "gen.js", input: "weekly" }
                },
                {
                    name: "Hàn Quốc",
                    action: { type: "list", name: "Phim Hàn Quốc", script: "gen.js", input: "reg:han-quoc" }
                },
                {
                    name: "Trung Quốc",
                    action: { type: "list", name: "Phim Trung Quốc", script: "gen.js", input: "reg:trung-quoc" }
                },
                {
                    name: "Âu Mỹ",
                    action: { type: "list", name: "Phim Âu Mỹ", script: "gen.js", input: "reg:au-my" }
                },
                {
                    name: "Hoạt hình",
                    action: { type: "list", name: "Phim Hoạt Hình", script: "gen.js", input: "cat:hoat-hinh" }
                }
            ]
        },
        {
            id: "banner",
            title: "",
            subtitle: "",
            type: "banner",
            script: "gen.js",
            input: "hot"
        },
        {
            id: "weekly",
            title: "Xem nhiều trong tuần",
            subtitle: "Top phim được xem nhiều nhất tuần",
            type: "ranking",
            script: "gen.js",
            input: "weekly",
            more: {
                type: "list",
                name: "Xem nhiều trong tuần",
                script: "gen.js",
                input: "weekly"
            }
        },
        {
            id: "bilingual",
            title: "Phim Song Ngữ",
            subtitle: "Vừa xem phim vừa luyện ngoại ngữ",
            type: "horizontal_list",
            script: "gen.js",
            input: "collection:0",
            more: {
                type: "list",
                name: "Phim Song Ngữ",
                script: "gen.js",
                input: "collection:0"
            }
        },
        {
            id: "movies",
            title: "Phim lẻ mới",
            subtitle: "Phim điện ảnh chọn lọc",
            type: "horizontal_list",
            script: "gen.js",
            input: "type:movie",
            more: {
                type: "list",
                name: "Phim lẻ mới",
                script: "gen.js",
                input: "type:movie"
            }
        },
        {
            id: "series",
            title: "Phim bộ mới cập nhật",
            subtitle: "Cập nhật tập mới mỗi ngày",
            type: "grid",
            script: "gen.js",
            input: "type:series",
            more: {
                type: "list",
                name: "Phim bộ mới cập nhật",
                script: "gen.js",
                input: "type:series"
            }
        }
    ]);
}
