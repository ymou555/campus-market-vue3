<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import BackButton from '../components/BackButton.vue';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const merchant = reactive({
  id: null,
  name: '',
  rating: 0,
  sales: 0,
  reviewCount: 0,
  level: 1
});

const productList = ref([]);
const reviews = ref([]);

const getMerchantAvatarText = () => {
  if (!merchant.name) {
    return '?';
  }
  return merchant.name.substring(0, 2).toUpperCase();
};

const fetchMerchantInfo = async () => {
  try {
    const merchantId = route.params.id;
    if (!merchantId) {
      ElMessage.error('商家ID不存在');
      return;
    }
    
    const response = await axios.get(`/merchant/stats/by-user?userId=${merchantId}`);
    if (response && response.code === 200) {
      const data = response.data;
      merchant.id = data.userId;
      merchant.name = data.shopName;
      merchant.rating = data.avgRating;
      merchant.sales = data.totalSales;
      merchant.reviewCount = data.reviewCount;
      merchant.level = data.levelId;
    } else {
      ElMessage.error(response?.message || '获取商家信息失败');
    }
  } catch (error) {
    console.error('获取商家信息失败:', error);
    ElMessage.error('获取商家信息失败，请稍后重试');
  }
};

const fetchMerchantProducts = async () => {
  try {
    const merchantId = route.params.id;
    if (!merchantId) {
      return;
    }
    
    const response = await axios.get(`/product/merchant/list?merchantId=${merchantId}`);
    if (response && response.code === 200) {
      productList.value = response.data.map(item => ({
        id: item.id,
        name: item.productName,
        price: item.discountPrice,
        merchant: merchant.name,
        image: item.firstImage ? `http://localhost:8080/campus-market${item.firstImage}` : ''
      }));
    }
  } catch (error) {
    console.error('获取商家商品失败:', error);
  }
};

const fetchMerchantReviews = async () => {
  try {
    const merchantId = route.params.id;
    if (!merchantId) {
      return;
    }
    
    const response = await axios.get(`/review/merchant/list?merchantId=${merchantId}`);
    if (response && response.code === 200) {
      reviews.value = response.data.map(item => ({
        id: item.id,
        user: item.username,
        rating: item.rating,
        content: item.content,
        time: item.createTime
      }));
    }
  } catch (error) {
    console.error('获取商家评价失败:', error);
  }
};

const getLevelText = (level) => {
  const levelMap = {
    1: '初级商家',
    2: '中级商家',
    3: '高级商家',
    4: '金牌商家',
    5: '钻石商家'
  };
  return levelMap[level] || '初级商家';
};

const getLevelColor = (level) => {
  const colorMap = {
    1: '#999999',
    2: '#666666',
    3: '#ff9800',
    4: '#ffd700',
    5: '#00bcd4'
  };
  return colorMap[level] || '#999999';
};

onMounted(() => {
  fetchMerchantInfo();
  fetchMerchantProducts();
  fetchMerchantReviews();
});
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台</span>
    </div>
    <div class="flex-row justify-start items-center self-start mb-20">
      <BackButton />
    </div>
    
    <div class="shop-container">
      <div class="shop-header">
        <div class="shop-avatar">
          <span class="avatar-text">{{ getMerchantAvatarText() }}</span>
        </div>
        <div class="shop-info">
          <div class="shop-name">{{ merchant.name }}</div>
          <div class="shop-level" :style="{ color: getLevelColor(merchant.level) }">
            {{ getLevelText(merchant.level) }}
          </div>
          <div class="shop-stats">
            <div class="stat-item">
              <span class="stat-label">评分</span>
              <span class="stat-value">{{ merchant.rating }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">销量</span>
              <span class="stat-value">{{ merchant.sales }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评价</span>
              <span class="stat-value">{{ merchant.reviewCount }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">全部商品</h3>
          <span class="product-count">共 {{ productList.length }} 件</span>
        </div>
        <div class="product-grid" v-if="productList.length > 0">
          <ProductCard 
            v-for="product in productList" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        <div class="empty-tip" v-else>
          <span class="empty-text">暂无商品</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">用户评价</h3>
          <span class="review-count">共 {{ reviews.length }} 条</span>
        </div>
        <div class="review-list" v-if="reviews.length > 0">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-avatar">
              <span class="avatar-text-small">{{ review.user ? review.user.substring(0, 2).toUpperCase() : '?' }}</span>
            </div>
            <div class="review-content">
              <div class="review-header">
                <span class="review-user">{{ review.user }}</span>
                <div class="review-rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
                </div>
              </div>
              <p class="review-text">{{ review.content }}</p>
              <span class="review-time">{{ review.time }}</span>
            </div>
          </div>
        </div>
        <div class="empty-tip" v-else>
          <span class="empty-text">暂无评价</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.mb-20 {
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.page {
  padding: 0px 30px 65px;
  background-color: #cb5647;
  background-image: radial-gradient(circle, #a03a30 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100%;
}

.group {
  padding: 15px 0;
}

.image {
  border-radius: 100px;
  width: 45px;
  height: 45px;
}

.text {
  color: #ffffff;
  font-size: 22px;
  font-family: Inter;
  font-weight: 800;
  line-height: 21.5px;
}

.shop-container {
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.shop-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #ffffff;
  font-size: 32px;
  font-family: Inter;
  font-weight: 600;
  line-height: 30px;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 24px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.shop-level {
  font-size: 14px;
  font-family: Inter;
  font-weight: 500;
  margin-bottom: 12px;
}

.shop-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
  font-family: Inter;
}

.stat-value {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.product-count,
.review-count {
  font-size: 14px;
  color: #999999;
  font-family: Inter;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 340px;
  row-gap: 11.5px;
  column-gap: 16.5px;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
}

.empty-text {
  font-size: 16px;
  font-family: Inter;
  color: #999999;
  font-weight: 500;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.avatar-text-small {
  color: #ffffff;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  line-height: 14px;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  font-size: 14px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 14px;
  color: #d9d9d9;
}

.star.filled {
  color: #ff9800;
}

.review-text {
  font-size: 14px;
  line-height: 1.6;
  color: #666666;
  margin: 0 0 8px 0;
  font-family: Inter;
}

.review-time {
  font-size: 12px;
  color: #999999;
  font-family: Inter;
}
</style>
