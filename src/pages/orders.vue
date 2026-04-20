<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import OrderCard from '../components/OrderCard.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const currentTab = ref('all');

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending-payment', label: '待付款' },
  { value: 'pending-shipment', label: '待发货' },
  { value: 'pending-receipt', label: '待收货' },
  { value: 'pending-review', label: '待评价' },
  { value: 'after-sale', label: '售后' }
];

const orders = ref([
  {
    id: 1,
    orderNumber: '202401150001',
    status: '待付款',
    createTime: '2024-01-15 10:30:00',
    totalQuantity: 2,
    totalAmount: 8597,
    products: [
      { id: 1, name: 'iPhone 13 Pro', price: 5999, quantity: 1, image: 'https://via.placeholder.com/80' },
      { id: 2, name: 'AirPods Pro', price: 1299, quantity: 2, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 2,
    orderNumber: '202401140002',
    status: '待发货',
    createTime: '2024-01-14 15:20:00',
    totalQuantity: 1,
    totalAmount: 199,
    products: [
      { id: 3, name: '运动跑鞋', price: 199, quantity: 1, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 3,
    orderNumber: '202401130003',
    status: '待收货',
    createTime: '2024-01-13 09:15:00',
    totalQuantity: 1,
    totalAmount: 299,
    products: [
      { id: 4, name: '机械键盘', price: 299, quantity: 1, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 4,
    orderNumber: '202401120004',
    status: '待评价',
    createTime: '2024-01-12 14:30:00',
    totalQuantity: 1,
    totalAmount: 89,
    products: [
      { id: 5, name: '编程书籍合集', price: 89, quantity: 1, image: 'https://via.placeholder.com/80' }
    ]
  },
  {
    id: 5,
    orderNumber: '202401110005',
    status: '已完成',
    createTime: '2024-01-11 11:00:00',
    totalQuantity: 1,
    totalAmount: 450,
    products: [
      { id: 6, name: '二手自行车', price: 450, quantity: 1, image: 'https://via.placeholder.com/80' }
    ]
  }
]);

const handleView = (order) => {
  router.push(`/order/${order.id}`);
};

const handlePay = (order) => {
  ElMessage.success(`订单 ${order.orderNumber} 跳转到支付页面`);
};

const handleCancel = (order) => {
  ElMessage.success(`订单 ${order.orderNumber} 已取消`);
};

const handleConfirm = (order) => {
  ElMessage.success(`订单 ${order.orderNumber} 已确认收货`);
};

const handleReview = (order) => {
  router.push(`/review/${order.id}`);
};

const handleRefund = (order) => {
  ElMessage.success(`订单 ${order.orderNumber} 申请售后成功`);
};

const changeTab = (tab) => {
  currentTab.value = tab;
};
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
</style>
