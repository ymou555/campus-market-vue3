<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import DataCard from '../../components/DataCard.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const shopInfo = reactive({
  name: '数码小店',
  level: '金牌商家',
  rating: 4.8,
  avatar: 'https://via.placeholder.com/60'
});

const todayStats = reactive({
  orderCount: 15,
  salesAmount: 8597,
  pendingOrders: 3
});

const quickActions = [
  { icon: '📦', title: '发布商品', path: '/merchant/product-publish' },
  { icon: '📋', title: '订单管理', path: '/merchant/orders' },
  { icon: '🏪', title: '店铺设置', path: '/merchant/shop-settings' }
];

const notifications = ref([
  { id: 1, title: '新订单提醒', content: '您有3个新订单待处理', time: '5分钟前', type: 'order' },
  { id: 2, title: '审核通过', content: '商品"iPhone 13 Pro"已通过审核', time: '1小时前', type: 'audit' },
  { id: 3, title: '系统通知', content: '平台将于今晚进行系统维护', time: '2小时前', type: 'system' }
]);

const goTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商家后台</span>
    </div>
    
    <div class="dashboard-container">
      <div class="shop-section">
        <img :src="shopInfo.avatar" class="shop-avatar" />
        <div class="shop-info">
          <div class="shop-name">{{ shopInfo.name }}</div>
          <div class="shop-meta">
            <span class="shop-level">{{ shopInfo.level }}</span>
            <span class="shop-rating">评分: {{ shopInfo.rating }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-section">
        <DataCard title="今日订单" :value="todayStats.orderCount" unit="单" icon="📦" />
        <DataCard title="今日销售额" :value="todayStats.salesAmount" unit="元" icon="💰" />
        <DataCard title="待处理订单" :value="todayStats.pendingOrders" unit="单" icon="⏰" />
      </div>
      
      <div class="quick-actions">
        <div 
          v-for="action in quickActions" 
          :key="action.title"
          class="action-item"
          @click="goTo(action.path)"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-title">{{ action.title }}</span>
        </div>
      </div>
      
      <div class="notifications-section">
        <h3 class="section-title">通知公告</h3>
        <div class="notification-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item">
            <div class="notification-icon">
              {{ notification.type === 'order' ? '📦' : notification.type === 'audit' ? '✅' : '📢' }}
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-text">{{ notification.content }}</div>
            </div>
            <div class="notification-time">{{ notification.time }}</div>
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

.dashboard-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.shop-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.shop-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #cb5747;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 20px;
  font-family: Inter;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
}

.shop-meta {
  display: flex;
  gap: 16px;
}

.shop-level {
  padding: 4px 12px;
  background-color: #ff9800;
  color: #ffffff;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 600;
}

.shop-rating {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  background-color: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  background-color: rgba(203, 87, 71, 0.05);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 36px;
}

.action-title {
  font-size: 15px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-icon {
  font-size: 24px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}

.notification-time {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}
</style>
