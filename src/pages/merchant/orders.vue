<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const currentTab = ref('all');

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending-shipment', label: '待发货' },
  { value: 'pending-receipt', label: '待收货' },
  { value: 'completed', label: '已完成' },
  { value: 'after-sale', label: '售后中' }
];

const orders = ref([
  {
    id: 1,
    orderNumber: '202401150001',
    buyer: '张三',
    amount: 8597,
    status: 'pending-shipment',
    createTime: '2024-01-15 10:30:00',
    products: [
      { name: 'iPhone 13 Pro', quantity: 1, price: 5999, image: 'https://via.placeholder.com/60' },
      { name: 'AirPods Pro', quantity: 2, price: 1299, image: 'https://via.placeholder.com/60' }
    ]
  },
  {
    id: 2,
    orderNumber: '202401140002',
    buyer: '李四',
    amount: 199,
    status: 'pending-receipt',
    createTime: '2024-01-14 15:20:00',
    products: [
      { name: '运动跑鞋', quantity: 1, price: 199, image: 'https://via.placeholder.com/60' }
    ]
  },
  {
    id: 3,
    orderNumber: '202401130003',
    buyer: '王五',
    amount: 299,
    status: 'completed',
    createTime: '2024-01-13 09:15:00',
    products: [
      { name: '机械键盘', quantity: 1, price: 299, image: 'https://via.placeholder.com/60' }
    ]
  },
  {
    id: 4,
    orderNumber: '202401120004',
    buyer: '赵六',
    amount: 89,
    status: 'after-sale',
    createTime: '2024-01-12 14:30:00',
    products: [
      { name: '编程书籍合集', quantity: 1, price: 89, image: 'https://via.placeholder.com/60' }
    ]
  }
]);

const showShipDialog = ref(false);
const showRefundDialog = ref(false);
const currentOrder = ref(null);
const shipForm = ref({
  company: '',
  trackingNumber: ''
});
const refundReason = ref('');

const getStatusType = (status) => {
  const statusMap = {
    'pending-shipment': 'warning',
    'pending-receipt': 'info',
    'completed': 'success',
    'after-sale': 'danger'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusMap = {
    'pending-shipment': '待发货',
    'pending-receipt': '待收货',
    'completed': '已完成',
    'after-sale': '售后中'
  };
  return statusMap[status] || '未知';
};

const viewDetail = (order) => {
  router.push(`/merchant/order/${order.id}`);
};

const openShipDialog = (order) => {
  currentOrder.value = order;
  shipForm.value.company = '';
  shipForm.value.trackingNumber = '';
  showShipDialog.value = true;
};

const shipOrder = () => {
  if (!shipForm.value.company) {
    ElMessage.error('请选择物流公司');
    return;
  }
  if (!shipForm.value.trackingNumber) {
    ElMessage.error('请输入物流单号');
    return;
  }
  
  currentOrder.value.status = 'pending-receipt';
  showShipDialog.value = false;
  ElMessage.success('发货成功');
};

const openRefundDialog = (order) => {
  currentOrder.value = order;
  refundReason.value = '';
  showRefundDialog.value = true;
};

const handleRefund = (approved) => {
  if (approved && !refundReason.value) {
    ElMessage.error('请填写审核意见');
    return;
  }
  
  currentOrder.value.status = approved ? 'completed' : 'after-sale';
  showRefundDialog.value = false;
  ElMessage.success(approved ? '已同意退货' : '已拒绝退货');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 订单管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="orders-container">
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
      
      <div class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">{{ order.orderNumber }}</span>
              <span class="order-buyer">买家: {{ order.buyer }}</span>
              <StatusTag :status="getStatusType(order.status)" :text="getStatusText(order.status)" />
            </div>
            <span class="order-time">{{ order.createTime }}</span>
          </div>
          
          <div class="order-products">
            <div v-for="(product, index) in order.products" :key="index" class="product-item">
              <img :src="product.image" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-meta">¥{{ product.price }} x {{ product.quantity }}</div>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-amount">订单金额: ¥{{ order.amount }}</div>
            <div class="order-actions">
              <button class="action-btn" @click="viewDetail(order)">查看详情</button>
              <button 
                v-if="order.status === 'pending-shipment'"
                class="action-btn primary-btn"
                @click="openShipDialog(order)"
              >
                发货
              </button>
              <button 
                v-if="order.status === 'after-sale'"
                class="action-btn primary-btn"
                @click="openRefundDialog(order)"
              >
                审核退货
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showShipDialog" title="填写物流信息" width="500px">
      <div class="dialog-form">
        <div class="form-item">
          <span class="form-label">物流公司</span>
          <el-select v-model="shipForm.company" placeholder="请选择物流公司" class="form-select">
            <el-option label="顺丰速运" value="SF" />
            <el-option label="圆通快递" value="YTO" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="韵达快递" value="YD" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">物流单号</span>
          <input 
            v-model="shipForm.trackingNumber"
            class="form-input"
            placeholder="请输入物流单号"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showShipDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="shipOrder">确定发货</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showRefundDialog" title="审核退货申请" width="500px">
      <div class="dialog-form">
        <div class="form-item">
          <span class="form-label">审核意见</span>
          <textarea 
            v-model="refundReason"
            class="form-textarea"
            placeholder="请填写审核意见..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn reject-btn" @click="handleRefund(false)">拒绝退货</button>
        <button class="dialog-btn confirm-btn" @click="handleRefund(true)">同意退货</button>
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

.orders-container {
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

.orders-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background-color: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-item:hover {
  background-color: #f5f5f5;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-number {
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.order-buyer {
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}

.order-time {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.order-products {
  padding: 16px;
}

.product-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  margin-bottom: 4px;
}

.product-meta {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.order-amount {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #cb5747;
}

.order-actions {
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

.primary-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
  color: #ffffff;
}

.dialog-form {
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

.form-select {
  width: 100%;
}

::v-deep(.form-select .el-select__wrapper) {
  border-radius: 8px !important;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.dialog-btn {
  padding: 10px 24px;
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

.reject-btn {
  background-color: #ffffff;
  border: 1px solid #f44336;
  color: #f44336;
}

.reject-btn:hover {
  background-color: #f44336;
  color: #ffffff;
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
