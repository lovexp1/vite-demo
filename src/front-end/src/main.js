import { createApp, h } from 'vue';

const app = createApp({
  render() {
    return h('div', 'hello world');
  },
});

app.mount('#app');
