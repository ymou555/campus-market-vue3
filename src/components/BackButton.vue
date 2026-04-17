<script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const goBack = () => {
    router.back();
  };
</script>

<template>
  <div class="back-button" @click="goBack">
    <span class="back-text">返回</span>
  </div>
</template>

<style scoped lang="css">
  .back-button {
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 8px 16px;
    border-radius: 100px;
    border: solid 2px #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .back-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  .back-text {
    color: #ffffff;
    font-size: 16px;
    font-family: Inter;
    font-weight: 600;
    line-height: 15px;
  }
</style>