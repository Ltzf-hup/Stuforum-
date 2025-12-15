new Vue({
            el: '#app',
            data: {
                isLogin: true,
                username: '',
                password: '',
                confirmPassword: ''
            },
            methods: {
                toggleMode() {
                    this.isLogin = !this.isLogin;
                    this.clearForm();
                },
                
                clearForm() {
                    this.username = '';
                    this.password = '';
                    this.confirmPassword = '';
                },
                
                handleSubmit() {
                    if (this.isLogin) {
                        this.login();
                    } else {
                        this.register();
                    }
                },
                
                login() {
                    if (!this.username || !this.password) {
                        alert('请输入账号和密码');
                        return;
                    }
                    else if(this.password.length<6){
                        alert('密码不能少于6位');
                        return;
                    }
                    
                    console.log('登录信息:', this.username, this.password);
                    alert('登录成功！');
                },
                
                register() {
                    if (!this.username || !this.password) {
                        alert('请输入账号和密码');
                        return;
                    }else if(this.password.length<6){
                        alert('密码不能少于6位');
                        return;
                    }else if (this.password !== this.confirmPassword) {
                        alert('输入的密码不一致');
                        return;
                    }
                    
                    console.log('注册信息:', this.username, this.password);
                    alert('注册成功！');
                    this.isLogin = true;
                    this.clearForm();
                }
            }
        });