

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
    conversationList: [], // 存储所有会话（包括关注和未关注用户）
    concernedUsers: [], // 存储已关注用户
    loadingList: false, // 会话列表加载状态
    name: this.activeConversation || '张三'
  },
  created() {

    // 先从localStorage获取用户信息
    let userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      console.error('用户未登录');
      // 跳转到登录页面
      window.location.href = 'login.html';
      return;
    }
    if (userData) {
      this.currentUser.id = userData.uid;
      console.log('用户ID:', this.currentUser.id);
      this.currentUser.name = userData.uname;
      // 确保头像正确初始化
      this.currentUser.avatar = userData.avatarUrl || userData.uname.charAt(0).toUpperCase() || 'U';
      console.log('当前用户信息:', this.currentUser);
    }

    // 然后获取关注列表
    this.getConcernedList();


  },
  methods: {
    conn() {
      // 确保用户信息正确
      let userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        this.currentUser.id = userData.uid;
        this.currentUser.name = userData.uname;
        // 确保头像正确初始化
        this.currentUser.avatar = userData.avatarUrl || userData.uname.charAt(0).toUpperCase() || 'U';
      }
      // 使用config.js中的WebSocket配置
      let wsBaseUrl = AppConfig.getWebSocketUrl();
      // 确保当前用户信息和目标用户ID有效
      if (!this.currentUser.name || !this.currentUser.id || !this.id) {
        console.error('WebSocket连接失败：缺少必要的用户信息', { currentUser: this.currentUser, id: this.id });
        return;
      }
      // 构建完整的WebSocket URL
      const wsUrl = `${wsBaseUrl}/${this.currentUser.name}/${this.currentUser.id}/${this.id}`;
      console.log('WebSocket连接地址:', wsUrl);
      console.log('当前选中用户ID:', this.id);
      this.socket = new WebSocket(wsUrl);

      // 保存 Vue 实例的引用
      const vm = this;

      this.socket.onopen = function () {
        console.log('连接成功，当前会话：', vm.activeConversation);
      }

      this.socket.onclose = function () {
        console.log('连接关闭');
      }

      this.socket.onerror = function () {
        console.log('连接错误');
      }

      this.socket.onmessage = function (event) {
        const message = event.data;
        console.log('收到原始消息:', message);
        vm.handleIncomingMessage(message);
      };
    },
    getAllMsg() {
      // 确保用户信息是最新的
      let userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        this.currentUser.id = userData.uid;
        this.currentUser.name = userData.uname;
        this.currentUser.avatar = userData.avatarUrl || userData.uname.charAt(0).toUpperCase() || 'U';
      }

      console.log('当前用户ID:', this.currentUser.id, '会话对方ID:', this.id);

      fetch(`http://10.11.192.98:8080/StuForum_war/api/msg?sendId=${this.currentUser.id}&reId=${this.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('网络请求失败: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('获取到的消息列表:', data);
          // 清空当前消息列表
          this.messages = [];

          // 处理消息数据，转换为合适的格式
          data.forEach(msg => {
            console.log('处理单条消息:', msg);

            // 确保msg对象包含必要字段
            if (!msg.sender_id || !msg.content || !msg.create_time) {
              console.warn('消息格式不完整，跳过:', msg);
              return;
            }

            // 判断消息是否为自己发送的：发送者ID等于当前用户ID
            const isSelf = msg.sender_id == this.currentUser.id;
            console.log('判断消息发送者:', msg.sender_id, '是否等于当前用户ID:', this.currentUser.id, '结果:', isSelf);

            // 获取发送者名称
            const sender = isSelf ? this.currentUser.name : this.activeConversation;

            // 添加消息到列表
            this.messages.push({
              id: msg.id || Date.now() + Math.random(), // 使用后端ID或生成唯一ID
              sender: sender,
              receiver: isSelf ? this.activeConversation : this.currentUser.name,
              content: msg.content,
              time: this.formatTime(msg.create_time), // 格式化时间戳
              isSelf: isSelf,
              avatar: this.getAvatar(sender, isSelf),
              conversationId: this.activeConversation
            });
          });

          // 滚动到底部显示最新消息
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        })
        .catch(error => {
          console.error('获取消息失败:', error);
          alert('获取历史消息失败，请稍后重试');
        });
    },
    selectConversation(name, id) {
      // 如果已经选中当前会话，不执行任何操作
      if (this.activeConversation === name) {
        return;
      }

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(); // 先关闭旧连接
      }
      this.activeConversation = name;
      this.id = id;
      console.log('当前选中会话:', name, 'ID:', id);

      // 确保会话列表中该会话的isConcerned标记正确
      const conversationIndex = this.conversationList.findIndex(item =>
        item.uname === name || item.id === id
      );

      if (conversationIndex !== -1) {
        // 检查该用户是否是已关注用户
        const isUserConcerned = this.concernedUsers.some(user =>
          user.uname === name || user.id === id
        );
        this.conversationList[conversationIndex].isConcerned = isUserConcerned;
      }

      // 连接WebSocket
      this.conn();
      //查询当前会话信息
      this.getAllMsg();

    },

    selectMessageType(type) {
      this.activeMessageType = type;
    },

    // 处理收到的消息
    handleIncomingMessage(rawMessage) {
      console.log('收到消息:', rawMessage);

      // 处理系统消息（后端返回的确认消息）
      if (rawMessage.includes('已发送') || rawMessage.includes('发送失败') || rawMessage.includes('系统')) {
        console.log('系统消息:', rawMessage);
        // 可以考虑显示在UI的某个地方，比如输入框下方
        return;
      }

      // 处理私信格式（后端格式：发送者: 内容）
      const colonIndex = rawMessage.indexOf(':');

      if (colonIndex === -1) {
        console.log('消息格式异常:', rawMessage);
        return;
      }

      const sender = rawMessage.substring(0, colonIndex).trim();
      const content = rawMessage.substring(colonIndex + 1).trim();

      console.log('解析结果 - 发送者:', sender, '内容:', content, '当前用户:', this.currentUser.name);

      // 判断是否是自己发的消息（可能是后端返回的确认）
      const isSelf = sender === this.currentUser.name;

      // 避免重复显示自己发送的消息（因为本地已经显示过了）
      if (isSelf) {
        console.log('收到自己发的消息回执，跳过显示');
        return;
      }

      // 检测是否是当前会话的消息
      if (this.activeConversation && this.activeConversation !== sender) {
        console.log('非当前会话消息，可能需要显示通知:', rawMessage);
        // 这里可以添加通知逻辑
      }

      // 检查发送者是否在会话列表中
      const senderInConversation = this.conversationList.some(item =>
        item.uname === sender || item.id === sender
      );
      if (!senderInConversation) {
        // 检查发送者是否是已关注用户
        const isUserConcerned = this.concernedUsers.some(user =>
          user.uname === sender || user.id === sender
        );

        if (isUserConcerned) {
          // 如果是已关注用户，找到该用户的详细信息
          const concernedUser = this.concernedUsers.find(user =>
            user.uname === sender || user.id === sender
          );
          if (concernedUser) {
            // 添加已关注用户的会话
            this.conversationList.push({
              ...concernedUser,
              isConcerned: true,
              lastMessage: content,
              lastMessageTime: message.time
            });
          }
        } else {
          // 添加未关注用户到会话列表
          this.addUnconcernedUserToConversation(sender, sender);
        }
      }

      // 添加消息到聊天窗口
      this.addMessage(sender, content, isSelf);
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

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        alert("连接未就绪，请稍后重试");
        return;
      }

      const messageContent = this.inputMessage.trim();

      // 先在自己本地显示消息
      console.log('发送消息，本地显示:', messageContent);
      this.addMessage(this.currentUser.name, messageContent, true);

      // 发送消息到服务器
      console.log('通过WebSocket发送:', messageContent);
      try {
        this.socket.send(messageContent);
      } catch (error) {
        console.error('发送消息失败:', error);
        alert('发送消息失败，请重试');
        // 可以考虑撤销本地显示的消息
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.isSelf && lastMessage.content === messageContent) {
          this.messages.pop();
        }
      }

      // 清空输入框
      this.inputMessage = '';
    },

    // 添加消息
    addMessage(sender, content, isSelf) {
      // 确保conversationId正确设置
      const conversationId = isSelf ? this.activeConversation : sender;
      const receiver = isSelf ? this.activeConversation : this.currentUser.name;

      // 确保conversationId不为空
      if (!conversationId || !receiver) {
        console.error('添加消息失败：缺少会话ID或接收者信息', { sender, content, isSelf });
        return;
      }

      const message = {
        id: Date.now(),
        sender: sender,
        receiver: receiver,
        content: content,
        time: this.getCurrentTime(),
        isSelf: isSelf,
        avatar: this.getAvatar(sender, isSelf),
        conversationId: conversationId
      };

      console.log('添加消息到列表:', message);
      this.messages.push(message);

      // 更新会话列表中的最新消息和时间
      const conversationUser = isSelf ? this.activeConversation : sender;
      const conversationIndex = this.conversationList.findIndex(item => item.uname === conversationUser);

      if (conversationIndex !== -1) {
        // 更新现有会话的最新消息
        this.conversationList[conversationIndex].lastMessage = content;
        this.conversationList[conversationIndex].lastMessageTime = message.time;

        // 检查该用户是否是已关注用户，如果是，确保会话标记为已关注
        const isUserConcerned = this.concernedUsers.some(user => user.uname === conversationUser || user.id === conversationUser);
        if (isUserConcerned) {
          this.conversationList[conversationIndex].isConcerned = true;
        }

        // 将当前会话移到列表顶部
        if (conversationIndex > 0) {
          const [updatedConversation] = this.conversationList.splice(conversationIndex, 1);
          this.conversationList.unshift(updatedConversation);
        }
      } else {
        // 如果会话不存在，添加到会话列表
        if (isSelf) {
          // 检查该用户是否是已关注用户
          const isUserConcerned = this.concernedUsers.some(user => user.uname === conversationUser || user.id === conversationUser);

          if (isUserConcerned) {
            // 如果是已关注用户，找到该用户的详细信息
            const concernedUser = this.concernedUsers.find(user => user.uname === conversationUser || user.id === conversationUser);
            if (concernedUser) {
              // 添加已关注用户的会话
              this.conversationList.push({
                ...concernedUser,
                isConcerned: true,
                lastMessage: content,
                lastMessageTime: message.time
              });
            }
          } else {
            // 发送消息时，如果会话不存在且用户未关注对方
            this.addUnconcernedUserToConversation(conversationUser, conversationUser);
            // 更新新添加的会话的最新消息
            const newIndex = this.conversationList.findIndex(item => item.uname === conversationUser);
            if (newIndex !== -1) {
              this.conversationList[newIndex].lastMessage = content;
              this.conversationList[newIndex].lastMessageTime = message.time;
            }
          }
        }
      }

      // 滚动到最底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 获取头像
    getAvatar(username, isSelf = false) {
      if (username === '系统') return '📢';
      if (isSelf) return this.currentUser.avatar;

      // 检查会话列表中是否有该用户的头像URL
      const user = this.conversationList.find(user => user.uname === username);
      if (user && user.avatarUrl) {
        return user.avatarUrl;
      }

      return username.charAt(0).toUpperCase();
    },

    // 滚动到底部
    scrollToBottom() {
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

    // 格式化时间 - 支持时间戳和字符串格式
    formatTime(timeInput) {
      if (!timeInput) {
        return '';
      }

      try {
        let date;

        // 处理不同类型的时间输入
        if (typeof timeInput === 'number') {
          // 时间戳（毫秒）
          date = new Date(timeInput);
        } else if (typeof timeInput === 'string') {
          // 字符串格式
          date = new Date(timeInput);
        } else {
          return '无效时间';
        }

        // 检查是否为有效日期
        if (isNaN(date.getTime())) {
          return '无效时间';
        }

        // 格式化为HH:MM
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
      } catch (e) {
        console.error('时间格式化错误:', e, '输入值:', timeInput);
        return '时间格式错误';
      }
    },

    // 获取关注列表
    getConcernedList() {
      // 添加加载状态
      this.loadingList = true;

      // 确保使用正确的用户ID
      const userId = this.currentUser.id;
      if (!userId) {
        console.error('用户ID为空，无法获取关注列表');
        this.loadingList = false;
        return;
      }

      const apiUrl = `http://10.11.192.98:8080/StuForum_war/api/user/SocketConcernedServlet?mid=${userId}`; // 学校IP
      // const apiUrl = `http://192.168.86.1:8080/StuForum_war/api/user/SocketConcernedServlet?mid=${userId}`; // 本地IP
      console.log('获取关注列表API:', apiUrl);

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('网络请求失败: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('关注列表:', data);
          this.concernedUsers = data;
          // 将关注用户添加到会话列表
          this.updateConversationList(data);
        })
        .catch(error => {
          console.error('获取关注列表失败:', error);
          alert('获取关注列表失败，请稍后重试');
        })
        .finally(() => {
          this.loadingList = false;
        });
    },

    // 更新会话列表
    updateConversationList(newUsers) {
      newUsers.forEach(user => {
        // 检查会话列表中是否已存在该用户（使用用户名或ID判断，确保一致性）
        const existingIndex = this.conversationList.findIndex(item =>
          item.uname === user.uname || item.id === user.id
        );
        if (existingIndex === -1) {
          // 添加到会话列表
          this.conversationList.push({
            ...user,
            isConcerned: true, // 标记为已关注
            lastMessage: '', // 初始化最新消息
            lastMessageTime: '' // 初始化最新消息时间
          });
        } else {
          // 更新现有会话
          this.conversationList[existingIndex].isConcerned = true;
          // 同步用户信息
          this.conversationList[existingIndex].id = user.id;
          this.conversationList[existingIndex].uname = user.uname;
          this.conversationList[existingIndex].avatarUrl = user.avatarUrl;
        }
      });
    },

    // 添加未关注用户到会话列表
    addUnconcernedUserToConversation(name, id) {
      // 检查会话列表中是否已存在该用户
      const existingIndex = this.conversationList.findIndex(item => item.uname === name);
      if (existingIndex === -1) {
        // 创建未关注用户的会话，使用用户名作为ID（后端需要支持这种格式）
        this.conversationList.push({
          id: name, // 使用用户名作为ID，确保与后端兼容
          uname: name,
          avatarUrl: '/image/profile/01.jpg', // 默认头像
          isConcerned: false, // 标记为未关注
          lastMessage: '', // 最新消息
          lastMessageTime: '' // 最新消息时间
        });
      }
    }
  },

  // ✅ 添加计算属性，按当前会话过滤消息
  computed: {
    filteredMessages() {
      if (!this.activeConversation) return this.messages;

      return this.messages.filter(msg => {
        // 显示当前会话的消息
        return msg.conversationId === this.activeConversation ||
          (msg.isSelf && msg.receiver === this.activeConversation) ||
          (!msg.isSelf && msg.sender === this.activeConversation);
      });
    }
  }
});