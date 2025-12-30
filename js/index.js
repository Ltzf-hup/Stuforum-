new Vue({
    el: '#app',
    data: {
        list: [],
        isChecking: true,
        showImageModal: false, // 图片预览模态框状态
        selectedImage: '', // 当前选中的图片
        followStatus: {} // 关注状态存储
    },
    computed: {
        // 当前用户的头像样式
        currentUserAvatarStyle() {
            const userData = localStorage.getItem('userData');
            let username = '你';
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    username = user.uname || '你';
                } catch (e) {
                    console.error('解析用户数据失败:', e);
                }
            }
            return this.getAvatarColorStyle(username);
        }
    },
    methods: {
        // 获取所有帖子
        getAll() {
            $.ajax({
                url: "http://10.11.192.14:8080/StuForum_war_exploded/forum",
                type: "GET",
                dataType: "json",
                success: (data) => {
                    console.log("请求成功:", data);
                    // 添加点赞状态等额外属性
                    this.list = data.map(item => ({
                        ...item,
                        isLiked: false
                    }));
                    this.isChecking = false;
                },
                error: (xhr, status, error) => {
                    console.error("请求失败:", status, error);
                    this.isChecking = false;

                    // 如果请求失败，使用模拟数据
                    this.loadMockData();
                }
            });
        },
        // 添加 showMessage 方法
        showMessage(text, type = 'info') {
            //自定义的消息（ai）
            this.showCustomAlert(text, type);
        },

        // 可选：自定义美观的提示
        showCustomAlert(text, type) {
            // 创建提示元素
            const alertDiv = document.createElement('div');
            alertDiv.className = `custom-alert alert-${type}`;
            alertDiv.innerHTML = `
                <span>${text}</span>
                <button class="alert-close">×</button>
            `;

            // 样式
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-size: 14px;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 200px;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            `;

            // 根据类型设置背景色
            const bgColors = {
                'success': '#52c41a',
                'error': '#f5222d',
                'warning': '#faad14',
                'info': '#1890ff'
            };
            alertDiv.style.backgroundColor = bgColors[type] || bgColors.info;

            // 关闭按钮样式
            const closeBtn = alertDiv.querySelector('.alert-close');
            closeBtn.style.cssText = `
                background: transparent;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
                padding: 0;
                line-height: 1;
            `;

            // 添加动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);

            // 添加到页面
            document.body.appendChild(alertDiv);

            // 点击关闭按钮
            closeBtn.addEventListener('click', () => {
                alertDiv.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 300);
            });

            // 3秒后自动消失
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.style.animation = 'slideOut 0.3s ease-out forwards';
                    setTimeout(() => {
                        if (alertDiv.parentNode) {
                            alertDiv.parentNode.removeChild(alertDiv);
                        }
                    }, 300);
                }
            }, 3000);
        },
        async publishPost() {
            try {
                // 1. 获取输入内容
                const postInput = document.querySelector('.post-input');
                const postText = postInput.value.trim();

                if (!postText) {
                    alert('请输入帖子内容');
                    return;
                }

                // 2. 获取当前用户
                const userData = localStorage.getItem('userData');
                if (!userData) {
                    alert('请先登录');
                    window.location.href = 'login.html';
                    return;
                }

                const user = JSON.parse(userData);
                const userId = user.uid;

                if (!userId) {
                    alert('用户信息不完整，请重新登录');
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                    return;
                }

                const formData = new URLSearchParams();
                formData.append('uid', userId);
                formData.append('txt', postText);

                const response = await fetch('http://10.11.192.14:8080/StuForum_war_exploded/api/forum/insert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: formData.toString()
                });

                console.log('响应状态:', response.status);

                if (response.ok) {
                    if (response.status === 200) {
                        // 6. 发布成功，清空输入框
                        postInput.value = '';

                        // 7. 显示成功消息
                        this.showMessage('发布成功！', 'success');

                        // 8. 刷新帖子列表
                        this.getAll();

                    } else {
                        alert('发布失败: ' + (num || '未知错误'));
                    }
                } else {
                    const errorText = await response.text();
                    console.error('发布失败，响应:', errorText);
                    alert('发布失败，请检查网络连接');
                }

            } catch (error) {
                console.error('发布失败:', error);
                alert('发布失败，请稍后重试');
            } finally {
                // 9. 恢复按钮状态
                const submitBtn = document.querySelector('.post-submit');
                if (submitBtn) {
                    submitBtn.textContent = '发布';
                    submitBtn.disabled = false;
                }
            }
        },

        // 模拟数据（备用）
        loadMockData() {
            const mockData = [
                {
                    id: 1,
                    uname: '备用数据',
                    txt: '最近在学多线程，感觉锁机制比较复杂，有没有同学一起讨论？',
                    postedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    likeCount: 15,
                    replyCount: 6,
                    repostCount: 3,
                    imageUrl: '/image/650+_冬天_免费图片/10001.jpg'
                },
                {
                    id: 2,
                    uname: '李四',
                    txt: '一食堂的菜价又涨了，西红柿炒蛋里能找到蛋算我输！',
                    postedTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    likeCount: 42,
                    replyCount: 25,
                    repostCount: 8
                },
                {
                    id: 3,
                    uname: '王五',
                    txt: '本周五下午4点，东区篮球场3v3，缺两个人，来的直接球场见！',
                    postedTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                    likeCount: 8,
                    replyCount: 12,
                    repostCount: 5,
                    imageUrl: '/image/650+_冬天_免费图片/10002.jpg'
                }
            ];

            this.list = mockData.map(item => ({
                ...item,
                isLiked: false
            }));
        },

        // 获取头像颜色样式
        getAvatarColorStyle(username) {
            if (!username) {
                return {
                    'background-color': '#2c7be5',
                    'width': '50px',
                    'height': '50px'
                };
            }

            // 颜色数组
            const colors = [
                '#10ac84', '#5f27cd', '#ee5253', '#0abde3',
                '#ff9f43', '#222f3e', '#8395a7', '#54a0ff'
            ];

            // 基于用户名生成固定颜色
            const firstChar = username.charAt(0).toUpperCase();
            const charCode = firstChar.charCodeAt(0);
            const colorIndex = charCode % colors.length;

            return {
                'background-color': colors[colorIndex],
                'width': '50px',
                'height': '50px'
            };
        },

        // 获取头像首字母
        getAvatarInitial(username) {
            if (!username || username.length === 0) return '?';
            return username.charAt(0).toUpperCase();
        },

        // 格式化时间
        formatTime(dateString) {
            if (!dateString) return '刚刚';

            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;

            // 计算时间差
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (minutes < 1) return '刚刚';
            if (minutes < 60) return `${minutes}分钟前`;
            if (hours < 24) return `${hours}小时前`;
            if (days < 7) return `${days}天前`;

            // 超过一周显示具体日期
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
        },

        // 点赞/取消点赞
        toggleLike(post) {
            post.isLiked = !post.isLiked;
            if (post.isLiked) {
                post.likeCount = (post.likeCount || 0) + 1;
            } else {
                post.likeCount = Math.max(0, (post.likeCount || 1) - 1);
            }

            // 这里可以添加发送到服务器的代码
            console.log('点赞状态:', post.id, post.isLiked);
        },

        // 关注/取消关注
        toggleFollow(userId) {
            // 切换关注状态
            this.$set(this.followStatus, userId, !this.followStatus[userId]);

            // 这里可以添加发送到服务器的代码
            console.log('关注状态:', userId, this.followStatus[userId]);

            // 更新按钮文本
            const button = document.querySelectorAll('.follow-btn')[userId === 1 ? 0 : 1];
            if (button) {
                button.textContent = this.followStatus[userId] ? '已关注' : '关注';
            }
        },
    },
    mounted() {
        const postInput = document.querySelector('.post-input');
        if (postInput) {
            postInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.publishPost();
                }
            });
        }
    },
    created() {
        this.getAll();
    }
});

