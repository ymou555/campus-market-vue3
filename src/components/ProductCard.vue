<template>
  <div class="flex-col grid-item" @click="goToProductDetail">
    <div class="shrink-0 self-stretch section_3"></div>
    <span class="self-start font_2 text_6">{{ product.name }}</span>
    <div class="self-start group">
      <span class="font_4">￥</span>
      <span class="font_3">{{ product.price }}</span>
    </div>
    <div class="flex-row self-stretch group_3">
      <img
        class="image_2"
        src="https://ide.code.fun/api/image?token=69e0ef3d97ce84001185e058&name=85270b8dd7011891e9a2086683eb540f.png"
      />
      <span class="font ml-11">{{ product.merchant }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      name: '商品名称',
      price: 0,
      merchant: '商家名称'
    })
  }
});

const goToProductDetail = () => {
  // 跳转到商品详情页
  router.push(`/product/${props.product.id}`);
};
</script>

<style scoped lang="css">
.grid-item {
  padding-bottom: 6px;
  background-color: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.grid-item:hover {
  filter: drop-shadow(0px 0px 7.5px #00000040);
  transform: translateY(-2px);
  background-color: #f8f8f8;
}
.section_3 {
  background-color: #e0e0e0;
  height: 240px;
}
.font_2 {
  font-size: 16px;
  font-family: Inter;
  line-height: 16px;
  color: #333333;
}
.text_6 {
  margin-left: 12px;
  margin-top: 6px;
  line-height: 16.5px;
}
.group {
  margin-left: 12px;
  margin-top: 16px;
  line-height: 16px;
}
.font_4 {
  font-size: 14px;
  font-family: Inter;
  line-height: 12px;
  font-weight: 700;
  color: #ff0000;
}
.font_3 {
  font-size: 18px;
  font-family: Inter;
  line-height: 16px;
  font-weight: 700;
  color: #ff0000;
}
.group_3 {
  margin-top: 8px;
  padding: 0 10px;
}
.image_2 {
  width: 14px;
  height: 14px;
}
.font {
  font-size: 12px;
  font-family: Inter;
  line-height: 12px;
  color: #999999;
}
.ml-11 {
  margin-left: 11px;
}
</style>
