const AppConfig = {
  getWebSocketUrl() {
    // 如果是HTTPS页面，用8443端口
    if (window.location.protocol === 'https:') {
      // return 'wss://10.11.192.98:8443/StuForum_war/chat';
      return 'wss://ws.lztflioveqzs.dpdns.org/StuForum_war/chat/';
    }
    // 否则用8080端口
    return 'ws://10.11.192.98:8080/StuForum_war/chat';
  }
};
window.AppConfig = AppConfig;