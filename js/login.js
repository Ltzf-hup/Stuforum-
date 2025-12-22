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

                        if (data && data[0].uname) {
                            this.showMessage('success', '登录成功', `欢迎您，${data[0].uname}`);
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
           // 注册方法
register() {
    // 表单验证
    // 1. 清除首尾空格
    this.registerData.name = this.registerData.name.trim();
    this.registerData.email = this.registerData.email.trim();
    this.registerData.password = this.registerData.password.trim();
    this.registerData.confirmPassword = this.registerData.confirmPassword.trim();
    
    // 2. 必填项验证
    if (this.registerData.name === '' || this.registerData.email === '' || this.registerData.password === '') {
        this.showMessage('error', '注册失败', '请填写所有必填字段');
        return;
    }
    
    // 3. 用户名长度验证
    if (this.registerData.name.length < 2 || this.registerData.name.length > 20) {
        this.showMessage('error', '注册失败', '用户名长度应在2-20个字符之间');
        return;
    }
    
    // 4. 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
        this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
        return;
    }
    
    // 5. 密码验证
    if (this.registerData.password.length < 6) {
        this.showMessage('error', '注册失败', '密码长度不能少于6位');
        return;
    }
    
    // 密码复杂度验证（可根据需求调整）
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(this.registerData.password)) {
        this.showMessage('error', '注册失败', '密码应至少包含字母和数字');
        return;
    }
    
    // 6. 确认密码验证
    if (this.registerData.password !== this.registerData.confirmPassword) {
        this.showMessage('error', '注册失败', '两次输入的密码不一致');
        return;
    }
    
    // 显示加载状态
    this.showMessage('loading', '处理中', '注册中...');
    
    // 发送AJAX请求
    $.ajax({
        url: 'http://10.11.192.162:8080/StuForum_Web_exploded/register', // 配置实际的注册接口URL
        type: 'POST',
        data: {
            uname: this.registerData.name,
            email: this.registerData.email,
            password: this.registerData.password // 注意：实际项目中应使用加密后的密码
        },
        dataType: 'json',
        success: (data) => {
            console.log('注册成功，后端返回数据:', data);
            
            if (data && data[0].uname) {
                this.showMessage('success', '注册成功', `注册成功！欢迎您，${data[0].uname}`);
                // 切换到登录模式
                setTimeout(() => {
                    this.isLogin = true;
                    this.clearForm();
                }, 1500);
            } else if (data && data.error) {
                this.showMessage('error', '注册失败', data.error);
            } else {
                this.showMessage('error', '注册失败', '注册失败，请稍后重试');
            }
        },
        error: (xhr, status, error) => {
            console.error('注册失败:', status, error);
            
            // 根据不同的错误类型显示不同的错误信息
            if (status === 'timeout') {
                this.showMessage('error', '注册失败', '连接超时，请检查网络连接');
            } else if (status === 'error') {
                this.showMessage('error', '注册失败', '服务器错误，请稍后重试');
            } else {
                this.showMessage('error', '注册失败', '注册失败，请稍后重试');
            }
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