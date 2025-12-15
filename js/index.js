new Vue({
    el: '#app',
    data: {
        list: [],
        a: "天气不错"
    },
    methods: {
        getAll() {
            // 使用箭头函数回调
            $.ajax({
                url: "fs",
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
    created(){
        this.getAll();
    }
});