# VueCore

A set of interoperable plugins based on one config setup.

## Installing

```
npm i @cherrypulp/vue-core
```

In your script file : 

```
import {createApp} from 'vue';
import App from './App.vue';
import {VueCore} from '@cherrypulp/vue-core';

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

### Example

This will automatically add 3 helpers, $http for http request, $api for api request, __ for translations.

````
<template>
  <div class="container">
    <h1>VueCore</h1>
    {{ __('hello') }}
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
    };
  },
  mounted() {
    this.fetchAll();
  },
  methods: {
    fetchAll() {
      this.$api.get('posts').then(res => {
        this.posts = res.data;
      });
    },
  },
};
</script>

<style scoped>
</style>
````

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

