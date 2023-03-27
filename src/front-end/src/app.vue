<template>
  <div>
    <button @click="() => title += 1">加1</button>
    {{ title }}
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default {
  setup() {
    const title = ref(1);

    return { title };
  },
};
</script>
