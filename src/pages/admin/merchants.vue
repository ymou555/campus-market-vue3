<script setup>
import { ref } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const searchKeyword = ref('');

const merchants = ref([
  { id: 1, name: '数码小店', level: 'gold', sales: 125680, rating: 4.8, status: 'active', avatar: 'https://via.placeholder.com/60' },
  { id: 2, name: '运动装备', level: 'silver', sales: 89500, rating: 4.6, status: 'active', avatar: 'https://via.placeholder.com/60' },
  { id: 3, name: '书香阁', level: 'bronze', sales: 45200, rating: 4.5, status: 'banned', avatar: 'https://via.placeholder.com/60' }
]);

const getLevelText = (level) => {
  const levelMap = { 'gold': '金牌', 'silver': '银牌', 'bronze': '铜牌' };
  return levelMap[level] || '普通';
};

const getLevelType = (level) => {
  const typeMap = { 'gold': 'warning', 'silver': 'default', 'bronze': 'info' };
  return typeMap[level] || 'default';
};

const viewDetail = (merchant) => {
  ElMessage.info('查看商家详情功能开发中');
};

const adjustLevel = (merchant) => {
  ElMessage.info('调整等级功能开发中');
};

const toggleBan = (merchant) => {
  merchant.status = merchant.status === 'active' ? 'banned' : 'active';
  ElMessage.success(merchant.status === 'active' ? '已解封' : '已封禁');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商家管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="merchants-container">
      <div class="search-section">
        <input 
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索店铺名称..."
        />
        <button class="search-btn">搜索</button>
      </div>
      
      <div class="merchants-list">
        <div v-for="merchant in merchants" :key="merchant.id" class="merchant-item">
          <img :src="merchant.avatar" class="merchant-avatar" />
          <div class="merchant-info">
            <div class="merchant-header">
              <span class="merchant-name">{{ merchant.name }}</span>
              <StatusTag :status="getLevelType(merchant.level)" :text="getLevelText(merchant.level)" />
              <StatusTag :status="merchant.status === 'active' ? 'success' : 'danger'" :text="merchant.status === 'active' ? '正常' : '已封禁'" />
            </div>
            <div class="merchant-meta">
              <span>销售额: ¥{{ merchant.sales }}</span>
              <span>评分: {{ merchant.rating }}</span>
            </div>
          </div>
          <div class="merchant-actions">
            <button class="action-btn" @click="viewDetail(merchant)">查看详情</button>
            <button class="action-btn" @click="adjustLevel(merchant)">调整等级</button>
            <button 
              class="action-btn"
              :class="merchant.status === 'active' ? 'ban-btn' : 'unban-btn'"
              @click="toggleBan(merchant)"
            >
              {{ merchant.status === 'active' ? '封禁' : '解封' }}
            </button>
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
}

.merchants-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.search-section {
  display: flex;
  gap: 12px;
  padding: 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 100px;
  border: solid 1px #d9d9d9;
  outline: none;
  font-size: 14px;
}

.search-btn {
  padding: 10px 24px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.merchants-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.merchant-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.merchant-info {
  flex: 1;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.merchant-name {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.merchant-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666666;
}

.merchant-actions {
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}
</style>
