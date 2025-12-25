const profileVm = new Vue({
    el: '#app',
    data: {
        list: {},
        isLoggedIn: false
    },
    methods: {
        toggleEditMode() {
            const editButton = document.getElementById('editProfileBtn');
            const inputFields = document.querySelectorAll('.trending-item .trend-name input');
            
            if (editButton.textContent === '编辑资料') {
                editButton.textContent = '保存';
                inputFields.forEach(input => {
                    input.removeAttribute('readonly');
                    input.style.cursor = 'text';
                });
            } else {
                editButton.textContent = '编辑资料';
                inputFields.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    input.style.cursor = 'default';
                });
            }
        },
               // 退出登录
        logout() {
            // 清除localStorage中的用户数据
            localStorage.removeItem('userData');
            // 跳转到登录页面
            location.href = 'login.html';
        },
        // 从localStorage获取用户数据
        getUserData() {
            const userData = localStorage.getItem('userData');
            if (userData) {
                this.list = JSON.parse(userData);
            } else {
                // 如果没有登录数据，跳转到登录页
                location.href = 'login.html';
            }
        }
    },
    mounted() {
        // 获取用户数据
        this.getUserData();
        
        // 初始化输入框状态
        const inputFields = document.querySelectorAll('.trending-item .trend-name input');
        inputFields.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.style.cursor = 'default';
        });
        
        // 绑定按钮事件
        const editButton = document.getElementById('editProfileBtn');
        editButton.addEventListener('click', this.toggleEditMode);
    }
});