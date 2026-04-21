<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import StatusTag from '../components/StatusTag.vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';

const router = useRouter();
const route = useRoute();

const order = reactive({
  id: null,
  orderNo: '',
  status: '',
  deliveryType: '',
  createTime: '',
  payTime: null,
  deliveryTime: null,
  buyerOfferPrice: null,
  delivery: {
    receiverName: null,
    receiverPhone: null,
    receiverAddress: null,
    trackingNumber: null,
    meetTime: null,
    meetLocation: null,
    meetStatus: null,
    sellerPhone: ''
  },
  products: [],
  productTotal: 0,
  pointsDiscount: 0,
  totalAmount: 0
});

const countdown = ref('');
let countdownTimer = null;

const showMeetDialog = ref(false);
const newMeetSuggestion = reactive({
  meetTime: '',
  meetLocation: ''
});

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'bargaining': 'info',
    'paid': 'info',
    'shipped': 'info',
    'received': 'success',
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
    'completed': '已完成',
    'refunded': '已退款',
    'cancelled': '已取消'
  };
  return statusTextMap[status] || status;
};

const getStatusDesc = computed(() => {
  const { status, deliveryType } = order;
  
  if (status === 'pending') {
    return '请尽快完成付款';
  } else if (status === 'bargaining') {
    return '等待商家确认议价';
  } else if (status === 'paid') {
    if (deliveryType === 'express') {
      return '等待商家发货';
    } else if (deliveryType === 'face_to_face') {
      const meetStatus = order.delivery.meetStatus;
      if (meetStatus === 'pending_seller') {
        return '等待商家设置见面时间和地点';
      } else if (meetStatus === 'pending_buyer') {
        return '商家已提议面交信息，请确认';
      } else if (meetStatus === 'confirmed') {
        return '已确认面交信息，请准时到达';
      } else if (meetStatus === 'rejected') {
        return '您已提出新的面交建议，等待商家确认';
      }
    }
  } else if (status === 'shipped') {
    if (deliveryType === 'express') {
      return '快递已发出，请等待收货';
    } else if (deliveryType === 'face_to_face') {
      return '商家已确认发货，请确认收货';
    }
  } else if (status === 'received') {
    return '快去评价商品吧';
  } else if (status === 'completed') {
    return '交易已完成';
  } else if (status === 'refunded') {
    return '订单已退款';
  } else if (status === 'cancelled') {
    return '订单已取消';
  }
  
  return '';
});

const calculateCountdown = () => {
  if (order.status !== 'pending') {
    countdown.value = '';
    return;
  }
  
  const createTime = new Date(order.createTime).getTime();
  const now = Date.now();
  const deadline = createTime + 30 * 60 * 1000;
  const diff = deadline - now;
  
  if (diff <= 0) {
    countdown.value = '订单已超时';
    return;
  }
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  countdown.value = `剩余 ${minutes} 分 ${seconds} 秒自动取消`;
};

const getMeetStatusText = (meetStatus) => {
  const meetStatusMap = {
    'pending_seller': '等待商家设置见面时间和地点',
    'pending_buyer': '商家已提议，请确认',
    'confirmed': '已确认面交信息',
    'rejected': '您已提出新建议，等待商家确认'
  };
  return meetStatusMap[meetStatus] || '';
};

const confirmReceipt = async () => {
  try {
    if (order.deliveryType === 'face_to_face') {
      const response = await axios.post('/order/meet/complete', null, {
        params: {
          orderId: order.id
        }
      });
      
      if (response && response.code === 200) {
        ElMessage.success('收货成功');
        order.status = 'received';
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
        order.status = 'received';
      } else {
        ElMessage.error(response?.message || '确认收货失败');
      }
    }
  } catch (error) {
    console.error('确认收货失败:', error);
    ElMessage.error('确认收货失败，请稍后重试');
  }
};

const applyRefund = () => {
  ElMessage.success('申请退款成功');
  order.status = 'refunded';
};

const buyAgain = () => {
  router.push('/');
};

const cancelOrder = () => {
  ElMessage.success('订单已取消');
  order.status = 'cancelled';
};

const confirmMeetInfo = async () => {
  try {
    const response = await axios.post('/order/meet/confirm', null, {
      params: {
        orderId: order.id
      }
    });
    
    if (response && response.code === 200) {
      ElMessage.success('面交信息已确认');
      order.delivery.meetStatus = 'confirmed';
    } else {
      ElMessage.error(response?.message || '确认失败');
    }
  } catch (error) {
    console.error('确认面交信息失败:', error);
    ElMessage.error('确认面交信息失败，请稍后重试');
  }
};

const rejectMeetInfo = () => {
  showMeetDialog.value = true;
};

const submitNewMeetSuggestion = async () => {
  if (!newMeetSuggestion.meetTime || !newMeetSuggestion.meetLocation) {
    ElMessage.warning('请填写完整的面交时间和地点');
    return;
  }
  
  try {
    const meetTime = new Date(newMeetSuggestion.meetTime);
    const formattedTime = `${meetTime.getFullYear()}-${String(meetTime.getMonth() + 1).padStart(2, '0')}-${String(meetTime.getDate()).padStart(2, '0')} ${String(meetTime.getHours()).padStart(2, '0')}:${String(meetTime.getMinutes()).padStart(2, '0')}:${String(meetTime.getSeconds()).padStart(2, '0')}`;
    
    const response = await axios.post('/order/meet/reject', null, {
      params: {
        orderId: order.id,
        newMeetTime: formattedTime,
        newMeetLocation: newMeetSuggestion.meetLocation
      }
    });
    
    if (response && response.code === 200) {
      ElMessage.success('已拒绝商家建议，等待商家重新设置');
      order.delivery.meetStatus = 'rejected';
      showMeetDialog.value = false;
      newMeetSuggestion.meetTime = '';
      newMeetSuggestion.meetLocation = '';
    } else {
      ElMessage.error(response?.message || '提交失败');
    }
  } catch (error) {
    console.error('提交新建议失败:', error);
    ElMessage.error('提交新建议失败，请稍后重试');
  }
};

const closeMeetDialog = () => {
  showMeetDialog.value = false;
  newMeetSuggestion.meetTime = '';
  newMeetSuggestion.meetLocation = '';
};

const cancelBargaining = () => {
  ElMessage.success('已取消议价');
  order.status = 'cancelled';
};

const deleteOrder = () => {
  ElMessage.success('订单已删除');
  router.push('/orders');
};

const callSeller = () => {
  ElMessage.success(`拨打商家电话：${order.delivery.sellerPhone}`);
};

const payOrder = async () => {
  try {
    const response = await axios.post('/order/pay', null, {
      params: {
        orderId: order.id
      }
    });
    
    if (response && response.code === 200) {
      ElMessage.success('支付成功');
      order.status = 'paid';
      if (order.deliveryType === 'face_to_face') {
        order.delivery.meetStatus = 'pending_seller';
      }
    } else {
      ElMessage.error(response?.message || '支付失败');
    }
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败，请稍后重试');
  }
};

const fetchOrderDetail = async () => {
  const orderId = route.params.id || route.query.orderId;
  
  if (!orderId) {
    ElMessage.error('订单ID不存在');
    return;
  }
  
  try {
    const response = await axios.get('/order/detail', {
      params: {
        orderId: orderId
      }
    });
    
    if (response && response.code === 200) {
      const data = response.data;
      Object.assign(order, data);
    } else {
      ElMessage.error(response?.message || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败，请稍后重试');
  }
};

onMounted(() => {
  fetchOrderDetail();
  calculateCountdown();
  if (order.status === 'pending') {
    countdownTimer = setInterval(calculateCountdown, 1000);
  }
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
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
        <div class="status-header">
          <StatusTag :status="getStatusType(order.status)" :text="getStatusText(order.status)" />
          <div class="status-desc">{{ getStatusDesc }}</div>
        </div>
        <div v-if="countdown" class="countdown">{{ countdown }}</div>
      </div>
      
      <div v-if="order.deliveryType === 'express'" class="delivery-section">
        <h3 class="section-title">配送信息</h3>
        <div class="delivery-info">
          <div class="delivery-header">
            <span class="delivery-name">{{ order.delivery.receiverName }}</span>
            <span class="delivery-phone">{{ order.delivery.receiverPhone }}</span>
          </div>
          <div class="delivery-address">{{ order.delivery.receiverAddress }}</div>
          <div v-if="order.delivery.trackingNumber" class="delivery-tracking">
            <span class="tracking-label">快递单号：</span>
            <span class="tracking-number">{{ order.delivery.trackingNumber }}</span>
          </div>
          <div v-else class="delivery-status">
            <span class="status-label">物流状态：</span>
            <span class="status-text">等待发货</span>
          </div>
        </div>
      </div>
      
      <div v-if="order.deliveryType === 'face_to_face'" class="meet-section">
        <h3 class="section-title">面交信息</h3>
        <div class="meet-info">
          <div v-if="order.delivery.meetTime" class="meet-item">
            <span class="meet-label">见面时间：</span>
            <span class="meet-value">{{ order.delivery.meetTime }}</span>
          </div>
          <div v-if="order.delivery.meetLocation" class="meet-item">
            <span class="meet-label">见面地点：</span>
            <span class="meet-value">{{ order.delivery.meetLocation }}</span>
          </div>
          <div class="meet-item">
            <span class="meet-label">协商状态：</span>
            <span class="meet-value">{{ getMeetStatusText(order.delivery.meetStatus) }}</span>
          </div>
          <div class="meet-item">
            <span class="meet-label">商家联系方式：</span>
            <span class="meet-value seller-phone" @click="callSeller">{{ order.delivery.sellerPhone }}</span>
          </div>
        </div>
      </div>
      
      <div class="products-section">
        <h3 class="section-title">商品清单</h3>
        <div class="product-list">
          <div v-for="product in order.products" :key="product.id" class="product-item">
            <img :src="'http://localhost:8080/campus-market' + product.productImage" class="product-image" />
            <div class="product-info">
              <div class="product-name">{{ product.productName }}</div>
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
            <span class="info-value">{{ order.orderNo }}</span>
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
          <div class="info-item">
            <span class="info-label">配送方式</span>
            <span class="info-value">{{ order.deliveryType === 'express' ? '快递配送' : '当面交易' }}</span>
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
          <div v-if="order.buyerOfferPrice" class="amount-item">
            <span class="amount-label">议价优惠</span>
            <span class="amount-value discount">-¥{{ (order.productTotal - order.buyerOfferPrice).toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">积分抵扣</span>
            <span class="amount-value discount">-¥{{ (order.pointsDiscount / 100).toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span class="amount-label">实付款</span>
            <span class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="actions-section">
        <template v-if="order.status === 'pending'">
          <button class="action-btn primary-btn" @click="payOrder">去付款</button>
          <button class="action-btn" @click="cancelOrder">取消订单</button>
        </template>
        
        <template v-if="order.status === 'bargaining'">
          <button class="action-btn" @click="cancelBargaining">取消议价</button>
        </template>
        
        <template v-if="order.status === 'paid' && order.deliveryType === 'face_to_face' && order.delivery.meetStatus === 'pending_buyer'">
          <button class="action-btn primary-btn" @click="confirmMeetInfo">确认面交信息</button>
          <button class="action-btn" @click="rejectMeetInfo">提出新建议</button>
        </template>
        
        <template v-if="order.status === 'paid' && order.deliveryType === 'face_to_face' && order.delivery.meetStatus === 'rejected'">
          <button class="action-btn" @click="callSeller">查看商家电话</button>
        </template>
        
        <template v-if="order.status === 'paid' && order.deliveryType === 'face_to_face' && order.delivery.meetStatus === 'confirmed'">
          <button class="action-btn" @click="callSeller">查看商家电话</button>
        </template>
        
        <template v-if="order.status === 'shipped'">
          <button class="action-btn primary-btn" @click="confirmReceipt">确认收货</button>
        </template>
        
        <template v-if="order.status === 'received'">
          <button class="action-btn primary-btn" @click="router.push(`/review/${order.id}`)">去评价</button>
          <button class="action-btn" @click="applyRefund">申请退款</button>
        </template>
        
        <template v-if="order.status === 'completed'">
          <button class="action-btn" @click="buyAgain">再次购买</button>
          <button class="action-btn" @click="router.push(`/review/${order.id}`)">查看评价</button>
        </template>
        
        <template v-if="order.status === 'cancelled' || order.status === 'refunded'">
          <button class="action-btn" @click="deleteOrder">删除订单</button>
        </template>
      </div>
    </div>
    
    <div v-if="showMeetDialog" class="dialog-overlay" @click.self="closeMeetDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">提出新的面交建议</h3>
          <button class="dialog-close" @click="closeMeetDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label class="form-label">见面时间</label>
            <input 
              v-model="newMeetSuggestion.meetTime"
              type="datetime-local"
              class="form-input"
              placeholder="请选择见面时间"
            />
          </div>
          <div class="form-item">
            <label class="form-label">见面地点</label>
            <input 
              v-model="newMeetSuggestion.meetLocation"
              type="text"
              class="form-input"
              placeholder="请输入见面地点"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn cancel-btn" @click="closeMeetDialog">取消</button>
          <button class="dialog-btn confirm-btn" @click="submitNewMeetSuggestion">提交建议</button>
        </div>
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
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-desc {
  font-size: 16px;
  font-family: Inter;
  color: #666666;
}

.countdown {
  font-size: 14px;
  font-family: Inter;
  color: #ff6b6b;
  font-weight: 500;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 16px 0;
}

.delivery-section,
.meet-section,
.products-section,
.info-section,
.amount-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.delivery-info,
.meet-info {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.delivery-header,
.meet-item {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.delivery-name,
.meet-label {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.delivery-phone,
.meet-value {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.delivery-address {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.delivery-tracking,
.delivery-status {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.tracking-label,
.status-label {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
}

.tracking-number,
.status-text {
  font-size: 14px;
  font-family: Inter;
  color: #cb5747;
  font-weight: 500;
}

.seller-phone {
  color: #cb5747;
  cursor: pointer;
  text-decoration: underline;
}

.seller-phone:hover {
  color: #a04a3c;
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

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.dialog-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dialog-close:hover {
  background-color: #f5f5f5;
  color: #666666;
}

.dialog-body {
  padding: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #cb5747;
  box-shadow: 0 0 0 2px rgba(203, 87, 71, 0.1);
}

.form-input::placeholder {
  color: #999999;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.dialog-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
}

.cancel-btn {
  background-color: #ffffff;
  color: #666666;
}

.cancel-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.confirm-btn {
  background-color: #cb5747;
  border-color: #cb5747;
  color: #ffffff;
}

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
}
</style>
