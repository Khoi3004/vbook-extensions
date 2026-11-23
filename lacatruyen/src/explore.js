function execute() {
    return Response.success([
        {
            id: "quick_nav",
            title: "Danh mục nhanh",
            subtitle: "",
            type: "chip",
            items: [
                {
                    name: "Mới cập nhật",
                    action: { type: "list", name: "Mới cập nhật", script: "gen.js", input: "updated" }
                },
                {
                    name: "Miễn phí",
                    action: { type: "list", name: "Truyện miễn phí", script: "gen.js", input: "free" }
                },
                {
                    name: "Hoàn thành",
                    action: { type: "list", name: "Đã hoàn thành", script: "gen.js", input: "completed" }
                },
                {
                    name: "Top ngày",
                    action: { type: "list", name: "Đọc nhiều trong ngày", script: "gen.js", input: "top_day" }
                },
                {
                    name: "Top tuần",
                    action: { type: "list", name: "Đọc nhiều trong tuần", script: "gen.js", input: "top_week" }
                },
                {
                    name: "Thịnh hành tháng",
                    action: { type: "list", name: "Thịnh hành tháng", script: "gen.js", input: "trending" }
                },
                {
                    name: "Đề cử biên tập",
                    action: { type: "list", name: "Đề cử biên tập", script: "gen.js", input: "editor_gems" }
                },
                {
                    name: "Đang lên",
                    action: { type: "list", name: "Ngôi sao đang lên", script: "gen.js", input: "rising" }
                }
            ]
        },
        {
            id: "banner",
            title: "",
            subtitle: "",
            type: "banner",
            script: "gen.js",
            input: "editor_gems"
        },
        {
            id: "trending",
            title: "Thịnh hành tháng",
            subtitle: "Được quan tâm nhiều nhất trong tháng",
            type: "horizontal_list",
            script: "gen.js",
            input: "trending",
            more: {
                type: "list",
                name: "Thịnh hành tháng",
                script: "gen.js",
                input: "trending"
            }
        },
        {
            id: "top_week",
            title: "Đọc nhiều trong tuần",
            subtitle: "Bảng xếp hạng lượt đọc tuần",
            type: "ranking",
            script: "gen.js",
            input: "top_week",
            more: {
                type: "list",
                name: "Đọc nhiều trong tuần",
                script: "gen.js",
                input: "top_week"
            }
        },
        {
            id: "free",
            title: "Truyện miễn phí",
            subtitle: "Đọc miễn phí trọn bộ",
            type: "horizontal_list",
            script: "gen.js",
            input: "free",
            more: {
                type: "list",
                name: "Truyện miễn phí",
                script: "gen.js",
                input: "free"
            }
        },
        {
            id: "rising",
            title: "Ngôi sao đang lên",
            subtitle: "Tác phẩm mới nổi bật",
            type: "horizontal_list",
            script: "gen.js",
            input: "rising",
            more: {
                type: "list",
                name: "Ngôi sao đang lên",
                script: "gen.js",
                input: "rising"
            }
        },
        {
            id: "updated",
            title: "Mới cập nhật",
            subtitle: "Truyện vừa ra chương mới",
            type: "grid",
            script: "gen.js",
            input: "updated",
            more: {
                type: "list",
                name: "Mới cập nhật",
                script: "gen.js",
                input: "updated"
            }
        }
    ]);
}
