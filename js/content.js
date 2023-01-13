var intervalID;
var intervalID2;
var intervalID3;
var checkTime = 0;
var isStop = 0;
// Register callback, triggered when a request is received

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.action == 'start') {

        const keywords = request.keywords.split(',')

        var type = request.type

        var listURL = []

        keywords.map(function(keyword) {

            if (keyword.trim() != '' && keyword.trim() != null && typeof keyword.trim() != 'undefined') {

                if (type == "latest") {
                    listURL.push(`https://m.facebook.com/search/latest/?q=${encodeURIComponent(keyword.trim())}`)
                } else {
                    listURL.push(`https://m.facebook.com/search/top/?q=${encodeURIComponent(keyword.trim())}`)
                }
            }
        })
        sessionStorage.setItem("type_cookie", request.type_cookie);
        sessionStorage.setItem("type", request.type);
        sessionStorage.setItem("tabId", request.tabId)
        sessionStorage.setItem("username", request.username.trim());
        sessionStorage.setItem("wait", request.wait.trim());
        sessionStorage.setItem("time", request.time.trim());
        sessionStorage.setItem("pause", request.pause.trim());
        sessionStorage.setItem("listURL", listURL.toString());
        sessionStorage.setItem("hard_listURL", listURL.toString());
        sessionStorage.setItem("countPostNotFound", 0);
        sessionStorage.setItem("stop", false);
        sessionStorage.setItem("countRequest", 0);
        sessionStorage.setItem("c_user", getCookie('c_user'));
        setCookie("username", request.username.trim(), 30)
        setCookie("listURL", listURL.toString(), 30)
        setCookie("hard_listURL", listURL.toString(), 30)

        sendResponse({ status: true, urlFirst: listURL[0] })

    } else if (request.action == 'stop') {
        // luồng logic của chorm extention:
        // khi mới vào các trang được permission trong tệp manifest
        // thực hiện gắn content.js vào trang đc permission
        // chạy các logic trong file content.js



        // xử lý ở background js.
        // Khai báo các config trong tệp manifest.js=> có file background js, content.js xử lý.
        //     Khi trên fb ấn vào extention này thì kích hoạt hàm click trong background.js; xủ lý lấy dữ liệu=>gửi qua content.js: xử lý lọc để lấy id, post_id, auth id, page id cuối cùng lưu vào clipboard.
        //     file content.js lắng nghe khi bên file background.js kích hoạt hàm
        // chrome.tabs.sendMessage(id, {
        //     type: 'fetched',
        //     url: url,
        //     data: data
        // })
        // thì thực hiện callback() trong onMessage

        // chức năng auto scrll type cookie 1.7.5

        // file content.js

        // khi thực hiện các thao tác ở popup.php: như click start, stop, continue, clear.
        // stop: dừn lại vòng lặp nhưng vẫn lưu các giá trị ở sessions
        // clear: dừng lại các vòng lặp, xóa các giá trị lưu ở sessions, reload lại trang
        //continue:  set session stop =>false, thực hiện reload trang.
        // countNoRes: tăng countPostNotFound sessions lên 1.
        // clearNoRes: set countPostNotFound sessions lại = 0;

        sessionStorage.setItem("stop", true);
        clearInterval(intervalID)
        clearInterval(intervalID2)
        console.log('Pinker Extension Stopped !')
        alert('Pinker Extension Stopped !')

    } else if (request.action == 'clear') {
        clearInterval(intervalID)
        clearInterval(intervalID2)
        try {
            sessionStorage.clear();
            alert('Đã clear toàn bộ dữ liệu ! Vui lòng thao tác lại từ đầu !')
        } catch {
            alert('Có chút vấn đề xảy ra ! Vui lòng f5 và thử lại !')
        }

    } else if (request.action == 'continue') {

        sessionStorage.setItem("stop", false);
        location.reload()

    } else if (request.action == 'countNoRes') {
        let curCount = parseInt(sessionStorage.getItem("countPostNotFound"))
        curCount++
        sessionStorage.setItem("countPostNotFound", curCount)
        console.log('countNoRes', curCount)
    } else if (request.action == 'clearNoRes') {
        console.log('clearNoRes')
        sessionStorage.setItem("countPostNotFound", 0)
    }

    return true

});

intervalID = setInterval(function() {
    sessionStorage.setItem("c_user", getCookie('c_user'));
}, 2000)

if (checkNtScreen()) {
    window.location.href = "m.https://facebook.com";
}
intervalID3 = setInterval(function() {
    var date = new Date(); // Create a Date object to find out what time it is
    console.log('date.getMinutes(): ', date.getMinutes())
    console.log('date.getHours(): ', date.getHours())
    if (date.getHours() >= 1 && date.getHours() < 6) { // Check the time: 00h - 6h là tắt
        checkTime = 1;
        sessionStorage.setItem("stop", true);
        clearInterval(intervalID)
        clearInterval(intervalID2)
        console.log('Pinker Extension Stopped !')
            // alert('Pinker Extension Stopped !')
        isStop = 1;
    } else {
        checkTime = 0;
        console.log("Đang trong thời gian bật content2 1111111111111111!!!!!!!!!!!");
        sessionStorage.setItem("stop", false);
        if (isStop == 1) {
            isStop = 0
            location.reload()
        }

    }
}, 30000)


if (sessionStorage.getItem("stop") == 'false') {


    if (!checkPoint()) {

        if (!checkFacebookSearch()) {

            try {

                var listURL = sessionStorage.getItem("listURL").split(',');
                location.replace(listURL[0])

            } catch {

                alert('Cần nhập danh sách từ khóa')

            }

        } else {

            scrollStart(sessionStorage.getItem("time"), sessionStorage.getItem("pause"), sessionStorage.getItem("wait"))

        }
    }
}


// Scroll auto
function scrollStart(time = 5, pause = 30, wait = 3000) {
    console.log('11123123123123123123123123123')
    sessionStorage.setItem("c_user", getCookie('c_user'));
    console.log('Pinker Extension Scrolling !')

    intervalID = setInterval(function() {

        console.log(`-------Đang chạy té khói: ${time} giây`)
        console.log('-------Cookie đang sử dụng: ' + getCookie('c_user'))

        time--

        if (time < 1) {

            try {

                console.log('Đang lấy listURL từ sessionStorage')
                var listURL = sessionStorage.getItem("listURL").split(',');
                var hard_listURL = sessionStorage.getItem("hard_listURL").split(',');

            } catch {

                try {

                    console.log('Đang lấy listURL từ Cookie')
                    var listURL = getCookie("listURL").split(',');
                    var hard_listURL = getCookie("hard_listURL").split(',');

                } catch {

                    // clearInterval(intervalID)
                    // alert('Đã có lỗi xảy ra: Không lấy được listURL, vui lòng chạy lại !')
                    console.log('Đã có lỗi xảy ra: Không lấy được listURL, vui lòng chạy lại !')
                    return location.reload()

                }

            }

            if (typeof listURL == 'undefined' || typeof hard_listURL == 'undefined') {
                // clearInterval(intervalID)
                console.log('Không lấy dược listURL ! Vui lòng chạy lại danh sách từ khóa')
                    // alert('Không lấy dược listURL ! Vui lòng chạy lại danh sách từ khóa')
                return location.reload()
            }

            // getFbID()
            postDB()

            listURL.shift()
            sessionStorage.setItem("listURL", listURL.toString());

            console.log(`listURL: ${listURL.length}`);

            if (listURL.length > 0) {
                console.log(`1111111111111111111111111111111111111111111111111111111111111111`)
                return location.replace(listURL[0]);
            } else {
                console.log(`2222222222222222222222222222222222222222222222222222222222222222`)
                listURL = hard_listURL
                sessionStorage.setItem("listURL", listURL.toString());
                clearInterval(intervalID)
                intervalID2 = setInterval(function() {
                    console.log(`Đang đình công: ${pause} giây`)
                    pause -= 1

                    if (pause < 1) {
                        clearInterval(intervalID2)
                        return location.replace(listURL[0]);
                    }

                }, 1000)

            }


        }

        window.scrollTo(0, document.body.scrollHeight)

    }, wait);

}

function postDB() {

    var countRequest = parseInt(sessionStorage.getItem("countRequest"));
    countRequest += 1;
    sessionStorage.setItem("countRequest", countRequest)

    if (parseInt(sessionStorage.getItem("countPostNotFound")) > 5) {
        clearInterval(intervalID)
        clearInterval(intervalID2)
        telegramAlert(`${sessionStorage.getItem("username")} đã search ${parseInt(sessionStorage.getItem("countPostNotFound"))} từ khóa liên tiếp mà không có kết quả ! Vui lòng đổi tài khoản khác & chạy lại`)
    }

    console.log('Send message insert DB')
    chrome.runtime.sendMessage({
        tabId: parseInt(sessionStorage.getItem("tabId")),
        script: `console.log("START INSERT DATABASE");`,
        data: JSON.stringify({
            c_user: sessionStorage.getItem("c_user"),
            username: sessionStorage.getItem("username"),
            wait: sessionStorage.getItem("wait"),
            time: sessionStorage.getItem("time"),
            type: sessionStorage.getItem("type"),
            pause: sessionStorage.getItem("pause"),
            type_cookie: sessionStorage.getItem("type_cookie"),
            url: window.location.href,
            cookie: getCookie('c_user'),
            date_ago: null,
        })
    });
}

// Check facebook/checkpoint
function checkPoint() {
    const fullURL = window.location.href;
    return fullURL.includes("/checkpoint/")
}

// Check facebook/search
function checkFacebookSearch() {
    const fullURL = window.location.href;
    return fullURL.includes("facebook.com/search")
}

function checkNtScreen() {
    const fullURL = window.location.href;
    return fullURL.includes("nt/screen") || fullURL.includes("error")
}

function setCookie(name, value, days = 1) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

function telegramAlert(msg = 'Monitaz Auto Scroll ') {

    var token = "bot1215313321:AAEH5bfYJ17FZklWzIzx353Cb9pi0qctUJk"
    var chatID = "-425966865"

    var url = `https://api.telegram.org/${token}/sendMessage?parse_mode=html&chat_id=${chatID}&text=${encodeURIComponent(msg)}`;
    var options = { method: 'GET' };
    fetch(url, options);
}

console.log('Check facebook checkpoint: ' + checkPoint())
console.log('Check facebook search: ' + checkFacebookSearch())
console.log('content.js')
