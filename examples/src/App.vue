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
.container {
  padding: 2em;
  max-width: 700px;
  margin: auto;
}
</style>
