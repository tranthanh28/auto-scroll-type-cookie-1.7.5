$(document).ready(function(){

    $('#start').click(function(){

        var type = $("input[name='type']:checked").val();
        var keywords = $('#keywords').val().trim();
        var time = $('#time').val().trim();
        var pause = $('#pause').val().trim();
        var wait = $('#wait').val().trim();
        var username = $('#username').val().trim();
        var type_cookie = $('#type_cookie').val().trim();

        localStorage.setItem('type', type)

        if(keywords != '' && time != '' && pause != '' && wait != '' && username != '' && type_cookie != '') {
                chrome.storage.sync.set({
                    "keywords": keywords,
                    "time" : time,
                    "pause" : pause,
                    "wait" : wait,
                    "username" : username,
                    "type_cookie" : type_cookie
                }, function() {
                    console.log("Settings saved");
                });
                
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "start",
                        keywords: keywords,
                        time: time,
                        pause: pause,
                        wait: wait,
                        username: username,
                        type: type,
                        type_cookie: type_cookie
                    }, function(response){
                        if(!response) {
                            
                            console.log('Not found response')
    
                        } else {
    
                            chrome.tabs.update({ url: response.urlFirst });
                     
                        }
                    })
                })
            
        } else {
            alert('"Mã tài khoản + keyword + thời gian chạy + thời gian nghỉ + thời gian đợi + Máy chủ" không để trống')
        }
        
    })

    $('#stop').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response){
                
            })
        })
    })

    $('#clear').click(function(){
        if(confirm("Bạn chắc chắn muốn xóa dữ liệu")) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {action: "clear"}, function(response){
                    
                })
            })
        }
    })

    $('#continue').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "continue"}, function(response){
                
            })
        })
    })

    chrome.storage.sync.get(["keywords", "time", "pause", "wait", "username", "type_cookie"], function(items) {
        document.getElementById("keywords").value = items["keywords"] || "";
        document.getElementById("time").value = items["time"] || "";
        document.getElementById("pause").value = items["pause"] || "";
        document.getElementById("wait").value = items["wait"] || "";
        document.getElementById("username").value = items["username"] || "";
        document.getElementById("type_cookie").value = items["type_cookie"] || "";
    });
})

var radios = document.getElementsByName("type");
var val = localStorage.getItem('type');
for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
        radios[i].checked = true;
    }
}