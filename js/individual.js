new Vue({
    el: '#app',
    data: {
        list: {},
        uname: '',
        avatarUrl: '',
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            const searchParams = new URLSearchParams(window.location.search);
            const uname = searchParams.get('uname');
            this.uname = uname;
            console.log(searchParams.get('uname')); // 输出: John
            //encodeURIComponent，对uname进行编码，防止特殊字符导致的问题
            const url = `http://10.11.192.14:8080/StuForum_war/api/forum/Son?uname=${encodeURIComponent(uname)}`;
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                },
            });
            const data = await response.json();
            console.log(data);
            this.list = data;
            this.avatarUrl = this.list[0].avatarUrl;

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
        followUser() {
            let followBtn = event.target;
            let messageBtn = document.getElementById('messageBtn');

            // 检查是否已关注
            if (followBtn.textContent === '关注') {
                // 切换到已关注状态
                followBtn.textContent = '已关注';
                followBtn.classList.remove('btn-primary');
                followBtn.classList.add('btn-secondary');

                // 显示私信按钮
                messageBtn.style.display = 'block';
            } else {
                // 切换到关注状态
                followBtn.textContent = '关注';
                followBtn.classList.remove('btn-secondary');
                followBtn.classList.add('btn-primary');

                // 隐藏私信按钮
                messageBtn.style.display = 'none';
            }
        },
        sendMessage() {
            // 这里可以添加打开私信窗口的逻辑
            // 例如：打开一个新窗口或显示一个弹窗
            location.href = 'm-n.html';
        },
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
    },
})

