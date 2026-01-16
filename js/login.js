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
            // 简化的登录验证
            if (this.loginData.name === '') {
                this.showMessage('error', '登录失败', '请输入用户名');
                return;
            }
            if (this.loginData.password === '') {
                this.showMessage('error', '登录失败', '请输入密码');
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
                // 不指定dataType，让jQuery自动检测响应类型
                success: (data) => {
                    console.log('登录响应数据:', data, typeof data);

                    // 处理多种可能的成功响应格式
                    if (data === 1 || data === '1') {
                        // 后端返回数字1表示登录成功
                        this.showMessage('success', '登录成功', '登录成功！即将跳转到首页...');
                        // 创建一个简化的用户对象
                        const user = { uname: this.loginData.name };
                        localStorage.setItem('userData', JSON.stringify(user));
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 1000);
                    } else if (data && data.user && data.user.uname) {
                        localStorage.setItem('userData', JSON.stringify(data.user));
                        const token = data.token;
                        localStorage.setItem('token', token);
                        console.log('token:', token);
                        this.showMessage('success', '登录成功', `欢迎您，${data.user.uname}`);
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 1000);
                    } else {
                        const errorMessage = data && data.message ? data.message : '用户名或密码错误';
                        this.showMessage('error', '登录失败', errorMessage);
                        console.error('登录失败:', data);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('登录请求错误:', status, error);
                    console.error('响应内容:', xhr.responseText);

                    // 即使进入error回调，也要检查响应内容是否为数字1
                    if (xhr.responseText === '1') {
                        this.showMessage('success', '登录成功', '登录成功！即将跳转到首页...');
                        const user = { uname: this.loginData.name };
                        localStorage.setItem('userData', JSON.stringify(user));
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 1000);
                    } else {
                        this.showMessage('error', '登录失败', '无法连接到服务器，请稍后重试');
                    }
                }
            });
        },
        // 注册方法
        register() {
            // 注册验证
            if (this.registerData.name === '') {
                this.showMessage('error', '注册失败', '请输入用户名');
                return;
            }
            if (this.registerData.email === '') {
                this.showMessage('error', '注册失败', '请输入邮箱');
                return;
            }
            // 邮箱格式验证
            console.log('正在验证邮箱格式:', this.registerData.email);

            // 严格的邮箱正则表达式
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
            const isValidEmail = emailRegex.test(this.registerData.email);
            console.log('邮箱格式验证结果:', isValidEmail);

            // 检查邮箱结构的合理性
            const domainParts = this.registerData.email.split('@');
            if (domainParts.length !== 2) {
                console.log('邮箱结构错误（@数量不对）');
                this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
                return;
            }

            const domain = domainParts[1];
            const domainSections = domain.split('.');

            // 检查域名部分的合理性
            if (domainSections.length < 2) {
                console.log('域名结构错误（缺少顶级域名）');
                this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
                return;
            }

            // 检查每个域名部分的长度
            const isDomainSectionsValid = domainSections.every(section =>
                section.length > 0 && section.length <= 63 && /^[a-zA-Z0-9-]+$/.test(section)
            );
            console.log('域名部分有效性:', isDomainSectionsValid);

            // 检查顶级域名
            const tld = domainSections[domainSections.length - 1];
            console.log('顶级域名:', tld);

            // 检查是否为常见的邮箱提供商
            const commonProviders = ['qq', 'gmail', '163', '126', 'sina', 'yahoo', 'outlook', 'hotmail'];
            const provider = domainSections[0].toLowerCase();
            console.log('邮箱提供商:', provider);

            // 常见的有效顶级域名列表
            const commonTlds = ['com', 'cn', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'tech', 'top', 'xyz', 'cc', 'biz', 'info'];
            console.log('是否为常见顶级域名:', commonTlds.includes(tld.toLowerCase()));

            // 主要验证逻辑：必须是常见提供商且顶级域名合理
            if (!isValidEmail || !isDomainSectionsValid) {
                console.log('显示邮箱格式错误提示');
                this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
                return;
            }

            // 对于二级域名邮箱（如 qq.com, gmail.com），必须是常见提供商和常见顶级域名
            if (domainSections.length === 2) {
                if (!commonProviders.includes(provider) || !commonTlds.includes(tld.toLowerCase())) {
                    console.log('显示邮箱格式错误提示：不常见的提供商或顶级域名');
                    this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
                    return;
                }
            }

            // 对于多级域名邮箱，确保顶级域名是常见的
            if (domainSections.length > 2) {
                if (!commonTlds.includes(tld.toLowerCase())) {
                    console.log('显示邮箱格式错误提示：不常见的顶级域名');
                    this.showMessage('error', '注册失败', '请输入有效的邮箱地址');
                    return;
                }
            }
            if (this.registerData.password === '') {
                this.showMessage('error', '注册失败', '请输入密码');
                return;
            }
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

            // 发送注册请求
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
                // 不指定dataType，让jQuery自动检测响应类型
                success: (response) => {
                    console.log('注册响应数据:', response, typeof response);

                    // 增强的成功检测逻辑
                    let isSuccess = false;
                    let errorMessage = '注册失败，请稍后重试';

                    // 检查多种可能的成功响应格式
                    if (response === 1 || response === '1') {
                        isSuccess = true;
                    } else if (response && response.status === 'success') {
                        isSuccess = true;
                    } else if (response && response === 'success') {
                        isSuccess = true;
                    } else if (typeof response === 'string' && response.toLowerCase().includes('success')) {
                        isSuccess = true;
                    }

                    // 检查是否有错误信息
                    if (response && response.message) {
                        errorMessage = response.message;
                    }

                    // 检查是否是邮箱已注册的错误
                    if (response && response.message && response.message.includes('UNIQUE KEY') && response.message.includes('email')) {
                        errorMessage = '该邮箱已被注册';
                    }

                    if (isSuccess) {
                        this.showMessage('success', '注册成功', '注册成功！即将跳转到登录页...');
                        setTimeout(() => {
                            location.href = 'login.html';
                        }, 2000);
                    } else {
                        this.showMessage('error', '注册失败', errorMessage);
                        console.error('注册失败:', response);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('注册请求错误:', status, error);
                    console.error('响应内容:', xhr.responseText);

                    // 增强的错误回调检测
                    let isSuccess = false;
                    let errorMessage = '注册失败，请稍后重试';

                    try {
                        // 检查响应内容是否包含成功标志
                        if (xhr.responseText === '1' || xhr.responseText.toLowerCase() === 'success') {
                            isSuccess = true;
                        }

                        // 尝试解析JSON响应
                        const parsedResponse = JSON.parse(xhr.responseText);
                        if (parsedResponse === 1 || parsedResponse.status === 'success' || parsedResponse === 'success') {
                            isSuccess = true;
                        }

                        // 检查是否有错误信息
                        if (parsedResponse && parsedResponse.message) {
                            errorMessage = parsedResponse.message;
                        }
                    } catch (e) {
                        // JSON解析失败，继续检查原始文本
                        if (xhr.responseText.toLowerCase().includes('unique key') && xhr.responseText.toLowerCase().includes('email')) {
                            errorMessage = '该邮箱已被注册';
                        } else if (xhr.responseText.toLowerCase().includes('已被注册') ||
                            xhr.responseText.toLowerCase().includes('duplicate') ||
                            xhr.responseText.toLowerCase().includes('exists')) {
                            errorMessage = '该邮箱已被注册';
                        }
                    }

                    if (isSuccess) {
                        this.showMessage('success', '注册成功', '注册成功！即将跳转到登录页...');
                        setTimeout(() => {
                            location.href = 'login.html';
                        }, 2000);
                    } else {
                        this.showMessage('error', '注册失败', errorMessage);
                    }
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