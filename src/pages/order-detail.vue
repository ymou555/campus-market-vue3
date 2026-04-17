<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import StatusTag from '../components/StatusTag.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const order = reactive({
  id: 1,
  orderNumber: '202401150001',
  status: '待收货',
  createTime: '2024-01-15 10:30:00',
  payTime: '2024-01-15 10:35:00',
  deliveryTime: '2024-01-16 09:00:00',
  logistics: {
    company: '顺丰速运',
    number: 'SF1234567890',
    traces: [
      { time: '2024-01-16 09:00:00', content: '快件已发出' },
      { time: '2024-01-16 14:30:00', content: '快件已到达北京转运中心' },
      { time: '2024-01-17 08:00:00', content: '快件正在派送中' }
    ]
  },
  address: {
    name: '张三',
    phone: '13800138000',
    address: '北京市朝阳区某某街道某某小区1号楼101室'
  },
  products: [
    { id: 1, name: 'iPhone 13 Pro', price: 5999, quantity: 1, image: 'https://via.placeholder.com/80' },
    { id: 2, name: 'AirPods Pro', price: 1299, quantity: 2, image: 'https://via.placeholder.com/80' }
  ],
  productTotal: 8597,
  pointsDiscount: 10,
  totalAmount: 8587
});

const getStatusType = (status) => {
  const statusMap = {
    '待付款': 'warning',
    '待发货': 'info',
    '待收货': 'info',
    '待评价': 'success',
    '已完成': 'success',
    '已取消': 'default',
    '售后中': 'danger'
  };
  return statusMap[status] || 'default';
};

const confirmReceipt = () => {
  ElMessage.success('确认收货成功');
  order.status = '待评价';
};

const applyRefund = () => {
  ElMessage.success('申请售后成功');
  order.status = '售后中';
};

const buyAgain = () => {
  router.push('/');
};
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
    
    <div class="order-container">
      <div class="status-section">
        <StatusTag :status="getStatusType(order.status)" :text="order.status" />
        <div class="status-desc">
          <template v-if="order.status === '待付款'">
            请尽快完成付款
          </template>
          <template v-else-if="order.status === '待发货'">
            商家正在准备发货
          </template>
          <template v-else-if="order.status === '待收货'">
            商品正在配送中
          </template>
          <template v-else-if="order.status === '待评价'">
            快去评价商品吧
          </template>
        </div>
      </div>
      
      <div v-if="order.logistics" class="logistics-section">
        <h3 class="section-title">物流信息</h3>
        <div class="logistics-info">
          <div class="logistics-header">
            <span class="logistics-company">{{ order.logistics.company }}</span>
            <span class="logistics-number">运单号: {{ order.logistics.number }}</span>
          </div>
          <div class="logistics-traces">
            <div v-for="(trace, index) in order.logistics.traces" :key="index" class="trace-item">
              <div class="trace-time">{{ trace.time }}</div>
              <div class="trace-content">{{ trace.content }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="address-section">
        <h3 class="section-title">收货信息</h3>
        <div class="address-info">
          <div class="address-header">
            <span class="address-name">{{ order.address.name }}</span>
            <span class="address-phone">{{ order.address.phone }}</span>
          </div>
          <div class="address-detail">{{ order.address.address }}</div>
        </div>
      </div>
      
      <div class="products-section">
        <h3 class="section-title">商品清单</h3>
        <div class="product-list">
          <div v-for="product in order.products" :key="product.id" class="product-item">
            <img :src="product.image" class="product-image" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
            </div>
            <div class="product-quantity">x{{ product.quantity }}</div>
            <div class="product-subtotal">¥{{ (product.price * product.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div class="info-section">
        <h3 class="section-title">订单信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">订单号</span>
            <span class="info-value">{{ order.orderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ order.createTime }}</span>
          </div>
          <div v-if="order.payTime" class="info-item">
            <span class="info-label">支付时间</span>
            <span class="info-value">{{ order.payTime }}</span>
          </div>
          <div v-if="order.deliveryTime" class="info-item">
            <span class="info-label">发货时间</span>
            <span class="info-value">{{ order.deliveryTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="amount-section">
        <h3 class="section-title">金额明细</h3>
        <div class="amount-list">
          <div class="amount-item">
            <span class="amount-label">商品总额</span>
            <span class="amount-value">¥{{ order.productTotal.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">积分抵扣</span>
            <span class="amount-value discount">-¥{{ order.pointsDiscount.toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span class="amount-label">实付款</span>
            <span class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="actions-section">
        <button v-if="order.status === '待收货'" class="action-btn primary-btn" @click="confirmReceipt">
          确认收货
        </button>
        <button v-if="order.status === '已完成'" class="action-btn" @click="applyRefund">
          申请售后
        </button>
        <button class="action-btn" @click="buyAgain">再次购买</button>
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

.order-container {
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.status-desc {
  font-size: 16px;
  font-family: Inter;
  color: #666666;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 16px 0;
}

.logistics-section,
.address-section,
.products-section,
.info-section,
.amount-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.logistics-info {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.logistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.logistics-company {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.logistics-number {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.logistics-traces {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-item {
  display: flex;
  gap: 16px;
}

.trace-time {
  font-size: 13px;
  font-family: Inter;
  color: #999999;
  min-width: 140px;
}

.trace-content {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.address-info {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.address-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.address-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.address-phone {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.address-detail {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1.5;
}

.product-list {
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
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
}

.product-price {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #cb5747;
}

.product-quantity {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.product-subtotal {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  min-width: 100px;
  text-align: right;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 20px;
}

.info-label {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.amount-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.amount-item.total {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.amount-label {
  font-size: 15px;
  font-family: Inter;
  color: #666666;
}

.amount-item.total .amount-label {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.amount-value {
  font-size: 16px;
  font-family: Inter;
  color: #333333;
}

.amount-value.discount {
  color: #4caf50;
}

.amount-item.total .amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #cb5747;
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 20px;
}

.action-btn {
  padding: 12px 40px;
  border-radius: 100px;
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  color: #666666;
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
  transform: scale(1.05);
}
</style>
