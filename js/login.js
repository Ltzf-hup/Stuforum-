new Vue({
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
                if (this.loginData.name === '' || this.loginData.password === '') {
                    this.showMessage('error', '登录失败', '请输入用户名和密码');
                    return;
                }
                
                this.showMessage('loading', '处理中', '登录中...');
                
                $.ajax({
                    url: 'http://10.11.192.162:8080/StuForum_Web_exploded/login',
                    type: 'POST',
                    data: {
                        uname: this.loginData.name,
                        password: this.loginData.password
                    },
                    dataType: 'json',
                    success: (data) => {
                        console.log('登录成功，后端返回数据:', data);

                        if (data && data[0].uname) {
                            this.showMessage('success', '登录成功', `欢迎您，${data[0].uname}`);
                            location.href = 'index.html';
                        } else {
                            this.showMessage('error', '登录失败', '用户名或密码错误');
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error('登录失败:', status, error);
                        this.showMessage('error', '登录失败', '无法连接到服务器，请稍后重试');
                    }
                });
            },
            
            // 注册方法
            register() {
                // 表单验证
                if (this.registerData.name === '' || this.registerData.password === '') {
                    this.showMessage('error', '注册失败', '请输入用户名和密码');
                    return;
                }
                
                if (this.registerData.password !== this.registerData.confirmPassword) {
                    this.showMessage('error', '注册失败', '两次输入的密码不一致');
                    return;
                }
                
                if (this.registerData.password.length < 6) {
                    this.showMessage('error', '注册失败', '密码长度不能少于6位');
                    return;
                }
                
                // 显示加载状态
                this.showMessage('loading', '处理中', '注册中...');
                
                // 发送AJAX请求
                $.ajax({
                    url: 'http://10.11.192.162:8080/StuForum_Web_exploded/register', // 假设注册接口
                    type: 'POST',
                    data: {
                        uname: this.registerData.name,
                        email: this.registerData.email,
                        password: this.registerData.password
                    },
                    dataType: 'json',
                    success: (data) => {
                        console.log('注册成功', data);
                        
                        if (data && data[0].uname) {
                            this.showMessage('success', '注册成功', `注册成功！欢迎您，${data[0].uname}`);
                            // 切换到登录模式
                            setTimeout(() => {
                                this.isLogin = true;
                                this.clearForm();
                            }, 1500);
                        } else {
                            this.showMessage('error', '注册失败', '注册失败，请稍后重试');
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error('注册失败:', status, error);
                        this.showMessage('error', '注册失败', '无法连接到服务器，请稍后重试');
                    }
                });
            },
            
            // 显示消息
            showMessage(type, title, content) {
                this.message = {
                    type: type,
                    title: title,
                    content: content
                };
            },
            
            // 清空表单
            clearForm() {
                this.loginData = { name: '', password: '' };
                this.registerData = { name: '', email: '', password: '', confirmPassword: '' };
                this.message = null;
            }
        }
    });