<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import DataCard from '../../components/DataCard.vue';

const router = useRouter();

const stats = reactive({
  userCount: 1256,
  productCount: 3421,
  orderCount: 8765,
  totalAmount: 156789
});

const pendingItems = reactive({
  userAudit: 12,
  productAudit: 25
});

const chartData = ref([
  { date: '01-11', orders: 120, amount: 12500 },
  { date: '01-12', orders: 135, amount: 13200 },
  { date: '01-13', orders: 142, amount: 15800 },
  { date: '01-14', orders: 128, amount: 12300 },
  { date: '01-15', orders: 156, amount: 16700 },
  { date: '01-16', orders: 168, amount: 18200 },
  { date: '01-17', orders: 175, amount: 19500 }
]);

const quickActions = [
  { icon: '👥', title: '用户审核', path: '/admin/user-audit', count: pendingItems.userAudit },
  { icon: '📦', title: '商品审核', path: '/admin/product-audit', count: pendingItems.productAudit },
  { icon: '👤', title: '用户管理', path: '/admin/users' },
  { icon: '🏪', title: '商家管理', path: '/admin/merchants' },
  { icon: '🏆', title: '商家等级管理', path: '/admin/merchant-levels' },
  { icon: '🖼️', title: '轮播图管理', path: '/admin/banners' },
  { icon: '🚫', title: '黑名单管理', path: '/admin/blacklist' }
];

const goTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 管理员后台</span>
    </div>
    
    <div class="dashboard-container">
      <div class="stats-section">
        <DataCard title="用户总数" :value="stats.userCount" unit="人" icon="👥" />
        <DataCard title="商品总数" :value="stats.productCount" unit="件" icon="📦" />
        <DataCard title="订单总数" :value="stats.orderCount" unit="单" icon="📋" />
        <DataCard title="交易总额" :value="stats.totalAmount" unit="元" icon="💰" />
      </div>
      
      <div class="pending-section">
        <h3 class="section-title">待办事项</h3>
        <div class="pending-items">
          <div class="pending-item" @click="goTo('/admin/user-audit')">
            <div class="pending-icon">👥</div>
            <div class="pending-info">
              <div class="pending-title">待审核用户</div>
              <div class="pending-count">{{ pendingItems.userAudit }} 个</div>
            </div>
          </div>
          <div class="pending-item" @click="goTo('/admin/product-audit')">
            <div class="pending-icon">📦</div>
            <div class="pending-info">
              <div class="pending-title">待审核商品</div>
              <div class="pending-count">{{ pendingItems.productAudit }} 个</div>
            </div>
          </div>
        </div>
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
          <span v-if="action.count" class="action-badge">{{ action.count }}</span>
        </div>
      </div>
      
      <div class="chart-section">
        <h3 class="section-title">近7天数据趋势</h3>
        <div class="chart-container">
          <div class="chart-row">
            <div class="chart-label">日期</div>
            <div v-for="item in chartData" :key="item.date" class="chart-item">{{ item.date }}</div>
          </div>
          <div class="chart-row">
            <div class="chart-label">订单数</div>
            <div v-for="item in chartData" :key="item.date" class="chart-item">{{ item.orders }}</div>
          </div>
          <div class="chart-row">
            <div class="chart-label">交易额</div>
            <div v-for="item in chartData" :key="item.date" class="chart-item">¥{{ item.amount }}</div>
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

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.pending-section {
  margin-bottom: 30px;
}

.pending-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pending-item:hover {
  background-color: rgba(203, 87, 71, 0.05);
  transform: translateY(-2px);
}

.pending-icon {
  font-size: 40px;
}

.pending-info {
  flex: 1;
}

.pending-title {
  font-size: 15px;
  font-family: Inter;
  color: #666666;
  margin-bottom: 8px;
}

.pending-count {
  font-size: 24px;
  font-family: Inter;
  font-weight: 700;
  color: #cb5747;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.action-item {
  position: relative;
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

.action-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background-color: #f44336;
  color: #ffffff;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 600;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-container {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 20px;
}

.chart-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-label {
  min-width: 80px;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.chart-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}
</style>
