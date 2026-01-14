const vm = new Vue({
    el: '#app',
    data: {
        isLogin: true,
        loginData: {
            name: '',
            password: ''
        },

        // 注册数据
        registerData: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },

        message: null
    },
    methods: {
        login() {
            // 验证用户名
            if (this.loginData.name === '') {
                this.showMessage('error', '登录失败', '请输入用户名');
                return;
            }
            if (this.loginData.name.length < 3) {
                this.showMessage('error', '登录失败', '用户名长度不能少于3个字符');
                return;
            }

            // 验证密码
            if (this.loginData.password === '') {
                this.showMessage('error', '登录失败', '请输入密码');
                return;
            }
            if (this.loginData.password.length < 6) {
                this.showMessage('error', '登录失败', '密码长度不能少于6个字符');
                return;
            }

            this.showMessage('loading', '处理中', '登录中...');

            $.ajax({
                url: 'http://10.11.192.98:8080/StuForum_war/api/user/login', // 学校IP
                // url: 'http://192.168.86.1:8080/StuForum_war/api/user/login', // 本地IP
                // url: 'http://192.168.1.189:8080/StuForum_war/api/user/login',//家
                type: 'POST',
                data: {
                    uname: this.loginData.name,
                    pwd: this.loginData.password
                },
                dataType: 'json',
                success: (data) => {
                    console.log('登录成功，后端返回数据:', data);
                    if (data && data.user.uname) {
                        this.showMessage('success', '登录成功', `欢迎您，${data.user.uname}`);
                        // 保存用户数据到localStorage
                        localStorage.setItem('userData', JSON.stringify(data.user));
                        // 登录成功后，跳转到首页
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 1000);
                    } else {
                        this.showMessage('error', '登录失败', '用户名或密码错误');
                    }
                },
                error: (status, error) => {
                    console.error('登录失败:', status, error);
                    this.showMessage('error', '登录失败', '无法连接到服务器，请稍后重试');
                },
            });
        },
        // 注册方法
        register() {
            // 验证用户名
            if (this.registerData.name === '') {
                this.showMessage('error', '注册失败', '请输入用户名');
                return;
            }
            if (this.registerData.name.length < 3) {
                this.showMessage('error', '注册失败', '用户名长度不能少于3个字符');
                return;
            }
            if (this.registerData.name.length > 20) {
                this.showMessage('error', '注册失败', '用户名长度不能超过20个字符');
                return;
            }

            // 验证邮箱
            if (this.registerData.email === '') {
                this.showMessage('error', '注册失败', '请输入邮箱');
                return;
            }
            // 使用正则表达式验证邮箱格式
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(this.registerData.email)) {
                this.showMessage('error', '注册失败', '请输入正确的邮箱格式');
                return;
            }

            // 验证密码
            if (this.registerData.password === '') {
                this.showMessage('error', '注册失败', '请输入密码');
                return;
            }
            if (this.registerData.password.length < 6) {
                this.showMessage('error', '注册失败', '密码长度不能少于6位');
                return;
            }
            if (this.registerData.password.length > 20) {
                this.showMessage('error', '注册失败', '密码长度不能超过20位');
                return;
            }

            // 验证确认密码
            if (this.registerData.confirmPassword === '') {
                this.showMessage('error', '注册失败', '请再次输入密码进行确认');
                return;
            }
            if (this.registerData.password !== this.registerData.confirmPassword) {
                this.showMessage('error', '注册失败', '两次输入的密码不一致');
                return;
            }

            // 显示加载状态
            this.showMessage('loading', '处理中', '注册中...');

            // 发送AJAX请求
            $.ajax({
                url: 'http://10.11.192.98:8080/StuForum_war/api/user/register', // 学校IP
                // url: 'http://192.168.86.1:8080/StuForum_war/api/user/register', // 本地IP
                // url: 'http://192.168.1.189:8080/StuForum_war/api/user/register',//家
                type: 'POST',
                data: {
                    uname: this.registerData.name,
                    email: this.registerData.email,
                    pwd: this.registerData.password
                },
                success: () => {

                    // 成功情况
                    this.showMessage('success', '注册成功', '注册成功！即将跳转到登录页...');
                    // 注册成功后，跳转到登录页
                    setTimeout(() => {
                        location.href = 'login.html';
                    }, 2000); // 2秒后跳转


                },
                error: (status, error) => {
                    console.error('注册失败:', status, error);
                    this.showMessage('error', '注册失败', '无法连接到服务器，请稍后重试');
                }
            });
        },

        // 实现showMessage方法
        showMessage(type, title, content) {
            this.message = {
                type: type,
                title: title,
                content: content
            };
        },

        // 实现clearForm方法
        clearForm() {
            this.loginData = { name: '', password: '' };
            this.registerData = { name: '', email: '', password: '', confirmPassword: '' };
            this.message = null;
        }
    }
});