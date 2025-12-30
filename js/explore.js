let vm = new Vue({
    el: "#middle-body",
    data: {
        list: [],
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
        }
    },
    created() {
        this.getExplore();
    }
})