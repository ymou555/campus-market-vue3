<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import UploadImage from '../components/UploadImage.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const currentTab = ref('pending');

const pendingReviews = ref([
  { 
    id: 1, 
    orderId: '202401120004',
    productName: '编程书籍合集', 
    productImage: 'https://via.placeholder.com/80',
    merchant: '书香阁',
    price: 89,
    quantity: 1
  }
]);

const completedReviews = ref([
  {
    id: 1,
    orderId: '202401110005',
    productName: '二手自行车',
    productImage: 'https://via.placeholder.com/80',
    merchant: '单车世界',
    price: 450,
    quantity: 1,
    rating: 5,
    content: '商品质量很好，卖家很诚信，推荐购买！',
    images: ['https://via.placeholder.com/100'],
    createTime: '2024-01-12 10:30:00'
  }
]);

const showReviewDialog = ref(false);
const currentReview = reactive({
  orderId: '',
  productName: '',
  rating: 5,
  content: '',
  images: []
});

const openReviewDialog = (item) => {
  currentReview.orderId = item.orderId;
  currentReview.productName = item.productName;
  currentReview.rating = 5;
  currentReview.content = '';
  currentReview.images = [];
  showReviewDialog.value = true;
};

const submitReview = () => {
  if (!currentReview.content) {
    ElMessage.error('请输入评价内容');
    return;
  }
  
  const index = pendingReviews.value.findIndex(r => r.orderId === currentReview.orderId);
  if (index > -1) {
    const item = pendingReviews.value[index];
    completedReviews.value.unshift({
      id: Date.now(),
      orderId: item.orderId,
      productName: item.productName,
      productImage: item.productImage,
      merchant: item.merchant,
      price: item.price,
      quantity: item.quantity,
      rating: currentReview.rating,
      content: currentReview.content,
      images: currentReview.images,
      createTime: new Date().toLocaleString()
    });
    pendingReviews.value.splice(index, 1);
  }
  
  showReviewDialog.value = false;
  ElMessage.success('评价成功');
};

const editReview = (review) => {
  ElMessage.info('编辑评价功能开发中');
};
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
          :class="{ active: currentTab === 'pending' }"
          @click="currentTab = 'pending'"
        >
          待评价 ({{ pendingReviews.length }})
        </div>
        <div 
          class="tab-item"
          :class="{ active: currentTab === 'completed' }"
          @click="currentTab = 'completed'"
        >
          已评价 ({{ completedReviews.length }})
        </div>
      </div>
      
      <div v-if="currentTab === 'pending'" class="review-list">
        <div v-if="pendingReviews.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无待评价商品</div>
        </div>
        <div v-for="item in pendingReviews" :key="item.id" class="review-item">
          <img :src="item.productImage" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-meta">
              <span>商家: {{ item.merchant }}</span>
              <span>¥{{ item.price }} x {{ item.quantity }}</span>
            </div>
          </div>
          <button class="review-btn" @click="openReviewDialog(item)">去评价</button>
        </div>
      </div>
      
      <div v-else class="review-list">
        <div v-if="completedReviews.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无已评价商品</div>
        </div>
        <div v-for="review in completedReviews" :key="review.id" class="completed-item">
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
            <p class="review-text">{{ review.content }}</p>
            <div v-if="review.images.length > 0" class="review-images">
              <img v-for="(img, index) in review.images" :key="index" :src="img" class="review-image" />
            </div>
          </div>
          <div class="item-footer">
            <span class="review-time">{{ review.createTime }}</span>
            <button class="edit-btn" @click="editReview(review)">编辑</button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showReviewDialog" title="商品评价" width="600px">
      <div class="review-form">
        <div class="form-item">
          <span class="form-label">商品名称</span>
          <span class="form-value">{{ currentReview.productName }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">评分</span>
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
          <span class="form-label">评价内容</span>
          <textarea 
            v-model="currentReview.content"
            class="content-input"
            placeholder="请输入评价内容..."
            rows="4"
          ></textarea>
        </div>
        <div class="form-item">
          <span class="form-label">上传图片</span>
          <UploadImage 
            v-model="currentReview.images[0]"
            placeholder="点击上传评价图片"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showReviewDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="submitReview">提交评价</button>
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

.product-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
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

.item-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
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

.review-images {
  display: flex;
  gap: 8px;
}

.review-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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

.edit-btn {
  padding: 6px 16px;
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 12px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
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
