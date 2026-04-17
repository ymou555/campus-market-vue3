<template>
  <div class="flex-col grid-item" @click="goToProductDetail">
    <img class="product-image" :src="product.image" v-if="product.image" />
    <div class="shrink-0 self-stretch section_3" v-else></div>
    <span class="self-start font_2 text_6">{{ product.name }}</span>
    <div class="self-start group">
      <span class="font_4">￥</span>
      <span class="font_3">{{ product.price }}</span>
    </div>
    <div class="flex-row self-stretch group_3">
      <div class="merchant-avatar-small">
        <span class="avatar-text-small">{{ getMerchantAvatarText() }}</span>
      </div>
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
      merchant: '商家名称',
      image: ''
    })
  }
});

const goToProductDetail = () => {
  router.push(`/product/${props.product.id}`);
};

const getMerchantAvatarText = () => {
  if (!props.product.merchant) {
    return '?';
  }
  return props.product.merchant.substring(0, 2).toUpperCase();
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
.product-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
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
  display: flex;
  align-items: center;
}
.merchant-avatar-small {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.avatar-text-small {
  color: #ffffff;
  font-size: 8px;
  font-family: Inter;
  font-weight: 600;
  line-height: 8px;
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
