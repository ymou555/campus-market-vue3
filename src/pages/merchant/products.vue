<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

const currentTab = ref('all');

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '已发布' },
  { value: 'off-shelf', label: '已下架' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '审核拒绝' }
];

const products = ref([
  { id: 1, name: 'iPhone 13 Pro', price: 5999, stock: 15, status: 'published', image: 'https://via.placeholder.com/100', sales: 23 },
  { id: 2, name: 'AirPods Pro', price: 1299, stock: 30, status: 'published', image: 'https://via.placeholder.com/100', sales: 45 },
  { id: 3, name: 'MacBook Pro', price: 12999, stock: 5, status: 'pending', image: 'https://via.placeholder.com/100', sales: 0 },
  { id: 4, name: '运动跑鞋', price: 199, stock: 50, status: 'off-shelf', image: 'https://via.placeholder.com/100', sales: 12 },
  { id: 5, name: '机械键盘', price: 299, stock: 20, status: 'rejected', image: 'https://via.placeholder.com/100', sales: 0, rejectReason: '商品图片不清晰' }
]);

const getStatusType = (status) => {
  const statusMap = {
    'published': 'success',
    'off-shelf': 'default',
    'pending': 'warning',
    'rejected': 'danger'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusMap = {
    'published': '已发布',
    'off-shelf': '已下架',
    'pending': '待审核',
    'rejected': '审核拒绝'
  };
  return statusMap[status] || '未知';
};

const editProduct = (productId) => {
  router.push(`/merchant/product-edit/${productId}`);
};

const toggleShelf = (product) => {
  const newStatus = product.status === 'published' ? 'off-shelf' : 'published';
  ElMessageBox.confirm(
    `确定要${newStatus === 'published' ? '上架' : '下架'}该商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    product.status = newStatus;
    ElMessage.success(`${newStatus === 'published' ? '上架' : '下架'}成功`);
  }).catch(() => {});
};

const deleteProduct = (productId) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = products.value.findIndex(p => p.id === productId);
    if (index > -1) {
      products.value.splice(index, 1);
      ElMessage.success('删除成功');
    }
  }).catch(() => {});
};

const goToPublish = () => {
  router.push('/merchant/product-publish');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商品管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="products-container">
      <div class="header-section">
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
        <button class="publish-btn" @click="goToPublish">发布商品</button>
      </div>
      
      <div class="products-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          <img :src="product.image" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-meta">
              <span>价格: ¥{{ product.price }}</span>
              <span>库存: {{ product.stock }}</span>
              <span>销量: {{ product.sales }}</span>
            </div>
            <div v-if="product.rejectReason" class="reject-reason">
              拒绝原因: {{ product.rejectReason }}
            </div>
          </div>
          <div class="product-status">
            <StatusTag :status="getStatusType(product.status)" :text="getStatusText(product.status)" />
          </div>
          <div class="product-actions">
            <button class="action-btn" @click="editProduct(product.id)">编辑</button>
            <button 
              v-if="product.status === 'published' || product.status === 'off-shelf'"
              class="action-btn"
              @click="toggleShelf(product)"
            >
              {{ product.status === 'published' ? '下架' : '上架' }}
            </button>
            <button class="action-btn delete-btn" @click="deleteProduct(product.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
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

.products-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.tabs-wrapper {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 8px 20px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.tab-item.active {
  background-color: #cb5747;
  border-color: #cb5747;
  color: #ffffff;
}

.publish-btn {
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

.publish-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.products-list {
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
  transition: all 0.3s ease;
}

.product-item:hover {
  background-color: #f5f5f5;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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
  margin-bottom: 8px;
}

.reject-reason {
  font-size: 13px;
  font-family: Inter;
  color: #f44336;
}

.product-status {
  min-width: 80px;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
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

.delete-btn:hover {
  border-color: #f44336;
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}
</style>
