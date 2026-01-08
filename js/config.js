// config.js - 简单的配置文件
const AppConfig = {
  // WebSocket基础URL - 根据当前环境自动选择
  getWebSocketUrl() {
    // 如果是本地开发
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8080/StuForum_war/chat';
    }

    // 如果是线上环境
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:8080/StuForum_war/chat`;
  }
};

// 导出到全局
window.AppConfig = AppConfig;