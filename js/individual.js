 function switchTab(tabName) {
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
}