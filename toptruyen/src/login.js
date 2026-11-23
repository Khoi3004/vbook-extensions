load("config.js");

function execute() {
    console.log("Domain hiện tại: " + BASE_URL);
    if (!USER_EMAIL || !USER_PASSWORD) {
        return Response.error("Vui lòng nhập Email và Mật khẩu trong Cài đặt tiện ích trước.");
    }

    console.log("Đang kiểm tra / đăng nhập tài khoản: " + USER_EMAIL);
    clearLoginCache();
    var res = ensureLogin(true);
    if (res.ok) {
        console.log(res.message);
        return Response.success(res.message);
    }

    console.log("Lỗi: " + res.message);
    return Response.error(res.message);
}
