import { createApp } from 'vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import './index.css';
import { VueCore } from '../../dist';

createApp(App)
  .use(VueCore, {
    api: {
      url: 'https://jsonplaceholder.typicode.com', // Replace with your api endpoint
    },
    i18n: {
      translations: {
        hello: 'Hello World !',
      },
      language: 'en',
    },
  })
  .mount('#app');
