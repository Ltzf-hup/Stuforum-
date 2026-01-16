

new Vue({
    el: '#app',
    data: {
        list: [],
        uname: '',
        avatarUrl: '',
        isSelf: true,
        ferId: '',//当前登录用户的id
        fedId: '',//当前用户的id
        numOfPosts: 0,
        isFollowed: false,//没有关注状态
        gzNum: 0,
        fansNum: 0,
        // 使用与首页相同的图片预览数据结构
        imagePreview: {
            show: false,
            images: [],
            currentIndex: 0,
            offsetX: 0,
            touchStartX: 0,
            touchStartTime: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartOffset: 0
        }
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            //从url中获取是被关注者的id
            const searchParams = new URLSearchParams(window.location.search);
            const uname = searchParams.get('uname');
            const uid = searchParams.get('uid');
            this.uname = uname;
            this.fedId = uid;
            //本地储存的用户是关注者Id
            const currentUser = localStorage.getItem('userData');
            const currentUserId = JSON.parse(currentUser).uid;
            this.ferId = currentUserId;
            console.log(currentUserId);
            console.log(uid);
            //判断是否是自己
            if (currentUserId == uid) {
                this.isSelf = false;
            }
            else {
                this.isSelf = true;
            }
            // console.log(searchParams.get('uname')); // 输出: John
            //encodeURIComponent，对uname进行编码，防止特殊字符导致的问题
            // const url = `http://10.11.192.98:8080/StuForum_war/api/forum/Son?uname=${encodeURIComponent(uname)}`; // 学校IP
            const url = `http://192.168.86.1:8080/StuForum_war/api/forum/Son?uname=${encodeURIComponent(uname)}`; // 本地IP
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                },
            });
            const data = await response.json();
            console.log(data);
            
            // 处理图片URL，添加token参数
            const token = localStorage.getItem('token');
            if (token) {
                this.list = data.map(item => {
                    if (item.image_file) {
                        // 为所有图片URL添加token参数
                        item.image_file = item.image_file.replace(/(src=['"])([^'"]+)(['"])/g, (match, prefix, url, suffix) => {
                            // 检查URL是否已经包含参数
                            const separator = url.includes('?') ? '&' : '?';
                            return `${prefix}${url}${separator}token=${token}${suffix}`;
                        });
                    }
                    return item;
                });
            } else {
                this.list = data;
            }
            
            this.avatarUrl = this.list[0].avatarUrl;
            this.numOfPosts = this.list.length;
            console.log("返回的" + data[0].txt);
            // 初始化时检查关注状态
            await this.checkFollowStatus();
            //获取关注者数量
            await this.getGzNum();
            //获取粉丝数量
            await this.getFansNum();
        },
        //获取关注者数量
        async getGzNum() {
            const url = `http://192.168.86.1:8080/StuForum_war/api/concernedGzNum?fedId=${this.fedId}`; // 本地IP
            // const url = `http://192.168.86.1:8080/StuForum_war/api/concernedGzNum?fedId=${this.fedId}`; // 本地IP
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                },
            });
            const data = await response.json();
            console.log(data);
            this.gzNum = data;
        },
        //获取粉丝数量
        async getFansNum() {
            const url = `http://10.11.192.98:8080/StuForum_war/api/concernedFansNum?fedId=${this.fedId}`; // 学校IP
            // const url = `http://192.168.86.1:8080/StuForum_war/api/concernedFansNum?fedId=${this.fedId}`; // 本地IP
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                },
            });
            const data = await response.json();
            console.log(data);
            this.fansNum = data;
        },
        // 更新关注按钮状态
        updateFollowButton() {
            // 等待DOM渲染完成
            this.$nextTick(() => {
                const followBtn = document.querySelector('.follow-btn'); // 给关注按钮加个class
                const messageBtn = document.getElementById('messageBtn');

                if (!followBtn) return;

                if (this.isFollowing) {
                    followBtn.textContent = '已关注';
                    followBtn.classList.remove('btn-primary');
                    followBtn.classList.add('btn-secondary');
                    messageBtn.style.display = 'block';
                } else {
                    followBtn.textContent = '关注';
                    followBtn.classList.remove('btn-secondary');
                    followBtn.classList.add('btn-primary');
                    messageBtn.style.display = 'none';
                }
            });
        },
        switchTab(tabName) {
            // 隐藏所有内容区域
            let contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            // 移除所有标签的活跃状态
            let tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });

            // 显示选中的内容区域和标签
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        },
        // 关注用户
        async followInsert() {

            const url = `http://10.11.192.98:8080/StuForum_war/api/concernedInsert?ferId=${this.ferId}&fedId=${this.fedId}`; // 学校IP
            // const url = `http://192.168.86.1:8080/StuForum_war//api/concernedInsert?ferId=${this.ferId}&fedId=${this.fedId}`; // 本地IP
            const response = await fetch(url, {
                method: 'post',
                headers: {
                    'Accept': "text/html"
                },
            });
            const data = await response.text();
            console.log(data);
        },
        //取消关注
        async followDelete() {
            const url = `http://10.11.192.98:8080/StuForum_war/api/ConcernedDeleteServlet?ferId=${this.ferId}&fedId=${this.fedId}`; // 学校IP
            // const url = `http://192.168.86.1:8080/StuForum_war/api/ConcernedDeleteServlet?ferId=${this.ferId}&fedId=${this.fedId}`; // 本地IP
            const response = await fetch(url, {
                method: 'post',
                headers: {
                    'Accept': "text/html"
                },
            });
            const data = await response.text();
            console.log(data);
        },
        // 检查是否已关注
        async checkFollowStatus() {
            const url = `http://10.11.192.98:8080/StuForum_war/api/ConcernedIfGz?ferId=${this.ferId}&fedId=${this.fedId}`; // 学校IP
            // const url = `http://192.168.86.1:8080/StuForum_war/api/ConcernedIfGz?ferId=${this.ferId}&fedId=${this.fedId}`; // 本地IP
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Accept': "text/html"
                },
            });
            const data = await response.text();
            console.log(data);
            // 更新关注状态
            this.isFollowing = data.trim() === '1';

            // 根据状态更新按钮
            this.updateFollowButton();
        },
        //点击关注按钮
        async followUser() {
            const followBtn = event.target;
            const messageBtn = document.getElementById('messageBtn');

            try {
                if (followBtn.textContent === '关注') {
                    // 执行关注
                    await this.followInsert();

                    // 更新状态
                    followBtn.textContent = '已关注';
                    followBtn.classList.remove('btn-primary');
                    followBtn.classList.add('btn-secondary');
                    this.isFollowing = true;

                    // 显示私信按钮
                    if (messageBtn) messageBtn.style.display = 'block';
                } else {
                    // 执行取消关注
                    await this.followDelete();

                    // 更新状态
                    followBtn.textContent = '关注';
                    followBtn.classList.remove('btn-secondary');
                    followBtn.classList.add('btn-primary');
                    this.isFollowing = false;

                    // 隐藏私信按钮
                    if (messageBtn) messageBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('关注操作失败:', error);
            }
        },
        sendMessage() {
            // 这里可以添加打开私信窗口的逻辑
            // 例如：打开一个新窗口或显示一个弹窗
            location.href = 'm-n.html';
        },
        //时间格式化
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
        // 在 individual.js 的 methods 中添加
        decodeHtml(html) {
            // 如果输入为空，返回空字符串
            if (!html) return '';

            // 创建一个临时元素用于解码
            const temp = document.createElement('textarea');
            temp.innerHTML = html;
            return temp.value;
        },
        
        // 图片预览相关方法
        openImagePreview(images, index) {
            this.imagePreview.images = images;
            this.imagePreview.currentIndex = index;
            this.imagePreview.offsetX = -index * window.innerWidth;
            this.imagePreview.show = true;
        },
        
        closeImagePreview() {
            this.imagePreview.show = false;
        },
        
        goToPrevImage() {
            if (this.imagePreview.currentIndex > 0) {
                this.imagePreview.currentIndex--;
                this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
            }
        },
        
        goToNextImage() {
            if (this.imagePreview.currentIndex < this.imagePreview.images.length - 1) {
                this.imagePreview.currentIndex++;
                this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
            }
        },
        
        getImageSrc(imgHtml) {
            if (!imgHtml) return '';
            const match = imgHtml.match(/src=["']([^"']+)["']/);
            return match ? match[1] : imgHtml;
        },
        
        // 打开图片预览
        openImagePreview(images, index = 0) {
            // 如果images是字符串，转换为数组
            const imageList = typeof images === 'string' ? [images] : images;
            const validImages = imageList.filter(img => img && img.trim());
            if (validImages.length > 0) {
                this.imagePreview.images = validImages;
                this.imagePreview.currentIndex = Math.min(index, validImages.length - 1);
                this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
                this.imagePreview.show = true;
                document.body.style.overflow = 'hidden';
            }
        },
        
        // 关闭图片预览
        closeImagePreview() {
            this.imagePreview.show = false;
            document.body.style.overflow = 'auto';
        },
        
        // 跳转到指定图片
        goToImage(index) {
            if (index >= 0 && index < this.imagePreview.images.length) {
                this.imagePreview.currentIndex = index;
                this.imagePreview.offsetX = -index * window.innerWidth;
            }
        },
        
        // 上一张图片
        goToPrevImage() {
            if (this.imagePreview.currentIndex > 0) {
                this.imagePreview.currentIndex--;
                this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
            }
        },
        
        // 下一张图片
        goToNextImage() {
            if (this.imagePreview.currentIndex < this.imagePreview.images.length - 1) {
                this.imagePreview.currentIndex++;
                this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
            }
        },
        
        // 触摸开始
        onPreviewTouchStart(e) {
            this.imagePreview.touchStartX = e.touches[0].clientX;
            this.imagePreview.touchStartTime = Date.now();
        },
        
        // 触摸移动
        onPreviewTouchMove(e) {
            const deltaX = e.touches[0].clientX - this.imagePreview.touchStartX;
            this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth + deltaX;
        },
        
        // 触摸结束
        onPreviewTouchEnd(e) {
            const deltaX = this.imagePreview.offsetX + this.imagePreview.currentIndex * window.innerWidth;
            const threshold = 50;
            const timeDiff = Date.now() - this.imagePreview.touchStartTime;

            if (deltaX > threshold && this.imagePreview.currentIndex > 0) {
                this.imagePreview.currentIndex--;
            } else if (deltaX < -threshold && this.imagePreview.currentIndex < this.imagePreview.images.length - 1) {
                this.imagePreview.currentIndex++;
            }
            // 更新偏移量
            this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
        },
        
        // 鼠标拖拽
        onPreviewMouseDown(e) {
            this.imagePreview.isDragging = true;
            this.imagePreview.dragStartX = e.clientX;
            this.imagePreview.dragStartOffset = this.imagePreview.offsetX;
            e.preventDefault();
        },
        
        onPreviewMouseMove(e) {
            if (!this.imagePreview.isDragging) return;
            const deltaX = e.clientX - this.imagePreview.dragStartX;
            this.imagePreview.offsetX = this.imagePreview.dragStartOffset + deltaX;
        },
        
        onPreviewMouseUp(e) {
            if (!this.imagePreview.isDragging) return;
            this.imagePreview.isDragging = false;
            const deltaX = this.imagePreview.offsetX - (-this.imagePreview.currentIndex * window.innerWidth);
            const threshold = 50;

            if (deltaX > threshold && this.imagePreview.currentIndex > 0) {
                this.imagePreview.currentIndex--;
            } else if (deltaX < -threshold && this.imagePreview.currentIndex < this.imagePreview.images.length - 1) {
                this.imagePreview.currentIndex++;
            }
            this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
        }

    }, // 添加一个mounted钩子，确保DOM渲染后执行
    mounted() {
        // 如果DOM已存在，立即更新按钮
        this.updateFollowButton();
    }
})