new Vue({
  el: '#app',
  data: {
    activeMessageType: '私信',
    activeConversation: '张三'
  },
  methods: {
    // 选择消息类型
    selectMessageType(type) {
      this.activeMessageType = type;
    },
    // 选择会话
    selectConversation(name) {
      this.activeConversation = name;
    }
  }
});