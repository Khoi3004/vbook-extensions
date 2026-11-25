load("config.js");

function execute() {
    console.log("Trang nguồn lấy tên miền: " + HUB_URL);
    console.log("Domain hiện tại: " + BASE_URL);
    console.log("API hiện tại: " + API_ORIGIN);

    var res = resolveDomainFromHub(true);
    if (!res.ok) {
        console.log("Lỗi: " + res.message);
        return Response.error(res.message);
    }

    console.log("Cập nhật thành công -> " + res.message);
    return Response.success(res.message);
}
