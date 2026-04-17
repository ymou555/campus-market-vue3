<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '750px'
  }
});
</script>

<template>
  <div class="page-card" :style="{ width: width }">
    <h2 v-if="title" class="card-title">{{ title }}</h2>
    <slot></slot>
  </div>
</template>

<style scoped lang="css">
.page-card {
  padding: 46px 40px 32px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
  margin: 20px auto;
}

.card-title {
  color: #000000;
  font-size: 36px;
  font-family: Inter;
  font-weight: 700;
  line-height: 42px;
  margin-bottom: 30px;
  text-align: center;
}
</style>
