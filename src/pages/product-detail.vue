<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import StatusTag from '../components/StatusTag.vue';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const product = reactive({
  id: null,
  name: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  size: '',
  salesCount: 0,
  isNegotiable: true,
  condition: 'good',
  description: '',
  images: []
});

const merchant = reactive({
  id: null,
  name: '',
  rating: 0,
  sales: 0,
  reviewCount: 0
});

const reviews = ref([
  { id: 1, user: '用户A', rating: 5, content: '商品质量很好，卖家很诚信', time: '2024-01-15', avatar: 'https://via.placeholder.com/40' },
  { id: 2, user: '用户B', rating: 4, content: '发货速度快，包装完好', time: '2024-01-10', avatar: 'https://via.placeholder.com/40' },
  { id: 3, user: '用户C', rating: 5, content: '性价比很高，推荐购买', time: '2024-01-05', avatar: 'https://via.placeholder.com/40' }
]);

const currentImageIndex = ref(0);
const quantity = ref(1);
const isCollected = ref(false);

const conditionMap = {
  'new': { text: '全新', status: 'success' },
  'like_new': { text: '几乎全新', status: 'success' },
  'good': { text: '良好', status: 'info' },
  'fair': { text: '一般', status: 'warning' }
};

const fetchProductDetail = async () => {
  try {
    const productId = route.params.id || route.query.id;
    if (!productId) {
      ElMessage.error('商品ID不存在');
      return;
    }
    
    const response = await axios.get(`/product/detail?id=${productId}`);
    if (response && response.code === 200) {
      const productData = response.product;
      product.id = productData.id;
      product.name = productData.productName;
      product.price = productData.discountPrice;
      product.originalPrice = productData.originalPrice;
      product.stock = productData.stock;
      product.size = productData.size;
      product.salesCount = productData.salesCount;
      product.isNegotiable = productData.isNegotiable;
      product.condition = productData.newness;
      product.description = productData.description;
      
      if (response.images && response.images.length > 0) {
        product.images = response.images.map(img => 
          `http://localhost:8080/campus-market${img.imageUrl}`
        );
      }
      
      fetchMerchantStats(productId);
    } else {
      ElMessage.error(response?.message || '获取商品详情失败');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败，请稍后重试');
  }
};

const fetchMerchantStats = async (productId) => {
  try {
    const response = await axios.get(`/merchant/stats?productId=${productId}`);
    if (response && response.code === 200) {
      const data = response.data;
      merchant.id = data.userId;
      merchant.name = data.shopName;
      merchant.rating = data.avgRating;
      merchant.sales = data.totalSales;
      merchant.reviewCount = data.reviewCount;
    }
  } catch (error) {
    console.error('获取商家信息失败:', error);
  }
};

const getMerchantAvatarText = () => {
  if (!merchant.name) {
    return '?';
  }
  return merchant.name.substring(0, 2).toUpperCase();
};

const selectImage = (index) => {
  currentImageIndex.value = index;
};

const goToMerchant = () => {
  router.push(`/shop/${merchant.id}`);
};

const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  ElMessage.success(isCollected.value ? '收藏成功' : '已取消收藏');
};

const addToCart = () => {
  ElMessage.success('已加入购物车');
};

const buyNow = () => {
  ElMessage.success('跳转到确认订单页面');
  router.push('/order-confirm');
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQuantity = () => {
  if (quantity.value < product.stock) {
    quantity.value++;
  }
};

const negotiateDialogVisible = ref(false);
const negotiatePrice = ref('');

const openNegotiateDialog = () => {
  if (product.isNegotiable) {
    negotiateDialogVisible.value = true;
    negotiatePrice.value = '';
  }
};

const submitNegotiate = () => {
  if (!negotiatePrice.value || isNaN(negotiatePrice.value) || parseFloat(negotiatePrice.value) <= 0) {
    ElMessage.warning('请输入有效的议价金额');
    return;
  }
  if (parseFloat(negotiatePrice.value) >= product.price) {
    ElMessage.warning('议价金额应低于商品价格');
    return;
  }
  ElMessage.success(`已提交议价申请：¥${negotiatePrice.value}`);
  negotiateDialogVisible.value = false;
  negotiatePrice.value = '';
};

onMounted(() => {
  fetchProductDetail();
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
    
    <div class="product-container">
      <div class="product-images">
        <div class="main-image">
          <img :src="product.images[currentImageIndex]" class="main-image-img" />
        </div>
        <div class="thumbnail-list">
          <div 
            v-for="(image, index) in product.images" 
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentImageIndex === index }"
            @click="selectImage(index)"
          >
            <img :src="image" class="thumbnail-img" />
          </div>
        </div>
      </div>
      
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        
        <div class="price-section">
          <div class="current-price">¥{{ product.price }}</div>
          <div class="original-price">原价 ¥{{ product.originalPrice }}</div>
        </div>
        
        <div class="info-row">
          <span class="info-label">新旧程度</span>
          <StatusTag 
            :status="conditionMap[product.condition].status" 
            :text="conditionMap[product.condition].text" 
          />
        </div>
        
        <div class="info-row">
          <span class="info-label">库存</span>
          <span class="info-value">{{ product.stock }} 件</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">尺寸</span>
          <span class="info-value">{{ product.size }}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">销量</span>
          <span class="info-value">{{ product.salesCount }} 件</span>
        </div>
        
        <div class="merchant-section">
          <div class="merchant-avatar">
            <span class="avatar-text">{{ getMerchantAvatarText() }}</span>
          </div>
          <div class="merchant-info">
            <div class="merchant-name">{{ merchant.name }}</div>
            <div class="merchant-stats">
              <span class="stat-item">评分: {{ merchant.rating }}</span>
              <span class="stat-item">销量: {{ merchant.sales }}</span>
            </div>
          </div>
          <button class="visit-btn" @click="goToMerchant">进入店铺</button>
        </div>
        
        <div class="quantity-section">
          <span class="info-label">数量</span>
          <div class="quantity-control">
            <button class="quantity-btn" @click="decreaseQuantity">-</button>
            <input type="number" v-model="quantity" class="quantity-input" min="1" :max="product.stock" />
            <button class="quantity-btn" @click="increaseQuantity">+</button>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn collect-btn" :class="{ collected: isCollected }" @click="toggleCollect">
            {{ isCollected ? '已收藏' : '收藏' }}
          </button>
          <button 
            class="action-btn negotiate-btn" 
            :class="{ disabled: !product.isNegotiable }"
            :disabled="!product.isNegotiable"
            @click="openNegotiateDialog"
          >
            {{ product.isNegotiable ? '议价' : '不可议价' }}
          </button>
          <button class="action-btn cart-btn" @click="addToCart">加入购物车</button>
          <button class="action-btn buy-btn" @click="buyNow">立即购买</button>
        </div>
      </div>
    </div>
    
    <el-dialog 
      v-model="negotiateDialogVisible" 
      title="议价申请" 
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="negotiate-dialog-content">
        <div class="negotiate-info">
          <span class="negotiate-label">商品价格：</span>
          <span class="negotiate-price">¥{{ product.price }}</span>
        </div>
        <div class="negotiate-input-section">
          <span class="negotiate-label">议价金额：</span>
          <el-input 
            v-model="negotiatePrice" 
            placeholder="请输入议价金额"
            type="number"
            class="negotiate-input"
          >
            <template #prepend>¥</template>
          </el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="negotiateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNegotiate">提交</el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="detail-container">
      <div class="description-section">
        <h3 class="section-title">商品描述</h3>
        <p class="description-text">{{ product.description }}</p>
      </div>
      
      <div class="reviews-section">
        <div class="reviews-header">
          <h3 class="section-title">商品评价</h3>
          <span class="view-all" @click="router.push(`/product/${product.id}/reviews`)">查看全部</span>
        </div>
        
        <div class="review-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <img :src="review.avatar" class="review-avatar" />
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.mb-20 {
  margin-bottom: 20px;
}

.page {
  padding: 0 30px 43px;
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

.product-container {
  display: flex;
  gap: 40px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  margin-bottom: 20px;
}

.product-images {
  flex: 0 0 400px;
}

.main-image {
  width: 400px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
}

.main-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumbnail-item.active {
  border-color: #cb5747;
}

.thumbnail-item:hover {
  border-color: #cb5747;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 24px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.current-price {
  font-size: 32px;
  font-family: Inter;
  font-weight: 700;
  color: #cb5747;
}

.original-price {
  font-size: 16px;
  color: #999999;
  text-decoration: line-through;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.info-label {
  font-size: 14px;
  color: #666666;
  font-family: Inter;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  color: #333333;
  font-family: Inter;
}

.merchant-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.merchant-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #ffffff;
  font-size: 24px;
  font-family: Inter;
  font-weight: 600;
  line-height: 22px;
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.merchant-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 13px;
  color: #999999;
  font-family: Inter;
}

.visit-btn {
  padding: 8px 20px;
  background-color: #ffffff;
  border: 1px solid #cb5747;
  border-radius: 100px;
  color: #cb5747;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.visit-btn:hover {
  background-color: #cb5747;
  color: #ffffff;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  background-color: #f5f5f5;
  color: #333333;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #cb5747;
  color: #ffffff;
}

.quantity-input {
  width: 60px;
  height: 36px;
  border: none;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 100px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.collect-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.collect-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.collect-btn.collected {
  background-color: rgba(203, 87, 71, 0.1);
  border-color: #cb5747;
  color: #cb5747;
}

.cart-btn {
  background-color: #ffffff;
  border: 2px solid #cb5747;
  color: #cb5747;
}

.cart-btn:hover {
  background-color: rgba(203, 87, 71, 0.1);
}

.buy-btn {
  background-color: #cb5747;
  color: #ffffff;
}

.buy-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.02);
}

.negotiate-btn {
  background-color: #ffffff;
  border: 2px solid #ff9800;
  color: #ff9800;
}

.negotiate-btn:hover {
  background-color: rgba(255, 152, 0, 0.1);
}

.negotiate-btn.disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.negotiate-btn.disabled:hover {
  background-color: #f5f5f5;
}

.negotiate-dialog-content {
  padding: 10px 0;
}

.negotiate-info {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.negotiate-label {
  font-size: 14px;
  color: #666666;
  font-family: Inter;
}

.negotiate-price {
  font-size: 18px;
  font-weight: 600;
  color: #cb5747;
  font-family: Inter;
}

.negotiate-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.negotiate-input {
  width: 100%;
}

::v-deep(.negotiate-input .el-input__wrapper) {
  border-radius: 8px;
}

::v-deep(.negotiate-input .el-input-group__prepend) {
  background-color: #f5f5f5;
  border-radius: 8px 0 0 8px;
  color: #666666;
  font-weight: 600;
}

.detail-container {
  padding: 30px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
}

.section-title {
  font-size: 20px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.description-section {
  margin-bottom: 40px;
}

.description-text {
  font-size: 15px;
  line-height: 1.8;
  color: #666666;
  font-family: Inter;
}

.reviews-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 30px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all {
  font-size: 14px;
  color: #cb5747;
  cursor: pointer;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #b04a3c;
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
  border: 1px solid #e0e0e0;
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
}

.review-time {
  font-size: 12px;
  color: #999999;
}
</style>
