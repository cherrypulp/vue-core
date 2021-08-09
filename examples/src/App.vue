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
