new Vue({
  el: '#app',
  data: {
    activeMessageType: '私信',
    activeConversation: '',
    id: '',
    socket: null,
    messages: [], // 存储所有消息
    inputMessage: '', // 绑定输入框
    currentUser: {
      id: 1,          // 用户唯一ID
      name: '张三',   // 用户名
      avatar: 'Z'     // 头像标识
    },
    list: [], // 存储所有已关注用户
    name: this.activeConversation || '张三'
  },
  created() {
    console.log('关注列表:', this.currentUser.id);
    // 初始化时获取关注列表
    this.getConcernedList();
  },
  methods: {
    conn() {
      let userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        this.currentUser.id = userData.uid;
        this.currentUser.name = userData.uname;
        this.currentUser.avatar = userData.avatarUrl || 'Z';
      }
      const wsUrl = `wss://ws.lztflioveqzs.dpdns.org/StuForum_war/chat/${this.currentUser.name}/${this.currentUser.id}/${this.id}`;
      console.log('WebSocket连接地址:', wsUrl);
      console.log('关注列表:', this.id);
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
    selectConversation(name, id) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(); // 先关闭旧连接
      }
      this.activeConversation = name;
      this.id = id;
      console.log('当前选中会话的ID:', id);
      //连接WebSocket
      this.conn()
    },
    selectMessageType(type) {
      this.activeMessageType = type;
    },

    //这里是处理收到的是谁的消息，判断是否是当前用户自己发的
    handleIncomingMessage(rawMessage) {
      console.log('收到消息:', rawMessage);

      const colonIndex = rawMessage.indexOf(':');

      if (colonIndex === -1) {
        console.log('消息格式不含冒号，直接显示为对方消息');
        // 这里需要确定消息的发送者，假设为当前选中的会话
        this.addMessage(this.activeConversation, rawMessage, false);
        return;
      }

      const sender = rawMessage.substring(0, colonIndex).trim();
      const content = rawMessage.substring(colonIndex + 1).trim();

      console.log('发送者:', sender, '当前用户:', this.currentUser.name);

      // 判断是否是自己发的消息
      // 当发送者是当前用户，并且不是从WebSocket接收到的自己发送的消息时
      // 避免重复显示自己发送的消息
      const isSelf = sender === this.currentUser.name;

      // 检查是否已经有相同内容和时间的消息，避免重复添加
      const isDuplicate = this.messages.some(msg =>
        msg.content === content &&
        msg.sender === sender &&
        Math.abs(Date.now() - msg.id) < 1000 // 1秒内的相同消息视为重复
      );

      console.log('是否是自己发的:', isSelf, '是否是重复消息:', isDuplicate);

      // 添加到消息列表，跳过重复消息
      if (!isDuplicate) {
        this.addMessage(sender, content, isSelf);
      }
    },
    sendMessage() {
      if (this.inputMessage.trim() === '') {
        alert("请输入信息");
        return;
      }

      if (!this.activeConversation) {
        alert("请先选择一个会话");
        return;
      }

      const messageContent = this.inputMessage.trim();

      // 发送消息，让WebSocket服务器处理后再返回
      this.socket.send(messageContent);

      // 清空输入框
      this.inputMessage = '';
    },
    // 添加消息
    addMessage(sender, content, isSelf) {
      const message = {
        id: Date.now(),
        sender: sender,
        receiver: isSelf ? this.activeConversation : this.currentUser.name,
        content: content,
        time: this.getCurrentTime(),
        isSelf: isSelf,
        avatar: this.getAvatar(sender, isSelf),
        conversationId: isSelf ? this.activeConversation : sender // 添加会话标识
      };

      console.log('添加消息:', message);

      this.messages.push(message);

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
    //获取数据库中的关注列表
    getConcernedList() {
      fetch(`http://10.11.192.14:8080/StuForum_war/api/user/SocketConcernedServlet?mid=${this.currentUser.id}`)
        .then(response => response.json())
        .then(data => {
          console.log('关注列表:', data);
          this.list = data;
        })
        .catch(error => console.error('获取关注列表失败:', error));
    }
  },


});