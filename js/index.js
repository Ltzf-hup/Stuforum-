const { createEditor, createToolbar } = window.wangEditor
new Vue({
    el: '#app',
    data: {
        list: [],
        isChecking: true,
        showImageModal: false,
        selectedImage: '',
        followStatus: {},
        uname: " ",
        editorConfig: null,
        editor: null,
        toolbar: null,
        imageUrl: [],
        txt: '',
        imagePreview: {
            show: false,
            images: [],
            currentIndex: 0,
            offsetX: 0,
            touchStartX: 0
        }
    },
    computed: {
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
        getAll() {
            $.ajax({
                url: "http://10.11.192.14:8080/StuForum_war_exploded/forum",
                type: "GET",
                dataType: "json",
                success: (data) => {
                    console.log("请求成功:", data);
                    this.list = data.map(item => ({
                        ...item,
                        txt: typeof item.txt === 'string' ? [item.txt] : item.txt,
                        isLiked: false
                    }));
                    this.isChecking = false;
                },
                error: (xhr, status, error) => {
                    console.error("请求失败:", status, error);
                    this.isChecking = false;
                    this.loadMockData();
                }
            });
        },
        showMessage(text, type = 'info') {
            this.showCustomAlert(text, type);
        },
        showCustomAlert(text, type) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `custom-alert alert-${type}`;
            alertDiv.innerHTML = `
                <span>${text}</span>
                <button class="alert-close">×</button>
            `;
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
            const bgColors = {
                'success': '#52c41a',
                'error': '#f5222d',
                'warning': '#faad14',
                'info': '#1890ff'
            };
            alertDiv.style.backgroundColor = bgColors[type] || bgColors.info;
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
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(alertDiv);
            closeBtn.addEventListener('click', () => {
                alertDiv.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 300);
            });
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
                this.txt = this.txt
                console.log(this.txt);
                if (!this.txt) {
                    alert('请输入帖子内容');
                    return;
                }
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
                formData.append('txt', this.txt);
                formData.append('image_file', this.imageUrl);
                const response = await fetch('http://10.11.192.14:8080/StuForum_war/api/forum/insert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    body: formData
                });

                // 检查响应状态
                if (!response.ok) {
                    const errorText = await response.text();
                    t
                    console.error('服务器响应错误:', response.status, errorText);
                    this.showMessage(`发布失败: 服务器错误 (${response.status})`, 'error');
                    return;
                }

                // 检查响应内容是否为空
                const responseText = await response.text();

                // 详细记录响应状态和内容用于调试
                console.log('服务器响应状态:', response.status);
                console.log('响应内容长度:', responseText.length);
                console.log('响应内容:', responseText);

                // 检查HTTP状态码
                if (!response.ok) {
                    console.error('HTTP错误:', response.status, response.statusText);
                    this.showMessage(`发布失败: 服务器错误 (${response.status} ${response.statusText})`, 'error');
                    return;
                }

                // 检查响应内容是否为空
                if (!responseText || responseText.trim() === '') {
                    // 服务器返回200但无内容，认为发布成功
                    console.log('服务器返回空响应，帖子可能已成功发布');
                    this.showMessage('发布成功！', 'success');
                    if (this.$options.editor) {
                        this.$options.editor.setHtml('<p></p>'); // 设置为空段落
                    }
                    this.txt = '';
                    this.imageUrl = [];
                    this.getAll(); // 刷新帖子列表
                    return;
                }

                // 尝试解析JSON
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON解析错误:', parseError.message);
                    console.error('原始响应内容:', responseText);
                    this.showMessage('发布失败: 服务器返回了无效数据', 'error');
                    return;
                }

                if (result.success) {
                    this.showMessage('发布成功', 'success');
                    this.txt = '';

                    this.imageUrl = [];
                    this.getAll();
                } else {
                    console.error('服务器返回失败:', result.message);
                    this.showMessage('发布失败: ' + (result.message || '未知错误'), 'error');
                }
            } catch (error) {
                console.error('发布出错:', error);
                this.showMessage('发布失败，请稍后重试', 'error');
            }
        },
        loadMockData() {
            this.list = [
                {
                    id: 1,
                    uid: 101,
                    uname: '测试用户1',
                    txt: '这是第一条测试帖子，内容很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长',
                    postedTime: new Date(Date.now() - 1000 * 60 * 30),
                    likeCount: 5,
                    replyCount: 2,
                    avatarUrl: '',
                    image_file: '<img src="https://picsum.photos/400/300" alt="测试图片1"><img src="https://picsum.photos/400/301" alt="测试图片2">'
                },
                {
                    id: 2,
                    uid: 102,
                    uname: '测试用户2',
                    txt: '今天的天气真好！',
                    postedTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    likeCount: 10,
                    replyCount: 5,
                    avatarUrl: '',
                    image_file: '<img src="https://picsum.photos/400/302" alt="测试图片">'
                },
                {
                    id: 3,
                    uid: 103,
                    uname: '测试用户3',
                    txt: '分享一张好看的照片',
                    postedTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
                    likeCount: 15,
                    replyCount: 8,
                    avatarUrl: '',
                    image_file: '<img src="https://picsum.photos/400/303" alt="测试图片1"><img src="https://picsum.photos/400/304" alt="测试图片2"><img src="https://picsum.photos/400/305" alt="测试图片3">'
                },
                {
                    id: 4,
                    uid: 104,
                    uname: '测试用户4',
                    txt: '学习编程的一天',
                    postedTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    likeCount: 20,
                    replyCount: 10,
                    avatarUrl: '',
                    image_file: '<img src="https://picsum.photos/400/306" alt="测试图片1"><img src="https://picsum.photos/400/307" alt="测试图片2">'
                }
            ];
            console.log('使用模拟数据');
        },
        getAvatarColorStyle(username) {
            const colors = [
                '#ee5a24', '#009432', '#0652dd', '#9980dd',
                '#ffc048', '#ff9f43', '#222f3e', '#8395a7', '#54a0ff'
            ];
            const firstChar = username.charAt(0).toUpperCase();
            const charCode = firstChar.charCodeAt(0);
            const colorIndex = charCode % colors.length;
            return {
                'background-color': colors[colorIndex],
                'width': '50px',
                'height': '50px'
            };
        },
        getAvatarInitial(username) {
            if (!username || username.length === 0) return '?';
            return username.charAt(0).toUpperCase();
        },
        formatTime(time) {
            if (!time) return '';
            const date = new Date(time);
            const now = new Date();
            const diff = now - date;

            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return '刚刚';
            if (minutes < 60) return `${minutes}分钟前`;
            if (hours < 24) return `${hours}小时前`;
            if (days < 7) return `${days}天前`;

            return date.toLocaleDateString('zh-CN');
        },
        // 获取图片src
        getImageSrc(imgHtml) {
            if (!imgHtml) return '';
            const match = imgHtml.match(/src=["']([^"']+)["']/);
            return match ? match[1] : imgHtml;
        },
        // 打开图片预览
        openImagePreview(images, index) {
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
        },
        // 根据HTML字符串打开图片预览
        openImagePreviewByHtml(htmlString, startIndex = 0) {
            if (!htmlString) return;
            // 获取图片数组（从逗号分隔的HTML字符串中提取）
            const images = htmlString.split(',').filter(img => img.trim());
            if (images.length > 0) {
                this.imagePreview.images = images;
                this.imagePreview.currentIndex = startIndex;
                this.imagePreview.offsetX = -startIndex * window.innerWidth;
                this.imagePreview.show = true;
                document.body.style.overflow = 'hidden';
            }
        },
        // 关闭图片预览
        closeImagePreview() {
            this.imagePreview.show = false;
            document.body.style.overflow = '';
        },
        // 处理图片点击（点击关闭预览）
        handleImageClick() {
            this.closeImagePreview();
        },
        // 触摸开始
        onTouchStart(e) {
            this.imagePreview.touchStartX = e.touches[0].clientX;
        },
        // 触摸移动
        onTouchMove(e) {
            const deltaX = e.touches[0].clientX - this.imagePreview.touchStartX;
            this.imagePreview.offsetX = deltaX;
        },
        // 触摸结束
        onTouchEnd(e) {
            const threshold = 50;
            if (this.imagePreview.offsetX > threshold && this.imagePreview.currentIndex > 0) {
                this.imagePreview.currentIndex--;
            } else if (this.imagePreview.offsetX < -threshold && this.imagePreview.currentIndex < this.imagePreview.images.length - 1) {
                this.imagePreview.currentIndex++;
            }
            this.imagePreview.offsetX = 0;
            // 更新偏移量以切换图片
            this.imagePreview.offsetX = -this.imagePreview.currentIndex * window.innerWidth;
        },
        toggleLike(post) {
            post.isLiked = !post.isLiked;
            if (post.isLiked) {
                post.likeCount = (post.likeCount || 0) + 1;
            } else {
                post.likeCount = Math.max(0, (post.likeCount || 1) - 1);
            }
            console.log('点赞状态:', post.id, post.isLiked);
        },
        toggleFollow(userId) {
            this.$set(this.followStatus, userId, !this.followStatus[userId]);
            console.log('关注状态:', userId, this.followStatus[userId]);
            const button = document.querySelectorAll('.follow-btn')[userId === 1 ? 0 : 1];
            if (button) {
                button.textContent = this.followStatus[userId] ? '已关注' : '关注';
            }
        },
        getImageCount(post) {
            const images = this.getImageArray(post);
            return images.length;
        },
        getImageArray(post) {
            if (!post || !post.image_file) return [];
            const imgStr = post.image_file;
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            const images = [];
            let match;
            while ((match = imgRegex.exec(imgStr)) !== null) {
                images.push(match[1]);
            }
            return images;
        },
        getImageSrc(img) {
            if (typeof img === 'string') {
                if (img.includes('src="')) {
                    const match = img.match(/src="([^">]+)"/);
                    return match ? match[1] : img;
                }
                return img;
            }
            return '';
        },
        previewImage(post, index) {
            const images = this.getImageArray(post);
            if (images[index]) {
                this.selectedImage = images[index];
                this.showImageModal = true;
            }
        },
        viewComments(post) {
            console.log('查看评论:', post);
            window.location.href = `post.html?id=${post.id}`;
        }
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
        this.editorConfig = {
            placeholder: '分享你的想法...',
            readOnly: false,
            autoFocus: true,
            scroll: true,
            onChange: (evn) => {
                const html = evn.getHtml();
                console.log('editor content', html);
                this.txt = html;

            },
            MENU_CONF: {
                uploadImage: {
                    server: 'http://10.11.192.14:8080/StuForum_war_exploded/FileUploadServlet',
                    fieldName: 'file1',
                    timeout: 60 * 1000,
                    customUpload: async (file, insertFn) => {
                        const formData = new FormData();
                        formData.append('file1', file);
                        try {
                            const response = await fetch('http://10.11.192.14:8080/StuForum_war_exploded/FileUploadServlet', {
                                method: 'POST',
                                body: formData
                            });
                            const result = await response.json();
                            if (result.errno === 0) {
                                const url = result.data.url;
                                const html = `<img src="${url}" alt="上传图片" style="max-width: 100%; height: auto;">`;
                                const vm = this;
                                vm.imageUrl.push(html);
                                console.log('图片已保存到数组:', html);
                            }
                        } catch (error) {
                            console.error('上传失败:', error);
                        }
                    }
                }
            }
        }
        this.$options.editor = createEditor({
            selector: '#editor-container',
            html: '<p></p>',
            config: this.editorConfig,
            mode: 'default'
        })
        const toolbarConfig = {
            modalAppendToBody: true
        }
        console.log(this.$options.editor.getAllMenuKeys())
        toolbarConfig.toolbarKeys = [
            'uploadImage',
            'color',
            'bgcolor',
            'fontSize',
            'fontFamily',
        ]
        this.$options.toolbar = createToolbar({
            editor: this.$options.editor,
            selector: '#toolbar-container',
            config: toolbarConfig,
            mode: 'default'
        })
        this.$options.editor.on('modalOrPanelShow', modalOrPanel => {
            if (modalOrPanel.type !== 'modal') return;
            const { $elem } = modalOrPanel;
            $elem.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
            })
        })
        this.$options.editor.on('modalOrPanelHide', () => {
        })
        this.getAll();
    },
    watch: {
        list: {
            handler() {
            },
            deep: true
        }
    }
});