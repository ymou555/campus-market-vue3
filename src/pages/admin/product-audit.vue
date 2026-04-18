<script setup>
import { ref } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const currentTab = ref('pending');

const tabs = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
];

const pendingProducts = ref([
  { id: 1, name: 'MacBook Pro 2021', price: 12999, merchant: '数码小店', image: 'https://via.placeholder.com/100', submitTime: '2024-01-15 10:30:00' },
  { id: 2, name: '运动跑鞋', price: 199, merchant: '运动装备', image: 'https://via.placeholder.com/100', submitTime: '2024-01-14 15:20:00' }
]);

const showDetailDialog = ref(false);
const showAuditDialog = ref(false);
const currentProduct = ref(null);
const auditOpinion = ref('');

const viewDetail = (product) => {
  currentProduct.value = product;
  showDetailDialog.value = true;
};

const openAuditDialog = (product) => {
  currentProduct.value = product;
  auditOpinion.value = '';
  showAuditDialog.value = true;
};

const handleAudit = (approved) => {
  if (!approved && !auditOpinion.value) {
    ElMessage.error('请填写拒绝原因');
    return;
  }
  
  const index = pendingProducts.value.findIndex(p => p.id === currentProduct.value.id);
  if (index > -1) {
    pendingProducts.value.splice(index, 1);
  }
  
  showAuditDialog.value = false;
  ElMessage.success(approved ? '审核通过' : '已拒绝');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商品审核</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="audit-container">
      <div class="tabs-wrapper">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>
      
      <div class="product-list">
        <div v-for="product in pendingProducts" :key="product.id" class="product-item">
          <img :src="product.image" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-meta">
              <span>价格: ¥{{ product.price }}</span>
              <span>商家: {{ product.merchant }}</span>
              <span>提交时间: {{ product.submitTime }}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="action-btn" @click="viewDetail(product)">查看详情</button>
            <button class="action-btn primary-btn" @click="openAuditDialog(product)">审核</button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showDetailDialog" title="商品详情" width="600px">
      <div v-if="currentProduct" class="detail-content">
        <img :src="currentProduct.image" class="detail-image" />
        <div class="detail-item">
          <span class="detail-label">商品名称</span>
          <span class="detail-value">{{ currentProduct.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">价格</span>
          <span class="detail-value">¥{{ currentProduct.price }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">商家</span>
          <span class="detail-value">{{ currentProduct.merchant }}</span>
        </div>
      </div>
    </el-dialog>
    
    <el-dialog v-model="showAuditDialog" title="审核商品" width="500px">
      <div v-if="currentProduct" class="audit-content">
        <div class="audit-info">
          <span class="audit-label">商品名称:</span>
          <span class="audit-value">{{ currentProduct.name }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">审核意见</span>
          <textarea 
            v-model="auditOpinion"
            class="form-textarea"
            placeholder="请填写审核意见（拒绝时必填）..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn reject-btn" @click="handleAudit(false)">拒绝</button>
        <button class="dialog-btn confirm-btn" @click="handleAudit(true)">通过</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
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

.audit-container {
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

.tab-item.active {
  color: #cb5747;
  font-weight: 600;
  border-bottom-color: #cb5747;
  background-color: #ffffff;
}

.product-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 20px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 13px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.primary-btn {
  background-color: #cb5747;
  border-color: #cb5747;
  color: #ffffff;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-image {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #999999;
}

.detail-value {
  font-size: 15px;
  color: #333333;
}

.audit-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-info {
  display: flex;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reject-btn {
  background-color: #ffffff;
  border: 1px solid #f44336;
  color: #f44336;
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}
</style>
