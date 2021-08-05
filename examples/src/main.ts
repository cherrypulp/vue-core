import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import { VueCore } from '@cherrypulp/vue-core';

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
