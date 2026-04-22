<script setup>
import { defineProps, defineEmits } from 'vue';
import StatusTag from './StatusTag.vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'pay', 'cancel', 'confirm', 'review', 'refund']);

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'bargaining': 'info',
    'paid': 'info',
    'shipped': 'info',
    'received': 'success',
    'returning': 'warning',
    'completed': 'success',
    'refunded': 'danger',
    'cancelled': 'default'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusTextMap = {
    'pending': '待付款',
    'bargaining': '议价中',
    'paid': '待发货',
    'shipped': '待收货',
    'received': '待评价',
    'returning': '退货中',
    'completed': '已完成',
    'refunded': '已退款',
    'cancelled': '已取消'
  };
  return statusTextMap[status] || status;
};

const handleView = () => {
  emit('view', props.order);
};

const handlePay = () => {
  emit('pay', props.order);
};

const handleCancel = () => {
  emit('cancel', props.order);
};

const handleConfirm = () => {
  emit('confirm', props.order);
};

const handleReview = () => {
  emit('review', props.order);
};

const handleRefund = () => {
  emit('refund', props.order);
};
</script>

<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-info">
        <span class="order-number">订单号: {{ order.orderNo }}</span>
        <StatusTag :status="getStatusType(order.status)" :text="getStatusText(order.status)" />
        <StatusTag 
          v-if="order.returnRequest && order.returnRequest.status === 'rejected' && order.status === 'received'"
          status="danger" 
          text="商家拒绝退货" 
        />
      </div>
      <span class="order-date">{{ order.createTime }}</span>
    </div>
    
    <div class="order-products">
      <div v-for="product in order.products" :key="product.id" class="product-item">
        <img :src="'http://localhost:8080/campus-market' + product.productImage" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ product.productName }}</div>
          <div class="product-price">¥{{ product.price }} x {{ product.quantity }}</div>
        </div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="order-total">
        共 {{ order.totalQuantity }} 件商品，合计: <span class="total-price">¥{{ order.totalAmount }}</span>
      </div>
      <div class="order-actions">
        <button class="action-btn view-btn" @click="handleView">查看详情</button>
        <button v-if="order.status === 'pending'" class="action-btn cancel-btn" @click="handleCancel">取消订单</button>
        <button v-if="order.status === 'pending'" class="action-btn primary-btn" @click="handlePay">立即付款</button>
        <button v-if="order.status === 'shipped'" class="action-btn primary-btn" @click="handleConfirm">确认收货</button>
        <button v-if="order.status === 'received'" class="action-btn primary-btn" @click="handleReview">去评价</button>
        <button v-if="order.status === 'received'" class="action-btn" @click="handleRefund">申请退货</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.order-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #cb5747;
  box-shadow: 0px 4px 12px rgba(203, 87, 71, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-number {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.order-date {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.order-products {
  padding: 16px 20px;
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
  justify-content: center;
}

.product-name {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  margin-bottom: 8px;
}

.product-price {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.order-total {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #cb5747;
  margin-left: 4px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  background-color: #ffffff;
  color: #666666;
  font-size: 13px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.view-btn:hover {
  background-color: rgba(203, 87, 71, 0.05);
}

.cancel-btn:hover {
  background-color: rgba(244, 67, 54, 0.05);
  border-color: #f44336;
  color: #f44336;
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
