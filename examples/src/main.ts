import {createApp} from 'vue';
import App from './App.vue';
import {Blok} from './../../dist';

import './index.css';

createApp(App)
    .use(Blok, {
        api: {
            url: '/api',
        },
        i18n: {
            translations: {
                hello: 'Hello World !',
            },
            language: 'en'
        }
    })
    .mount('#app');
