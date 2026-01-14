let vm = new Vue({
    el: "#middle-body",
    data: {
        list: [],
        searchQuery: ''
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
                    this.list = data;
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
                    this.list = data;
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