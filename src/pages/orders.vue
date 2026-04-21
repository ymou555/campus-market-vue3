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
  ElMessage.success(`订单 ${order.orderNo} 申请售后成功`);
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
</style>
