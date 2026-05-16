<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const currentTab = ref('pendingProducts');
const completedSubTab = ref('product');

const pendingProducts = ref([]);
const pendingMerchants = ref([]);

const completedReviews = ref([]);

const showReviewDialog = ref(false);
const currentReview = reactive({
  orderId: '',
  orderNo: '',
  productName: '',
  productId: null,
  merchantId: null,
  merchantName: '',
  rating: 5,
  content: ''
});

const openReviewDialog = (item) => {
  currentReview.orderId = item.orderId;
  currentReview.orderNo = item.orderNo;
  currentReview.productName = item.productName;
  currentReview.productId = item.productId;
  currentReview.merchantId = item.merchantId;
  currentReview.merchantName = item.merchant;
  currentReview.rating = 5;
  currentReview.content = '';
  showReviewDialog.value = true;
};

const submitSingleReview = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.post('/review/add', {
      orderId: currentReview.orderId,
      userId: userStore.userInfo.id,
      targetId: currentReview.productId,
      targetType: 'product',
      rating: currentReview.rating,
      content: currentReview.content || ''
    });
    
    if (response && response.code === 200) {
      ElMessage.success('评价成功');
      showReviewDialog.value = false;
      
      const index = pendingProducts.value.findIndex(p => p.productId === currentReview.productId);
      if (index > -1) {
        pendingProducts.value.splice(index, 1);
      }
      
      await fetchCompletedReviews();
    } else {
      ElMessage.error(response?.message || '评价失败');
    }
  } catch (error) {
    console.error('提交评价失败:', error);
    ElMessage.error('提交评价失败，请稍后重试');
  }
};

const openMerchantReviewDialog = (merchant) => {
  currentReview.orderId = merchant.orderId;
  currentReview.orderNo = merchant.orderNo;
  currentReview.merchantId = merchant.merchantId;
  currentReview.merchantName = merchant.merchantName;
  currentReview.productName = '';
  currentReview.rating = 5;
  currentReview.content = '';
  showReviewDialog.value = true;
};

const submitMerchantReview = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  const existingReview = completedReviews.value.find(
    r => r.reviewType === 'merchant' && r.merchantId === currentReview.merchantId && r.orderId === currentReview.orderId
  );
  
  if (existingReview) {
    ElMessage.warning('该商家已评价');
    showReviewDialog.value = false;
    return;
  }
  
  try {
    const response = await axios.post('/review/add', {
      orderId: currentReview.orderId,
      userId: userStore.userInfo.id,
      targetId: currentReview.merchantId,
      targetType: 'merchant',
      rating: currentReview.rating,
      content: currentReview.content || ''
    });
    
    if (response && response.code === 200) {
      ElMessage.success('商家评价成功');
      showReviewDialog.value = false;
      
      const index = pendingMerchants.value.findIndex(
        m => m.merchantId === currentReview.merchantId && m.orderId === currentReview.orderId
      );
      if (index > -1) {
        pendingMerchants.value.splice(index, 1);
      }
      
      await fetchCompletedReviews();
    } else {
      ElMessage.error(response?.message || '评价失败');
    }
  } catch (error) {
    console.error('提交商家评价失败:', error);
    ElMessage.error('提交商家评价失败，请稍后重试');
  }
};

const fetchPendingProducts = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.get('/review/pending/products', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      pendingProducts.value = response.data.map(item => ({
        ...item,
        productImage: 'http://localhost:8080/campus-market' + item.productImage
      }));
    } else {
      ElMessage.error(response?.message || '获取待评价商品列表失败');
    }
  } catch (error) {
    console.error('获取待评价商品列表失败:', error);
    ElMessage.error('获取待评价商品列表失败，请稍后重试');
  }
};

const fetchPendingMerchants = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.get('/review/pending/merchants', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      pendingMerchants.value = response.data.map(item => ({
        ...item,
        productImage: 'http://localhost:8080/campus-market' + item.productImage
      }));
    } else {
      ElMessage.error(response?.message || '获取待评价商家列表失败');
    }
  } catch (error) {
    console.error('获取待评价商家列表失败:', error);
    ElMessage.error('获取待评价商家列表失败，请稍后重试');
  }
};

const fetchCompletedReviews = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.get('/review/user/list', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      completedReviews.value = response.data.map(item => {
        if (item.productImage) {
          return {
            ...item,
            productImage: 'http://localhost:8080/campus-market' + item.productImage
          };
        }
        return item;
      });
    } else {
      ElMessage.error(response?.message || '获取已评价列表失败');
    }
  } catch (error) {
    console.error('获取已评价列表失败:', error);
    ElMessage.error('获取已评价列表失败，请稍后重试');
  }
};

const pendingProductsCount = computed(() => pendingProducts.value.length);
const pendingMerchantsCount = computed(() => pendingMerchants.value.length);
const completedProductReviews = computed(() => completedReviews.value.filter(r => r.reviewType === 'product'));
const completedMerchantReviews = computed(() => completedReviews.value.filter(r => r.reviewType === 'merchant'));
const completedProductReviewsCount = computed(() => completedProductReviews.value.length);
const completedMerchantReviewsCount = computed(() => completedMerchantReviews.value.length);

onMounted(() => {
  fetchPendingProducts();
  fetchPendingMerchants();
  fetchCompletedReviews();
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
    
    <div class="reviews-container">
      <div class="tabs-wrapper">
        <div 
          class="tab-item"
          :class="{ active: currentTab === 'pendingProducts' }"
          @click="currentTab = 'pendingProducts'"
        >
          待评价商品 ({{ pendingProductsCount }})
        </div>
        <div 
          class="tab-item"
          :class="{ active: currentTab === 'pendingMerchants' }"
          @click="currentTab = 'pendingMerchants'"
        >
          待评价商家 ({{ pendingMerchantsCount }})
        </div>
        <div 
          class="tab-item"
          :class="{ active: currentTab === 'completed' }"
          @click="currentTab = 'completed'"
        >
          已评价
        </div>
      </div>
      
      <div v-if="currentTab === 'pendingProducts'" class="review-list">
        <div v-if="pendingProducts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无待评价商品</div>
        </div>
        <div v-for="item in pendingProducts" :key="item.id" class="review-item">
          <img :src="item.productImage" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-meta">
              <span>商家: {{ item.merchant }}</span>
              <span>¥{{ item.price }} x {{ item.quantity }}</span>
            </div>
            <div class="order-info">订单号: {{ item.orderNo }}</div>
          </div>
          <button class="review-btn" @click="openReviewDialog(item)">去评价</button>
        </div>
      </div>
      
      <div v-else-if="currentTab === 'pendingMerchants'" class="review-list">
        <div v-if="pendingMerchants.length === 0" class="empty-state">
          <div class="empty-icon">🏪</div>
          <div class="empty-text">暂无待评价商家</div>
        </div>
        <div v-for="merchant in pendingMerchants" :key="merchant.id" class="merchant-item">
          <div class="merchant-images">
            <img 
              :src="merchant.productImage" 
              class="product-thumb"
            />
          </div>
          <div class="merchant-info">
            <div class="merchant-name">{{ merchant.merchantName }}</div>
            <div class="merchant-real-name">商家: {{ merchant.merchantRealName }}</div>
            <div class="order-info">订单号: {{ merchant.orderNo }}</div>
            <div class="products-preview">{{ merchant.productNames.join('、') }}</div>
            <div class="order-time">订单完成时间: {{ merchant.createTime }}</div>
          </div>
          <button class="review-btn" @click="openMerchantReviewDialog(merchant)">评价商家</button>
        </div>
      </div>
      
      <div v-else class="completed-section">
        <div class="sub-tabs-wrapper">
          <div 
            class="sub-tab-item"
            :class="{ active: completedSubTab === 'product' }"
            @click="completedSubTab = 'product'"
          >
            商品评价 ({{ completedProductReviewsCount }})
          </div>
          <div 
            class="sub-tab-item"
            :class="{ active: completedSubTab === 'merchant' }"
            @click="completedSubTab = 'merchant'"
          >
            商家评价 ({{ completedMerchantReviewsCount }})
          </div>
        </div>
        
        <div v-if="completedSubTab === 'product'" class="review-list">
          <div v-if="completedProductReviews.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">暂无已评价商品</div>
          </div>
          <div v-for="review in completedProductReviews" :key="review.id" class="completed-item">
            <div class="item-header">
              <img :src="review.productImage" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ review.productName }}</div>
                <div class="product-meta">
                  <span>商家: {{ review.merchant }}</span>
                  <span>¥{{ review.price }} x {{ review.quantity }}</span>
                </div>
              </div>
              <div class="rating-wrapper">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
              </div>
            </div>
            <div class="item-content">
              <p class="review-text">{{ review.content || '用户未填写评价内容' }}</p>
            </div>
            <div class="item-footer">
              <span class="review-time">{{ review.createTime }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="review-list">
          <div v-if="completedMerchantReviews.length === 0" class="empty-state">
            <div class="empty-icon">🏪</div>
            <div class="empty-text">暂无已评价商家</div>
          </div>
          <div v-for="review in completedMerchantReviews" :key="review.id" class="completed-merchant-item">
            <div class="merchant-header">
              <div class="merchant-avatar">
                <span class="avatar-text">{{ review.merchantName.substring(0, 2) }}</span>
              </div>
              <div class="merchant-detail">
                <div class="merchant-name">{{ review.merchantName }}</div>
                <div class="merchant-real-name">商家: {{ review.merchantRealName }}</div>
                <div class="order-no">订单号: {{ review.orderNo }}</div>
              </div>
              <div class="rating-wrapper">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
              </div>
            </div>
            <div class="item-content">
              <p class="review-text">{{ review.content || '用户未填写评价内容' }}</p>
            </div>
            <div class="item-footer">
              <span class="review-time">{{ review.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showReviewDialog" :title="currentReview.productName ? '商品评价' : '商家评价'" width="600px">
      <div class="review-form">
        <div v-if="currentReview.productName" class="form-item">
          <span class="form-label">商品名称</span>
          <span class="form-value">{{ currentReview.productName }}</span>
        </div>
        <div v-if="!currentReview.productName && currentReview.merchantName" class="form-item">
          <span class="form-label">商家名称</span>
          <span class="form-value">{{ currentReview.merchantName }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">{{ currentReview.productName ? '商品评分' : '商家评分' }}</span>
          <div class="rating-input">
            <span 
              v-for="i in 5" 
              :key="i" 
              class="star-input"
              :class="{ filled: i <= currentReview.rating }"
              @click="currentReview.rating = i"
            >★</span>
          </div>
        </div>
        <div class="form-item">
          <span class="form-label">{{ currentReview.productName ? '评价内容' : '商家评价' }}</span>
          <textarea 
            v-model="currentReview.content"
            class="content-input"
            :placeholder="currentReview.productName ? '请输入评价内容...' : '请输入商家评价内容...'"
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showReviewDialog = false">取消</button>
        <button 
          v-if="currentReview.productName"
          class="dialog-btn confirm-btn" 
          @click="submitSingleReview"
        >提交评价</button>
        <button 
          v-else
          class="dialog-btn confirm-btn" 
          @click="submitMerchantReview"
        >提交评价</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
.page {
  padding: 15px 30px 65px;
  background-color: #cb5647;
  background-image: radial-gradient(circle, #a03a30 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100%;
}

.reviews-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.tabs-wrapper {
  display: flex;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  font-family: Inter;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #cb5747;
  background-color: rgba(203, 87, 71, 0.02);
}

.tab-item.active {
  color: #cb5747;
  font-weight: 600;
  border-bottom-color: #cb5747;
  background-color: #ffffff;
}

.sub-tabs-wrapper {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
}

.sub-tab-item {
  padding: 12px 24px;
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.sub-tab-item:hover {
  color: #cb5747;
}

.sub-tab-item.active {
  color: #cb5747;
  font-weight: 600;
  border-bottom-color: #cb5747;
}

.review-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  font-family: Inter;
  color: #999999;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.review-item:hover {
  background-color: #f5f5f5;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.merchant-item:hover {
  background-color: #f5f5f5;
}

.merchant-images {
  display: flex;
  gap: 8px;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-info {
  flex: 1;
}

.merchant-info {
  flex: 1;
}

.product-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.merchant-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
  margin-bottom: 6px;
}

.merchant-real-name {
  font-size: 13px;
  font-family: Inter;
  color: #666666;
  margin-bottom: 4px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-family: Inter;
  color: #999999;
  margin-bottom: 4px;
}

.order-info {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
  margin-bottom: 4px;
}

.products-preview {
  font-size: 12px;
  font-family: Inter;
  color: #666666;
  margin-bottom: 4px;
}

.order-time {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.review-btn {
  padding: 10px 24px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.review-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.completed-item {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.completed-item:hover {
  background-color: #f5f5f5;
}

.completed-merchant-item {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.completed-merchant-item:hover {
  background-color: #f5f5f5;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
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
  font-size: 20px;
  font-family: Inter;
  font-weight: 600;
}

.merchant-detail {
  flex: 1;
}

.order-no {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.rating-wrapper {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 18px;
  color: #d9d9d9;
}

.star.filled {
  color: #ff9800;
}

.item-content {
  margin-bottom: 12px;
}

.review-text {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-time {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.form-value {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.rating-input {
  display: flex;
  gap: 8px;
}

.star-input {
  font-size: 32px;
  color: #d9d9d9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-input.filled {
  color: #ff9800;
}

.star-input:hover {
  transform: scale(1.1);
}

.content-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.content-input:hover:not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.content-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.dialog-btn {
  padding: 10px 32px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.cancel-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
}
</style>
