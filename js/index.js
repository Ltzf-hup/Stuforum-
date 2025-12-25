new Vue({
    el: '#app',
    data: {
        list: [],
    },
    methods: {
        getAll() {
            // 使用箭头函数回调
            $.ajax({
                url: "http://10.11.192.192:8080/fs",
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