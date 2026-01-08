
new Vue({
  el: '#app',
  data: {
    activeMessageType: '私信',
    activeConversation: '张三',
    socket: null,
    messages: [], // 存储所有消息
    inputMessage: '', // 绑定输入框
    currentUser: {
      id: 1,          // 用户唯一ID
      name: '张三',   // 用户名
      avatar: 'Z'     // 头像标识
    },
  },
  created() {
    let userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      this.currentUser.id = userData.id;
      this.currentUser.name = userData.uname;
      this.currentUser.avatar = userData.avatarUrl || 'Z';
    }
    const wsUrl = `wss://lztflioveqzs.dpdns.org/StuForum_war/chat/${this.currentUser.name}`;
    console.log('WebSocket连接地址:', wsUrl);

    this.socket = new WebSocket(wsUrl);
    this.socket.onopen = function () {
      console.log('连接成功');
    }
    this.socket.onclose = function () {
      console.log('连接关闭');
    }
    this.socket.onerror = function () {
      console.log('连接错误');
    }
    this.socket.onmessage = (event) => {
      const message = event.data;
      console.log('收到原始消息:', message);
      this.handleIncomingMessage(message);
    };
  },
  methods: {
    selectMessageType(type) {
      this.activeMessageType = type;
    },
    selectConversation(name) {
      this.activeConversation = name;
    },
    //这里是处理收到的是谁的消息，判断是否是当前用户自己发的
    handleIncomingMessage(rawMessage) {
      console.log('收到消息:', rawMessage);

      const colonIndex = rawMessage.indexOf(':');

      if (colonIndex === -1) {
        console.log('消息格式不含冒号，直接显示为对方消息');
        this.addMessage('对方', rawMessage, false);
        return;
      }

      const sender = rawMessage.substring(0, colonIndex).trim();
      const content = rawMessage.substring(colonIndex + 1).trim();

      console.log('发送者:', sender, '当前用户:', this.currentUser.name);

      // 判断是否是自己发的消息
      // 1. 如果发送者名字完全匹配
      // 2. 或者发送者包含当前用户名的关键词（如果服务器格式不同）
      const isSelf = sender === this.currentUser.name;

      console.log('是否是自己发的:', isSelf);

      // 添加到消息列表
      this.addMessage(sender, content, isSelf);
    },
    sendMessage() {
      if (this.inputMessage.trim() === '') {
        alert("请输入信息");
        return;
      }

      const messageContent = this.inputMessage.trim();

      // 发送消息
      this.socket.send(messageContent);

      // 注意：这里不再手动添加消息，让WebSocket处理

      // 清空输入框
      this.inputMessage = '';
    },
    // 添加消息
    addMessage(sender, content, isSelf) {
      this.messages.push({
        id: Date.now(),
        sender: sender,
        content: content,
        time: this.getCurrentTime(),
        isSelf: isSelf, // 这个值决定左右显示
        avatar: this.getAvatar(sender, isSelf)
      });
      // 滚动到最底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    // 获取头像（根据用户名首字母）
    getAvatar(username, isSelf = false) {
      if (username === '系统') return '📢';
      if (isSelf) return '你'; // 🔥 根据isSelf判断
      return username.charAt(0).toUpperCase();
    },
    // 滚动到底部
    scrollToBottom() {
      // 使用Vue的refs而不是getElementById
      const messageContainer = this.$refs.messageContainer;
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    },
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
  },

});
