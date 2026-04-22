<script setup>
import { ref, computed } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchKeyword = ref('');

const merchants = ref([
  { 
    id: 1, 
    name: '数码小店', 
    level: 'gold', 
    sales: 125680, 
    rating: 4.8, 
    status: 'active', 
    avatar: 'https://via.placeholder.com/60',
    banType: null,
    banEndTime: null,
    banReason: '',
    productCount: 25
  },
  { 
    id: 2, 
    name: '运动装备', 
    level: 'silver', 
    sales: 89500, 
    rating: 4.6, 
    status: 'active', 
    avatar: 'https://via.placeholder.com/60',
    banType: null,
    banEndTime: null,
    banReason: '',
    productCount: 18
  },
  { 
    id: 3, 
    name: '书香阁', 
    level: 'bronze', 
    sales: 45200, 
    rating: 4.5, 
    status: 'banned', 
    avatar: 'https://via.placeholder.com/60',
    banType: 'temporary',
    banEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    banReason: '发布违规商品',
    productCount: 12
  },
  { 
    id: 4, 
    name: '服装精品店', 
    level: 'gold', 
    sales: 156000, 
    rating: 4.9, 
    status: 'closed', 
    avatar: 'https://via.placeholder.com/60',
    banType: 'closed',
    banEndTime: null,
    banReason: '店铺整顿中',
    productCount: 30
  }
]);

const showBanDialog = ref(false);
const showCloseDialog = ref(false);
const currentMerchant = ref(null);

const banForm = ref({
  duration: 7,
  durationUnit: 'days',
  reason: ''
});

const closeForm = ref({
  reason: ''
});

const durationOptions = [
  { value: 1, label: '1天' },
  { value: 3, label: '3天' },
  { value: 7, label: '7天' },
  { value: 14, label: '14天' },
  { value: 30, label: '30天' }
];

const getLevelText = (level) => {
  const levelMap = { 'gold': '金牌', 'silver': '银牌', 'bronze': '铜牌' };
  return levelMap[level] || '普通';
};

const getLevelType = (level) => {
  const typeMap = { 'gold': 'warning', 'silver': 'default', 'bronze': 'info' };
  return typeMap[level] || 'default';
};

const getStatusText = (merchant) => {
  if (merchant.status === 'active') return '正常';
  if (merchant.status === 'closed') return '店铺关闭';
  if (merchant.banType === 'temporary') return '限时封禁中';
  return '已封禁';
};

const getStatusType = (merchant) => {
  if (merchant.status === 'active') return 'success';
  if (merchant.status === 'closed') return 'info';
  return 'danger';
};

const getBanRemainingTime = (merchant) => {
  if (!merchant.banEndTime) return '';
  const now = new Date();
  const endTime = new Date(merchant.banEndTime);
  const diff = endTime - now;
  
  if (diff <= 0) return '已到期';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `剩余 ${days} 天 ${hours} 小时`;
  }
  return `剩余 ${hours} 小时`;
};

const viewDetail = (merchant) => {
  ElMessage.info('查看商家详情功能开发中');
};

const adjustLevel = (merchant) => {
  ElMessage.info('调整等级功能开发中');
};

const openBanDialog = (merchant) => {
  currentMerchant.value = merchant;
  banForm.value = {
    duration: 7,
    durationUnit: 'days',
    reason: ''
  };
  showBanDialog.value = true;
};

const applyTemporaryBan = () => {
  if (!banForm.value.reason) {
    ElMessage.error('请输入封禁原因');
    return;
  }
  
  const durationMs = banForm.value.duration * 24 * 60 * 60 * 1000;
  const banEndTime = new Date(Date.now() + durationMs);
  
  currentMerchant.value.status = 'banned';
  currentMerchant.value.banType = 'temporary';
  currentMerchant.value.banEndTime = banEndTime.toISOString();
  currentMerchant.value.banReason = banForm.value.reason;
  
  showBanDialog.value = false;
  ElMessage.success(`已对商家进行 ${banForm.value.duration} 天的限时封禁`);
};

const liftBan = (merchant) => {
  ElMessageBox.confirm('确定要解除该商家的封禁状态吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    merchant.status = 'active';
    merchant.banType = null;
    merchant.banEndTime = null;
    merchant.banReason = '';
    ElMessage.success('已解除封禁');
  }).catch(() => {});
};

const openCloseDialog = (merchant) => {
  currentMerchant.value = merchant;
  closeForm.value = {
    reason: ''
  };
  showCloseDialog.value = true;
};

const closeShop = () => {
  if (!closeForm.value.reason) {
    ElMessage.error('请输入关闭原因');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要关闭"${currentMerchant.value.name}"的店铺吗？这将下架该商家的所有 ${currentMerchant.value.productCount} 件商品。`,
    '警告',
    {
      confirmButtonText: '确定关闭',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    currentMerchant.value.status = 'closed';
    currentMerchant.value.banType = 'closed';
    currentMerchant.value.banReason = closeForm.value.reason;
    currentMerchant.value.productCount = 0;
    
    showCloseDialog.value = false;
    ElMessage.success('店铺已关闭，所有商品已下架');
  }).catch(() => {});
};

const reopenShop = (merchant) => {
  ElMessageBox.confirm('确定要重新开放该店铺吗？商家需要重新上架商品。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    merchant.status = 'active';
    merchant.banType = null;
    merchant.banReason = '';
    ElMessage.success('店铺已重新开放');
  }).catch(() => {});
};

const filteredMerchants = computed(() => {
  if (!searchKeyword.value) return merchants.value;
  const keyword = searchKeyword.value.toLowerCase();
  return merchants.value.filter(m => 
    m.name.toLowerCase().includes(keyword)
  );
});
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
        <div v-for="merchant in filteredMerchants" :key="merchant.id" class="merchant-item">
          <img :src="merchant.avatar" class="merchant-avatar" />
          <div class="merchant-info">
            <div class="merchant-header">
              <span class="merchant-name">{{ merchant.name }}</span>
              <StatusTag :status="getLevelType(merchant.level)" :text="getLevelText(merchant.level)" />
              <StatusTag :status="getStatusType(merchant)" :text="getStatusText(merchant)" />
            </div>
            <div class="merchant-meta">
              <span>销售额: ¥{{ merchant.sales }}</span>
              <span>评分: {{ merchant.rating }}</span>
              <span>商品数: {{ merchant.productCount }}</span>
            </div>
            <div v-if="merchant.status !== 'active'" class="ban-info">
              <span class="ban-reason">原因: {{ merchant.banReason }}</span>
              <span v-if="merchant.banType === 'temporary'" class="ban-time">{{ getBanRemainingTime(merchant) }}</span>
            </div>
          </div>
          <div class="merchant-actions">
            <button class="action-btn" @click="viewDetail(merchant)">查看详情</button>
            <button class="action-btn" @click="adjustLevel(merchant)">调整等级</button>
            
            <template v-if="merchant.status === 'active'">
              <button class="action-btn warning-btn" @click="openBanDialog(merchant)">限时封禁</button>
              <button class="action-btn danger-btn" @click="openCloseDialog(merchant)">关闭店铺</button>
            </template>
            
            <template v-else-if="merchant.status === 'banned' && merchant.banType === 'temporary'">
              <button class="action-btn success-btn" @click="liftBan(merchant)">解除封禁</button>
            </template>
            
            <template v-else-if="merchant.status === 'closed'">
              <button class="action-btn success-btn" @click="reopenShop(merchant)">重新开放</button>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showBanDialog" title="限时封禁商家" width="500px">
      <div class="dialog-form">
        <div class="form-item">
          <span class="form-label">商家名称</span>
          <span class="form-value">{{ currentMerchant?.name }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">封禁时长 <span class="required-mark">*</span></span>
          <el-select v-model="banForm.duration" class="form-select">
            <el-option
              v-for="item in durationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">封禁原因 <span class="required-mark">*</span></span>
          <textarea 
            v-model="banForm.reason"
            class="form-textarea"
            placeholder="请输入封禁原因..."
            rows="4"
          ></textarea>
        </div>
        <div class="ban-tip">
          <span class="tip-icon">⚠️</span>
          <span class="tip-text">封禁期间，商家将无法发布新商品，但已上架商品仍可正常售卖。</span>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showBanDialog = false">取消</button>
        <button class="dialog-btn confirm-btn danger" @click="applyTemporaryBan">确认封禁</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showCloseDialog" title="关闭店铺" width="500px">
      <div class="dialog-form">
        <div class="form-item">
          <span class="form-label">商家名称</span>
          <span class="form-value">{{ currentMerchant?.name }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">商品数量</span>
          <span class="form-value highlight">{{ currentMerchant?.productCount }} 件</span>
        </div>
        <div class="form-item">
          <span class="form-label">关闭原因 <span class="required-mark">*</span></span>
          <textarea 
            v-model="closeForm.reason"
            class="form-textarea"
            placeholder="请输入关闭原因..."
            rows="4"
          ></textarea>
        </div>
        <div class="ban-tip danger">
          <span class="tip-icon">🚫</span>
          <span class="tip-text">关闭店铺将下架该商家的所有商品，店铺将暂时关闭，商家无法进行任何操作。</span>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showCloseDialog = false">取消</button>
        <button class="dialog-btn confirm-btn danger" @click="closeShop">确认关闭</button>
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

.ban-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.ban-reason {
  font-size: 13px;
  color: #f44336;
}

.ban-time {
  font-size: 13px;
  color: #ff9800;
  font-weight: 500;
}

.merchant-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.warning-btn {
  border-color: #ff9800;
  color: #ff9800;
}

.warning-btn:hover {
  background-color: #ff9800;
  color: #ffffff;
}

.danger-btn {
  border-color: #f44336;
  color: #f44336;
}

.danger-btn:hover {
  background-color: #f44336;
  color: #ffffff;
}

.success-btn {
  border-color: #4caf50;
  color: #4caf50;
}

.success-btn:hover {
  background-color: #4caf50;
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
  color: #333333;
  font-weight: 500;
}

.form-value {
  font-size: 14px;
  color: #666666;
}

.form-value.highlight {
  color: #cb5747;
  font-weight: 600;
}

.required-mark {
  color: #cb5747;
}

.form-select {
  width: 100%;
}

::v-deep(.form-select .el-select__wrapper) {
  border-radius: 8px !important;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.ban-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff3e0;
  border-radius: 8px;
  border: 1px solid #ffe0b2;
}

.ban-tip.danger {
  background-color: #ffebee;
  border-color: #ffcdd2;
}

.tip-icon {
  font-size: 20px;
  line-height: 1;
}

.tip-text {
  font-size: 13px;
  color: #666666;
  line-height: 1.5;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
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

.confirm-btn.danger {
  background-color: #f44336;
  border-color: #f44336;
}

.confirm-btn:hover {
  opacity: 0.9;
}
</style>
