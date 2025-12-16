new Vue({
    el: '#app',
    data: {
        isLogin: true,
        loginMethod: 'username', // 默认账号登录
        username: '',
        password: '',
        confirmPassword: '',
        email: '', // 邮箱
        
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
            this.email = '';
            this.loginMethod = 'username'; // 重置为默认登录方式
        },
        
        handleSubmit() {
            if (this.isLogin) {
                this.login();
            } else {
                this.register();
            }
        },
        
        login() {
            if ((this.loginMethod === 'username' && !this.username) || 
                (this.loginMethod === 'email' && !this.email) || 
                !this.password) {
                alert(`请输入${this.loginMethod === 'username' ? '账号' : '邮箱'}和密码`);
                return;
            }
            else if(this.password.length < 6){
                alert('密码不能少于6位');
                return;
            }
            
            console.log('登录信息:', this.loginMethod, this.username, this.email, this.password);
            alert('登录成功！');
        },
        
        register() {
            if (!this.username || !this.password) {
                alert('请输入账号和密码');
                return;
            } else if (this.password.length < 6) {
                alert('密码不能少于6位');
                return;
            } else if (this.password !== this.confirmPassword) {
                alert('输入的密码不一致');
                return;
            }
            
            console.log('注册信息:', this.username, this.email, this.password);
            alert('注册成功！');
            this.isLogin = true;
            this.clearForm();
        },
        
        Email() {
            if (!this.email) {
                alert('请输入邮箱');
                return;
            }
            console.log('邮箱信息:', this.email);
        }
    }
});