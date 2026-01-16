

new Vue({
    el: "#middle-body",
    data: {
        list: [],
        searchQuery: '',
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
    methods: {
        getExplore() {
            // 使用箭头函数回调
            $.ajax({
                url: "http://10.11.192.98:8080/StuForum_war/forum",
                type: "GET",
                dataType: "json",
                success: (data) => {
                    console.log(data);
                    
                    // 处理图片URL，添加token参数
                    const token = localStorage.getItem('token');
                    this.list = data.map(item => {
                        const processedItem = {
                            ...item,
                            txt: typeof item.txt === 'string' ? [item.txt] : item.txt
                        };
                        
                        if (token && processedItem.image_file) {
                            // 为所有图片URL添加token参数
                            processedItem.image_file = processedItem.image_file.replace(/(src=['"])([^'"]+)(['"])/g, (match, prefix, url, suffix) => {
                                // 检查URL是否已经包含参数
                                const separator = url.includes('?') ? '&' : '?';
                                return `${prefix}${url}${separator}token=${token}${suffix}`;
                            });
                        }
                        
                        return processedItem;
                    });
                },
                error: (error) => {
                    console.error("请求失败:", error);
                }
            });
        },
        performSearch() {
            if (this.searchQuery.trim() === '') {
                // 如果搜索框为空，重新加载所有内容
                this.getExplore();
                return;
            }
            // 执行搜索操作
            $.ajax({
                url: "http://10.11.192.98:8080/StuForum_war/forum/search",
                type: "GET",
                data: {
                    query: this.searchQuery
                },
                dataType: "json",
                success: (data) => {
                    console.log("搜索结果:", data);
                    
                    // 处理图片URL，添加token参数
                    const token = localStorage.getItem('token');
                    this.list = data.map(item => {
                        const processedItem = {
                            ...item,
                            txt: typeof item.txt === 'string' ? [item.txt] : item.txt
                        };
                        
                        if (token && processedItem.image_file) {
                            // 为所有图片URL添加token参数
                            processedItem.image_file = processedItem.image_file.replace(/(src=['"])([^'"]+)(['"])/g, (match, prefix, url, suffix) => {
                                // 检查URL是否已经包含参数
                                const separator = url.includes('?') ? '&' : '?';
                                return `${prefix}${url}${separator}token=${token}${suffix}`;
                            });
                        }
                        
                        return processedItem;
                    });
                },
                error: (error) => {
                    console.error("搜索失败:", error);
                    // 搜索失败时可以显示提示或保持原有列表
                }
            });
        },
        // 添加时间格式化方法
        formatTime(timestamp) {
            if (!timestamp) return '未知时间';

            const date = new Date(timestamp);
            const now = new Date();

            // 计算时间差（秒）
            const diff = Math.floor((now - date) / 1000);

            if (diff < 60) {
                return '刚刚';
            } else if (diff < 3600) {
                return Math.floor(diff / 60) + '分钟前';
            } else if (diff < 86400) {
                return Math.floor(diff / 3600) + '小时前';
            } else if (diff < 2592000) {
                return Math.floor(diff / 86400) + '天前';
            } else {
                // 超过一个月，显示具体日期
                return date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0') + ' ' +
                    String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0');
            }
        },
        // 头像颜色样式
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
        // 获取头像首字母
        getAvatarInitial(username) {
            if (!username || username.length === 0) return '?';
            return username.charAt(0).toUpperCase();
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
        // 关闭图片预览
        closeImagePreview() {
            this.imagePreview.show = false;
            document.body.style.overflow = '';
        },
        // 从HTML字符串中提取图片URL
        getImageSrc(htmlString) {
            if (!htmlString) return '';
            const match = htmlString.match(/src\s*=\s*["']([^"']+)["']/i);
            return match ? match[1] : htmlString;
        }
    },
    mounted() {
        // 初始化加载数据
        this.getExplore();

        // 添加键盘事件监听，当按下回车键时触发搜索
        document.addEventListener('keypress', (event) => {
            // 检查是否按下回车键（keyCode 13）
            if (event.keyCode === 13) {
                // 触发搜索操作
                this.performSearch();
            }
        });
    }
});