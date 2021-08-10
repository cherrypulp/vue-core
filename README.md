# VueCore

A set of interoperable plugins based on one simple config setup.

## Why ?

Finding and configuring plugins could be daunting and cumbersome. 

GetBlok helps you to choose the right combo to have interroperable plugins for your bootstrapped Vue project with an opiniated design.

## Installing

```
npm i @cherrypulp/vue-core
```

In your script file : 

```
import {createApp} from 'vue';
import App from './App.vue';
import {VueCore} from '@cherrypulp/vue-core';
// @see : https://2x.antdv.com/docs/vue/customize-theme
import 'ant-design-vue/dist/antd.css';

import './index.css';

createApp(App)
    .use(VueCore, {
        api: {
            url: 'https://jsonplaceholder.typicode.com', // Replace with your api endpoint
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
- [https://2x.antdv.com/](https://2x.antdv.com/)
- [https://lodash.com/](https://lodash.com/)

### Example

This will automatically add 3 helpers, $http for http request, $api for api request, __ for translations.

````
<template>
  <div class="container">
    <h1>GetBlok : a playwork for smarter kids</h1>

    <h2>Helpers for translation</h2>

    {{ __('hello') }}

    <h2>
      Message and notification helpers using
      <a href="https://2x.antdv.com/" target="_blank">Antd</a>
    </h2>

    <div>
      <a-button @click="() => $message.info('Test')">Message</a-button>
      <a-button
        @click="() => $notification.open({ message: 'Notification Title' })"
        >Notification
      </a-button>
    </div>

    <div v-if="$config">
      <h2>Accessing Config via a smart getter/setter :</h2>
      {{ $config.get('api.url') }}
    </div>

    <h2>Make an api call</h2>

    <code>
      this.$api.get('posts')
    </code>
    <a-spin :spinning="loading" />
    <ul>
      <li v-bind:key="key" v-for="(post, key) in posts">{{ post.title }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      posts: [],
      loading: true,
    };
  },
  mounted() {
    this.fetchAll();
  },
  methods: {
    fetchAll() {
      this.$api.get('posts').then(res => {
        this.loading = false;
        this.posts = res.data;
      });
    },
  },
};
</script>

<style scoped>
.container {
  padding: 2em;
  max-width: 700px;
  margin: auto;
}
</style>
````

## How to test or contribute

Feel free to add your issues or suggestion in .

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

