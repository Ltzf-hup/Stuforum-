// 扩展Vue的过滤器
Vue.filter('truncate', function (value, length) {
    if (!value) return '';
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
});



new Vue({
    el: '#app',
    data: {
        list: {
            uname: '',
            email: '',
            intro: '',
            college: '',
            grade: '',
            major: '',
            hobby: '',
            avatarUrl: ''
        },
        forumlists: [],
        isEditing: false,
        isLoggedIn: false,
        originalData: {},
        message: '',
        messageType: '',
        fieldErrors: {},
        showSettings: false,
        selectedPosts: [],
        showPostSelect: false
    },
    computed: {
        // 计算头像样式
        avatarStyle() {
            const colors = [
                '#10ac84', '#5f27cd', '#ee5253', '#0abde3',
                '#ff9f43', '#222f3e', '#8395a7', '#54a0ff'
            ];

            let color = '#2c7be5'; // 默认颜色

            if (this.list.uname && this.list.uname.length > 0) {
                const firstChar = this.list.uname.charAt(0).toUpperCase();
                const charCode = firstChar.charCodeAt(0);
                const colorIndex = charCode % colors.length;
                color = colors[colorIndex];
            }

            return {
                'width': '100px',
                'height': '100px',
                'font-size': '3rem',
                'background-color': color,
                'margin-bottom': '1rem',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'color': 'white',
                'border-radius': '50%',
                'font-weight': 'bold'
            };
        },

        // 计算表单是否有错误
        hasFormErrors() {
            return Object.keys(this.fieldErrors).length > 0;
        }
    },
    methods: {
        async profileFor() {
            console.log(this.list.uname)
            const url =
                `http://192.168.86.1:8080/StuForum_war/api/forum/Son?uname=${(this.list.uname)}`; // 本地IP
            //查询用户帖子数据

            const response = await fetch(url);
            const data = await response.json();
            this.forumlists = data;
        },
        // 保存用户数据到localStorage
        saveUserData() {
            localStorage.setItem('userData', JSON.stringify(this.list));
        },
        // 退出登录
        logout() {
            // 清除localStorage中的用户数据
            localStorage.removeItem('userData');
            // 清除token
            localStorage.removeItem('token');
            // 跳转到登录页面
            location.href = 'login.html';
        },
        deleteAllPosts() {

        },
        // 开始编辑
        startEditing() {
            // 保存原始数据
            this.originalData = JSON.parse(JSON.stringify(this.list));
            this.isEditing = true;
            this.clearMessage();
        },

        // 取消编辑
        cancelEditing() {
            // 恢复原始数据
            this.list = JSON.parse(JSON.stringify(this.originalData));
            this.isEditing = false;
            this.fieldErrors = {};
            this.showMessage('已取消编辑', 'success');
        },
        // 触发文件输入框
        triggerFileInput() {
            document.getElementById('avatarInput').click();
        },

        // 保存资料
        async saveProfile() {
            try {
                // 验证表单
                if (!this.validateForm()) {
                    this.showMessage('请修正表单错误', 'error');
                    return;
                }

                // 显示保存中
                this.showMessage('保存中...', '');

                // 1. 保存到localStorage
                localStorage.setItem('userData', JSON.stringify(this.list));

                // 2. 保存到数据库
                const saveSuccess = await this.saveToDatabase();

                if (saveSuccess) {
                    // 退出编辑模式
                    this.isEditing = false;
                    this.originalData = JSON.parse(JSON.stringify(this.list));
                    this.fieldErrors = {};

                    // 显示成功消息
                    this.showMessage('资料更新成功！', 'success');

                    // 更新页面其他地方的显示（如果有的话）
                    this.updateGlobalUserData();
                } else {
                    this.showMessage('保存失败，请重试', 'error');
                }

            } catch (error) {
                console.error('保存失败:', error);
                this.showMessage('保存失败，请检查网络连接', 'error');
            }
        },


        // 验证表单
        validateForm() {
            this.fieldErrors = {};

            // 验证用户名
            if (!this.list.uname || this.list.uname.trim() === '') {
                this.fieldErrors.uname = '用户名不能为空';
            } else if (this.list.uname.length < 2) {
                this.fieldErrors.uname = '用户名至少2个字符';
            }

            // 验证邮箱
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!this.list.email || !emailRegex.test(this.list.email)) {
                this.fieldErrors.email = '请输入有效的邮箱地址';
            }

            // 验证简介长度
            if (this.list.intro && this.list.intro.length > 500) {
                this.fieldErrors.intro = '个人简介不能超过500字';
            }

            // 验证学院和专业长度
            if (this.list.college && this.list.college.length > 20) {
                this.fieldErrors.college = '学院名称不能超过20字';
            }

            if (this.list.major && this.list.major.length > 20) {
                this.fieldErrors.major = '专业名称不能超过20字';
            }

            // 验证兴趣爱好长度
            if (this.list.hobby && this.list.hobby.length > 100) {
                this.fieldErrors.hobby = '兴趣爱好不能超过100字';
            }

            return Object.keys(this.fieldErrors).length === 0;
        },


        // 验证单个字段
        validateField(fieldName, event) {
            // 移除该字段的错误
            if (this.fieldErrors[fieldName]) {
                delete this.fieldErrors[fieldName];
            }

            // 根据字段名进行验证
            switch (fieldName) {
                case 'uname':
                    if (!this.list.uname || this.list.uname.trim() === '') {
                        this.fieldErrors.uname = '用户名不能为空';
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!this.list.email || !emailRegex.test(this.list.email)) {
                        this.fieldErrors.email = '请输入有效的邮箱地址';
                    }
                    break;

                case 'intro':
                    if (this.list.intro && this.list.intro.length > 500) {
                        this.fieldErrors.intro = '个人简介不能超过500字';
                    }
                    break;
            }
        },
        // 处理头像文件选择
        handleAvatarChange(e) {
            const file = e.target.files[0];
            console.log(file);
            if (file) {
                // 使用压缩图片方法
                this.compressImage(file)
                    .then(base64 => {
                        // 检查长度
                        if (base64.length > 10000) {
                            this.showMessage('图片太大，数据库可能存不下！', 'error');
                            return;
                        }

                        // 只更新头像预览，不立即保存到localStorage
                        this.list.avatarUrl = base64;
                        this.showMessage('头像已更新，点击保存按钮确认更改', 'info');
                    })
                    .catch(error => {
                        console.error('头像处理失败:', error);
                        this.showMessage('头像处理失败', 'error');
                    });
            }
        },
        compressImage(file) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const canvas = document.createElement('canvas');

                img.onload = () => {
                    // 设置缩略图尺寸
                    const MAX_SIZE = 150;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                        width = width * ratio;
                        height = height * ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 转换为base64
                    const base64 = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(base64);
                };

                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });
        },
        // 保存到数据库
        async saveToDatabase() {
            try {
                const userData = localStorage.getItem('userData');
                console.log('userData 原始数据:', userData);

                if (!userData) return false;

                const user = JSON.parse(userData);
                console.log('解析后的 user 对象:', user);

                // 检查 uid 是否存在，不存在则使用默认值
                let userId = user.uid;
                if (!userId) {
                    console.warn('uid 不存在，使用默认值 1');
                    userId = 1; // 使用默认值，根据实际情况修改
                }

                console.log('使用的 userId:', userId);

                // 构建URL参数
                const params = new URLSearchParams({
                    uid: userId,
                    uname: this.list.uname || '',
                    email: this.list.email || '',
                    intro: this.list.intro || '',
                    college: this.list.college || '',
                    grade: this.list.grade || '',
                    major: this.list.major || '',
                    hobby: this.list.hobby || '',
                    avatarUrl: this.list.avatarUrl || ''
                });

                console.log('发送的参数:', params.toString());
                console.log('头像数据长度:', this.list.avatarUrl ? this.list.avatarUrl.length : 0);

                const response = await fetch('http://10.11.192.98:8080/StuForum_war/api/user/update', { // 学校IP
                    // const response = await fetch('http://192.168.86.1:8080/StuForum_war/api/user/update', {
                    // 替换为家的IP
                    // const response = await fetch('http://192.168.1.189:8080/StuForum_war/api/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: params.toString()
                });

                console.log('响应状态:', response.status);

                // 获取响应文本，看是否有错误信息
                const responseText = await response.text();
                console.log('响应内容:', responseText);

                if (response.status === 200) {
                    console.log('更新成功');
                    return true;
                }

                return false;

            } catch (error) {
                console.error('保存失败:', error);
                return false;
            }
        },

        // 显示消息
        showMessage(text, type) {
            // 移除旧的消息
            const oldMessage = document.querySelector('.message');
            if (oldMessage) oldMessage.remove();

            // 创建新消息
            const messageDiv = document.createElement('div');
            messageDiv.className = `message message-${type}`;
            messageDiv.textContent = text;

            // 添加到页面
            document.body.appendChild(messageDiv);

            // 如果是成功消息，3秒后自动移除
            if (type === 'success') {
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 3000);
            }
        },

        // 清除消息
        clearMessage() {
            const messages = document.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
        },

        // 从localStorage获取用户数据
        getUserData() {
            try {
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);

                    // 确保所有字段都有值
                    this.list = {
                        uname: parsedData.uname || '',
                        email: parsedData.email || '',
                        intro: parsedData.intro || '',
                        college: parsedData.college || '',
                        grade: parsedData.grade || '',
                        major: parsedData.major || '',
                        hobby: parsedData.hobby || '',
                        avatarUrl: parsedData.avatarUrl || '',
                        uid: parsedData.uid || parsedData.id || 0
                    };

                    this.isLoggedIn = true;
                    console.log('用户数据加载成功:', this.list);
                } else {
                    // 如果没有登录数据，跳转到登录页
                    this.redirectToLogin();
                }
            } catch (error) {
                console.error('解析用户数据失败:', error);
                this.redirectToLogin();
            }
        },

        // 跳转到登录页
        redirectToLogin() {
            // 避免循环重定向
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
        },

        // 切换设置菜单显示
        toggleSettings() {
            this.showSettings = !this.showSettings;
        },

        // 更新全局用户数据（用于其他页面）
        updateGlobalUserData() {
            // 如果有全局的用户数据存储，可以在这里更新
            if (window.userData) {
                window.userData = this.list;
            }

            // 触发自定义事件，通知其他组件用户数据已更新
            const event = new CustomEvent('userDataUpdated', { detail: this.list });
            window.dispatchEvent(event);
        },

        // 初始化输入框状态
        initInputs() {
            // Vue的双向绑定已经处理了，这里不需要额外操作
        }
    },

    mounted() {
        // 获取用户数据
        this.getUserData();

        // 初始化输入框
        this.initInputs();

        // 初始化用户帖子数据
        this.profileFor();


        // 监听页面可见性变化，当页面重新激活时刷新数据
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.getUserData();
            }
        });

        // 监听storage事件，当其他标签页修改了数据时更新
        window.addEventListener('storage', (e) => {
            if (e.key === 'userData') {
                this.getUserData();
            }
        });
    },

    // 监听数据变化
    watch: {
        list: {
            deep: true,
            handler(newVal) {
                // 如果用户修改了数据但未保存，可以在这里做实时保存或提示
                // 注意：这可能会频繁触发，建议在真实项目中谨慎使用
            }
        }
    }
});

// 添加全局错误处理
window.addEventListener('error', function (event) {
    console.error('全局错误:', event.error);
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', function (event) {
    console.error('未处理的Promise拒绝:', event.reason);
});