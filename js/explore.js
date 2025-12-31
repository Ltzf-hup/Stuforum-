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
                url: "http://10.11.192.233:8080/explore",
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
                url: "http://10.11.192.233:8080/explore/search",
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
})