class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";  //  默认是WEB来的
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = ""
        this.photo = ""

        //  整个登录的界面
        this.$settings = $(` 
<div class="ac-game-settings">
    <div class="ac-game-settings-login">

        <div class="ac-game-settings-title">
            Welcome to Battle of Balls !
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="your username">
            </div>
        </div>

        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="your password">
            </div>
        </div>

        <div class="ac-game-settings-submit">
            <div class ="ac-game-settings-item">
                <button>login</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            register
        </div>
        <br>

        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app2444.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing One Click Login
            </div>
        </div>
    </div>
    
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            Register
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="your username">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="your password">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="confirm your password">
            </div>
        </div>

        <div class="ac-game-settings-submit">
            <div class ="ac-game-settings-item">
                <button>register</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            login
        </div>  
        <br>

        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app2444.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing One Click Login
            </div>
        </div>
    </div>

</div>
`);
        //  .find()就是把上面创造的部件对象取出来好加上逻辑
        this.$login = this.$settings.find(".ac-game-settings-login");  //  登录框
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input"); //  不是同一级要用空格隔开
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");  //  注册框
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find(".ac-game-settings-acwing img");
        this.root.$ac_game.append(this.$settings);  //  将登录界面加到窗口里去

        this.start();
    }

    start() {
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function () {
            outer.acwing_login();
        });
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote();  //  点了登录按钮就会调用远程登录函数
        });
    }

    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function () {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();  //  点了注册按钮就会调用远程注册函数
        });
    }

    acwing_login() {
        $.ajax({
            url: "https://app2444.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url)  //  当前页面重定向
                }
            }
        });
    }


    login_on_remote() {  //  在远程服务器登录
        let outer = this;
        let username = this.$login_username.val();  //  取出来input的值
        let password = this.$login_password.val();
        this.$login_error_message.empty();  //  把上次的error_masssage清空

        $.ajax({  //  登录函数
            url: "https://app2444.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();  //  刷新, 一旦登录成功就会在cookie里记录信息,下次直接进入菜单页面不用再输密码
                } else {
                    outer.$login_error_message.html(resp.result);  // 如果失败就要把信息显示出来
                }
            }
        });
    }

    register_on_remote() {  //  在远程的服务器上注册
        let outer = this;
        let username = this.$register_username.val();  //  val()取出input的值
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app2444.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm, //  传给后端验证
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();  //  刷新页面
                }
                else {
                    outer.$register_error_message.html(resp.result);
                }
            }

        });
    }

    logout_on_remote() {  //  在远程服务器上登出
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app2444.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function (resp) {
                    if (resp.result === "success") {
                        location.reload();
                    }
                }
            });
        }
    }

    register() {  //  打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  //  打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }


    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app2444.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app2444.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else { //  如果不成功

                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();  //  隐藏登录界面
    }

    show() {
        this.$settings.show();  //  展示登录界面
    }
}