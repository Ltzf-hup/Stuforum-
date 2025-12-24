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
                    url: 'http://10.11.192.192:8080/login',
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
                            console.log(data && data.uname);
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
            if (this.registerData.name === '' || this.registerData.email === '' || this.registerData.password === '') {
                this.showMessage('error', '注册失败', '请填写所有必填字段');
                return;
            }
            
            // 2. 密码一致性验证
            if (this.registerData.password !== this.registerData.confirmPassword) {
                this.showMessage('error', '注册失败', '两次输入的密码不一致');
                return;
            }
            
            // 3. 密码长度验证
            if (this.registerData.password.length < 6) {
                this.showMessage('error', '注册失败', '密码长度不能少于6位');
                return;
            }
            
            // 显示加载状态
            this.showMessage('loading', '处理中', '注册中...');
            
            // 发送AJAX请求
            $.ajax({
                url: 'http://10.11.192.192:8080/login-r',
                type: 'POST',
                data: {
                    uname: this.registerData.name,
                    email: this.registerData.email,
                    pwd: this.registerData.password
                },
                success: () => {
                
                        // 成功情况
                        this.showMessage('success', '注册成功', '注册成功！即将跳转到登录页...');
                   
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
            this.loginData = { uname: '', pwd: '' };
            this.registerData = { uname: '', email: '', pwd: '', confirmPassword: '' };
            this.message = null;
        }
    }
});