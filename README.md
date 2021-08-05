# VueCore Vue

A set of interoperable plugins based on one config setup.

## Installing

```
npm i @cherrypulp/vue-core
```

In your script file : 

```
import {createApp} from 'vue';
import App from './App.vue';
import {VueCore} from './../../dist';

import './index.css';

createApp(App)
    .use(VueCore, {
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
```

### List of available plugins : 

- [https://www.npmjs.com/package/@cherrypulp/i18n](https://www.npmjs.com/package/@cherrypulp/i18n)
- [https://www.npmjs.com/package/axios](https://www.npmjs.com/package/axios)

### Exemples



### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

