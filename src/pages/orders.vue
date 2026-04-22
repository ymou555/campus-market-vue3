<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import OrderCard from '../components/OrderCard.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const currentTab = ref('all');

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'bargaining', label: '议价中' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '待收货' },
  { value: 'received', label: '待评价' }
];

const orders = ref([]);

const showReturnDialog = ref(false);
const returnReason = ref('');
const currentReturnOrder = ref(null);

const fetchOrders = async (status = null) => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const params = {
      userId: userStore.userInfo.id
    };
    
    if (status && status !== 'all') {
      params.status = status;
    }
    
    const response = await axios.get('/order/user/list', {
      params: params
    });
    
    if (response && response.code === 200) {
      orders.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取订单列表失败');
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败，请稍后重试');
  }
};

const handleView = (order) => {
  router.push(`/order/${order.id}`);
};

const handlePay = async (order) => {
  try {
    const response = await axios.post('/order/pay', null, {
      params: {
        orderId: order.id
      }
    });
    
    if (response && response.code === 200) {
      ElMessage.success('支付成功');
      fetchOrders(currentTab.value);
    } else {
      ElMessage.error(response?.message || '支付失败');
    }
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败，请稍后重试');
  }
};

const handleCancel = (order) => {
  ElMessage.success(`订单 ${order.orderNo} 已取消`);
};

const handleConfirm = async (order) => {
  try {
    if (order.deliveryType === 'face_to_face') {
      const response = await axios.post('/order/meet/complete', null, {
        params: {
          orderId: order.id
        }
      });
      
      if (response && response.code === 200) {
        ElMessage.success('收货成功');
        fetchOrders(currentTab.value);
      } else {
        ElMessage.error(response?.message || '确认收货失败');
      }
    } else {
      const response = await axios.post('/order/receive', null, {
        params: {
          orderId: order.id
        }
      });
      
      if (response && response.code === 200) {
        ElMessage.success('收货成功');
        fetchOrders(currentTab.value);
      } else {
        ElMessage.error(response?.message || '确认收货失败');
      }
    }
  } catch (error) {
    console.error('确认收货失败:', error);
    ElMessage.error('确认收货失败，请稍后重试');
  }
};

const handleReview = (order) => {
  router.push(`/review/${order.id}`);
};

const handleRefund = (order) => {
  currentReturnOrder.value = order;
  returnReason.value = '';
  showReturnDialog.value = true;
};

const submitReturn = async () => {
  if (!returnReason.value) {
    ElMessage.warning('请输入退货原因');
    return;
  }
  
  try {
    const response = await axios.post('/order/return/apply', null, {
      params: {
        orderId: currentReturnOrder.value.id,
        reason: returnReason.value
      }
    });
    
    if (response && response.code === 200) {
      ElMessage.success('退货申请已提交，等待商家审核');
      showReturnDialog.value = false;
      returnReason.value = '';
      currentReturnOrder.value = null;
      fetchOrders(currentTab.value);
    } else {
      ElMessage.error(response?.message || '申请退货失败');
    }
  } catch (error) {
    console.error('申请退货失败:', error);
    ElMessage.error('申请退货失败，请稍后重试');
  }
};

const closeReturnDialog = () => {
  showReturnDialog.value = false;
  returnReason.value = '';
  currentReturnOrder.value = null;
};

const changeTab = (tab) => {
  currentTab.value = tab;
  fetchOrders(tab);
};

onMounted(() => {
  fetchOrders(currentTab.value);
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
    
    <div class="orders-container">
      <div class="tabs-wrapper">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="changeTab(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
      
      <div class="orders-list">
        <div v-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无订单</div>
        </div>
        <OrderCard 
          v-for="order in orders" 
          :key="order.id"
          :order="order"
          @view="handleView"
          @pay="handlePay"
          @cancel="handleCancel"
          @confirm="handleConfirm"
          @review="handleReview"
          @refund="handleRefund"
        />
      </div>
    </div>
    
    <el-dialog v-model="showReturnDialog" title="申请退货" width="600px">
      <div class="return-form">
        <div class="form-item">
          <span class="form-label">订单号</span>
          <span class="form-value">{{ currentReturnOrder?.orderNo }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">退货原因</span>
          <textarea 
            v-model="returnReason"
            class="content-input"
            placeholder="请输入退货原因..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="closeReturnDialog">取消</button>
        <button class="dialog-btn confirm-btn" @click="submitReturn">提交申请</button>
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-family: Inter;
  color: #999999;
}

.return-form {
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
