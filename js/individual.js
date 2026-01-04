
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

function followUser() {
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
}
function sendMessage() {
    // 这里可以添加打开私信窗口的逻辑
    // 例如：打开一个新窗口或显示一个弹窗
    location.href = 'm-n.html';
}
