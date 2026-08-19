// --- Cookie 辅助函数 ---
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return decodeURIComponent(c.substring(name.length, c.length));
    }
    return "";
}

// --- 刷新界面上的 Storage 显示状态 ---
function renderStorageStatus() {
    let cookieVal = getCookie("user_role");
    let localVal = localStorage.getItem("preferred_theme");
    let sessionVal = sessionStorage.getItem("current_session_id");

    $('#status-cookie').text(cookieVal ? cookieVal : "nondata");
    $('#status-local').text(localVal ? localVal : "nondata");
    $('#status-session').text(sessionVal ? sessionVal : "nondata");
}

// 原生 JS 监听注册表单提交
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault(); // 阻止表单跳转，消除 405 报错
            
            // 1. 获取表单数据（增加读取 password）
            const username = document.getElementById('username').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('password').value; // 👈 新增：读取密码
            
            // 2. 以相同方式保存到 Cookie（保存 7 天）
            setCookie("username", username, 7);
            setCookie("user_email", email, 7);
            setCookie("user_password", password, 7); // 👈 新增：保存密码到 Cookie

            console.log('register information：', username, email, password);
            alert('register successful! Username, Email & Password saved to Cookie.');

            // 3. 清空表单
            registerForm.reset();

            // 4. 动态更新界面显示状态
            if (typeof renderStorageStatus === 'function') {
                renderStorageStatus();
            }
        });
    }
});

$(document).ready(function () {
    // 页面加载完成后立即读取并渲染已存数据
    renderStorageStatus();

    // 1. 点击按钮写入数据
    $('#btn-set-storage').click(function () {
        setCookie("user_role", "Registered_Member", 7); // Cookies 保存 7 天
        localStorage.setItem("preferred_theme", "Dark_Mode"); // LocalStorage 永久保存
        sessionStorage.setItem("current_session_id", "SESS_" + Math.floor(Math.random() * 10000)); // SessionStorage 单次会话

        renderStorageStatus();
        alert("所有 Storage data saved！");
    });

    // 2. 点击按钮清除数据
    $('#btn-clear-storage').click(function () {
        document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user_password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("preferred_theme");
        sessionStorage.removeItem("current_session_id");

        renderStorageStatus();
    });

    // 3. 拦截主注册表单以外的表单提交
    $('form').not('#subscribeForm, #registerForm').submit(function(e) {
        e.preventDefault();

        let inputVal = $(this).find('input[type="email"], input[type="text"]').first().val();

        if (inputVal) {
            setCookie("registered_data", inputVal, 7);
            localStorage.setItem("registered_data", inputVal);
            sessionStorage.setItem("last_action", "Form Submitted");
        }

        alert("Successful! Form data saved to Storage.");
        
        if (typeof renderStorageStatus === 'function') {
            renderStorageStatus();
        }

        // 清空表单
        this.reset();
    });

    // 4. 订阅 Newsletter 表单
    $('#subscribeForm').submit(function(e) {
        e.preventDefault();

        let emailValue = $('#subscribeEmail').val();

        setCookie("user_email", emailValue, 7);
        localStorage.setItem("subscribed_email", emailValue);
        sessionStorage.setItem("user_action", "Subscribed");

        alert("successful！Email saved at Cookie/LocalStorage：" + emailValue);
        
        // 清空输入框
        $('#subscribeEmail').val('');

        renderStorageStatus();
    });

    // 5. jQuery 调用 RESTful API
    $('#btn-fetch-api').click(function () {
        $('#api-loading').show();
        $('#api-result').empty();

        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts?_limit=2',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                $('#api-loading').hide();
                data.forEach(function (post) {
                    $('#api-result').append(`
                        <div style="background: #fff; padding: 10px; border-left: 4px solid #007bff; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <strong style="text-transform: capitalize;">${post.title}</strong>
                            <p style="margin: 5px 0 0 0; color: #555; font-size: 14px;">${post.body}</p>
                        </div>
                    `);
                });
            },
            error: function () {
                $('#api-loading').hide();
                $('#api-result').html('<span style="color:red;">API failed，please check your network settings.</span>');
            }
        });
    });
});