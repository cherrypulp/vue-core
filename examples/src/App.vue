<template>
  <div class="container">
    <h1>Vue Blok</h1>
    {{ __("hello") }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>

<style scoped>
.container {
  padding: 2em;
  max-width: 700px;
  margin: auto;
}

h1 {
  text-align: center;
  display: block;
  margin: 1em auto 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 2em;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-bottom: 2px solid #000000;
}

nav > a {
  font-size: 20px;
  margin: 8px;
}

.router-link-active {
  color: rgba(184, 58, 0, 0.75);
}
</style>
