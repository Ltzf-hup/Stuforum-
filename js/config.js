// 检查token是否即将过期
function isTokenAboutToExpire(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;

    // 检查token是否在30分钟内过期
    const now = Date.now() / 1000;
    return (exp - now) < 30 * 60;
  } catch (error) {
    console.error('解析token失败:', error);
    return false;
  }
}

// 刷新token
function refreshToken() {
  try {
    // 这里应该调用实际的token刷新API
    console.log('刷新token');
    // 假设刷新成功，更新localStorage中的token
    // localStorage.setItem('token', newToken);
  } catch (error) {
    console.error('刷新token失败:', error);
  }
}

// 配置全局请求头，添加Authorization
$.ajaxSetup({
  beforeSend: function (xhr) {
    const token = localStorage.getItem('token');
    if (token) {
      // 检查token是否即将过期
      if (isTokenAboutToExpire(token)) {
        // 自动刷新token
        refreshToken();
      }
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }
});

// 为fetch API创建一个包装函数，自动添加Authorization请求头
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  const token = localStorage.getItem('token');
  if (token) {
    // 检查token是否即将过期
    if (isTokenAboutToExpire(token)) {
      // 自动刷新token
      refreshToken();
    }

    // 添加Authorization请求头
    options.headers = options.headers || {};
    if (typeof options.headers === 'object' && options.headers !== null) {
      // 如果headers是一个普通对象
      options.headers['Authorization'] = 'Bearer ' + token;
    } else if (options.headers instanceof Headers) {
      // 如果headers是一个Headers对象
      options.headers.append('Authorization', 'Bearer ' + token);
    }
  }

  // 调用原始的fetch函数
  return originalFetch(url, options);
};

const AppConfig = {
  getWebSocketUrl() {
    // 如果是HTTPS页面，用8443端口
    if (window.location.protocol === 'https:') {
      // return 'wss://10.11.192.98:8443/StuForum_war/chat';
      return 'wss://ws.lztflioveqzs.dpdns.org/StuForum_war/chat';
    }
    // 否则用8080端口
    return 'ws://192.168.86.1:8080/StuForum_war/chat';
  }
};
window.AppConfig = AppConfig;
window.isTokenAboutToExpire = isTokenAboutToExpire;
window.refreshToken = refreshToken;