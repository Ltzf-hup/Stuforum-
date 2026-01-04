  new Vue({
      el: '#app',
      data: {
        activeMessageType: '私信',
        activeConversation: '张三'
      },
      methods: {
        selectMessageType(type) {
          this.activeMessageType = type;
        },
        selectConversation(name) {
          this.activeConversation = name;
        }
      }
    });