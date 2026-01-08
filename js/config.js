// config.js - 简单的配置文件
const AppConfig = {
  // WebSocket基础URL - 根据当前环境自动选择
  getWebSocketUrl() {
    // 始终连接到你的后端服务器
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//10.11.192.14:8080/StuForum_war/chat`;
  }
};
// 导出到全局
window.AppConfig = AppConfig;