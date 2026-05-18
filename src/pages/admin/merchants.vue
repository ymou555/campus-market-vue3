<script setup>
import { ref, onMounted } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../../utils/axios';

const searchKeyword = ref('');
const selectedStatus = ref('');
const loading = ref(false);

const merchants = ref([]);

const showBanDialog = ref(false);
const showCloseDialog = ref(false);
const showDetailDialog = ref(false);
const showLevelDialog = ref(false);
const currentMerchant = ref(null);
const selectedLevelId = ref(5);

const banForm = ref({
  duration: 7,
  durationUnit: 'days',
  reason: ''
});

const durationOptions = [
  { value: 1, label: '1天' },
  { value: 3, label: '3天' },
  { value: 7, label: '7天' },
  { value: 14, label: '14天' },
  { value: 30, label: '30天' }
];

const levelMap = {
  1: '钻石商家',
  2: '金牌商家',
  3: '高级商家',
  4: '中级商家',
  5: '初级商家'
};

const colorMap = {
  1: '#00bcd4',
  2: '#ffd700',
  3: '#ff9800',
  4: '#666666',
  5: '#999999'
};

const getLevelText = (level) => {
  return levelMap[level] || '未知等级';
};

const getLevelType = (level) => {
  return 'default';
};

const getStatusText = (merchant) => {
  if (merchant.status === 'pending') return '待审核';
  if (merchant.status === 'active') return '正常';
  if (merchant.status === 'closed') return '店铺关闭';
  if (merchant.status === 'banned') return '封禁中';
  return '未知';
};

const getStatusType = (merchant) => {
  if (merchant.status === 'pending') return 'warning';
  if (merchant.status === 'active') return 'success';
  if (merchant.status === 'closed') return 'info';
  if (merchant.status === 'banned') return 'danger';
  return 'default';
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

const fetchMerchants = async () => {
  loading.value = true;
  try {
    const params = {};
    
    if (searchKeyword.value) {
      params.shopName = searchKeyword.value;
    }
    
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    
    const response = await axios.get('/admin/merchant/list', { params });
    
    if (response && response.code === 200) {
      merchants.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取商家列表失败');
    }
  } catch (error) {
    console.error('获取商家列表失败:', error);
    ElMessage.error('获取商家列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const searchMerchants = () => {
  fetchMerchants();
};

const resetSearch = () => {
  searchKeyword.value = '';
  selectedStatus.value = '';
  fetchMerchants();
};

const viewDetail = async (merchant) => {
  try {
    const response = await axios.get('/admin/merchant/detail', {
      params: {
        merchantId: merchant.id
      }
    });
    
    if (response && response.code === 200) {
      currentMerchant.value = {
        ...merchant,
        basicInfo: response.data.basicInfo,
        shopInfo: response.data.shopInfo,
        banRecords: response.data.banRecords || []
      };
      showDetailDialog.value = true;
    } else {
      ElMessage.error(response?.message || '获取商家详情失败');
    }
  } catch (error) {
    console.error('获取商家详情失败:', error);
    ElMessage.error('获取商家详情失败，请稍后重试');
  }
};

const adjustLevel = (merchant) => {
  currentMerchant.value = merchant;
  selectedLevelId.value = merchant.levelId || 5;
  showLevelDialog.value = true;
};

const saveLevelAdjust = async () => {
  if (!selectedLevelId.value) {
    ElMessage.error('请选择商家等级');
    return;
  }
  
  try {
    const response = await axios.post('/admin/merchant/level/adjust', null, {
      params: {
        userId: currentMerchant.value.id,
        levelId: selectedLevelId.value
      }
    });
    
    if (response && response.code === 200) {
      currentMerchant.value.levelId = selectedLevelId.value;
      showLevelDialog.value = false;
      ElMessage.success('商家等级调整成功');
    } else {
      ElMessage.error(response?.message || '调整失败');
    }
  } catch (error) {
    console.error('调整失败:', error);
    ElMessage.error('调整失败，请稍后重试');
  }
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

const applyTemporaryBan = async () => {
  if (!banForm.value.reason) {
    ElMessage.error('请输入封禁原因');
    return;
  }
  
  const durationMs = banForm.value.duration * 24 * 60 * 60 * 1000;
  const banEndTime = new Date(Date.now() + durationMs);
  
  const year = banEndTime.getFullYear();
  const month = String(banEndTime.getMonth() + 1).padStart(2, '0');
  const day = String(banEndTime.getDate()).padStart(2, '0');
  const hours = String(banEndTime.getHours()).padStart(2, '0');
  const minutes = String(banEndTime.getMinutes()).padStart(2, '0');
  const seconds = String(banEndTime.getSeconds()).padStart(2, '0');
  const endTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  try {
    const response = await axios.post('/admin/merchant/ban', null, {
      params: {
        merchantId: currentMerchant.value.id,
        reason: banForm.value.reason,
        endTime: endTimeStr
      }
    });
    
    if (response && response.code === 200) {
      currentMerchant.value.status = 'banned';
      currentMerchant.value.banEndTime = endTimeStr;
      currentMerchant.value.banReason = banForm.value.reason;
      
      showBanDialog.value = false;
      ElMessage.success(`已对商家进行 ${banForm.value.duration} 天的限时封禁`);
    } else {
      ElMessage.error(response?.message || '封禁失败');
    }
  } catch (error) {
    console.error('封禁失败:', error);
    ElMessage.error('封禁失败，请稍后重试');
  }
};

const liftBan = (merchant) => {
  ElMessageBox.confirm('确定要解除该商家的封禁状态吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.post('/admin/merchant/unban', null, {
        params: {
          merchantId: merchant.id
        }
      });
      
      if (response && response.code === 200) {
        merchant.status = 'active';
        merchant.banEndTime = null;
        merchant.banReason = null;
        ElMessage.success('已解除封禁');
      } else {
        ElMessage.error(response?.message || '解除封禁失败');
      }
    } catch (error) {
      console.error('解除封禁失败:', error);
      ElMessage.error('解除封禁失败，请稍后重试');
    }
  }).catch(() => {});
};

const openCloseDialog = (merchant) => {
  currentMerchant.value = merchant;
  showCloseDialog.value = true;
};

const closeShop = async () => {
  try {
    const response = await axios.post('/admin/merchant/close', null, {
      params: {
        merchantId: currentMerchant.value.id
      }
    });
    
    if (response && response.code === 200) {
      currentMerchant.value.status = 'closed';
      currentMerchant.value.productCount = 0;
      
      showCloseDialog.value = false;
      ElMessage.success('店铺已关闭，所有商品已下架');
    } else {
      ElMessage.error(response?.message || '关闭店铺失败');
    }
  } catch (error) {
    console.error('关闭店铺失败:', error);
    ElMessage.error('关闭店铺失败，请稍后重试');
  }
};

const reopenShop = (merchant) => {
  ElMessageBox.confirm('确定要重新开放该店铺吗？商家需要重新上架商品。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.post('/admin/merchant/reopen', null, {
        params: {
          merchantId: merchant.id
        }
      });
      
      if (response && response.code === 200) {
        merchant.status = 'active';
        merchant.banReason = null;
        ElMessage.success('店铺已重新开放');
      } else {
        ElMessage.error(response?.message || '重新开放失败');
      }
    } catch (error) {
      console.error('重新开放失败:', error);
      ElMessage.error('重新开放失败，请稍后重试');
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchMerchants();
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
          @keyup.enter="searchMerchants"
        />
        <el-select v-model="selectedStatus" placeholder="店铺状态" class="filter-select" clearable>
          <el-option label="待审核" value="pending" />
          <el-option label="正常" value="active" />
          <el-option label="封禁中" value="banned" />
          <el-option label="店铺关闭" value="closed" />
        </el-select>
        <button class="search-btn" @click="searchMerchants">搜索</button>
        <button class="reset-btn" @click="resetSearch">重置</button>
      </div>
      
      <div class="merchants-list">
        <div v-if="merchants.length === 0" class="empty-state">
          <div class="empty-icon">🏪</div>
          <div class="empty-text">暂无商家</div>
        </div>
        <div v-else v-for="merchant in merchants" :key="merchant.id" class="merchant-item">
          <div class="merchant-info">
            <div class="merchant-header">
              <span class="merchant-name">{{ merchant.shopName }}</span>
              <span 
                class="level-badge" 
                :style="{ backgroundColor: colorMap[merchant.levelId] || '#999999' }"
              >
                {{ getLevelText(merchant.levelId) }}
              </span>
              <StatusTag :status="getStatusType(merchant)" :text="getStatusText(merchant)" />
            </div>
            <div class="merchant-meta">
              <span>销量: {{ merchant.totalSales }}</span>
              <span>评分: {{ merchant.avgRating }}</span>
              <span>商品数: {{ merchant.productCount }}</span>
            </div>
            <div v-if="merchant.status === 'banned'" class="ban-info">
              <span v-if="merchant.banReason" class="ban-reason">原因: {{ merchant.banReason }}</span>
              <span v-if="merchant.status === 'banned' && merchant.banEndTime" class="ban-time">{{ getBanRemainingTime(merchant) }}</span>
            </div>
          </div>
          <div class="merchant-actions">
            <button class="action-btn" @click="viewDetail(merchant)">查看详情</button>
            <button class="action-btn" @click="adjustLevel(merchant)">调整等级</button>
            
            <template v-if="merchant.status === 'active'">
              <button class="action-btn warning-btn" @click="openBanDialog(merchant)">限时封禁</button>
              <button class="action-btn danger-btn" @click="openCloseDialog(merchant)">关闭店铺</button>
            </template>
            
            <template v-else-if="merchant.status === 'banned'">
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
          <span class="form-value">{{ currentMerchant?.shopName }}</span>
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
          <span class="form-value">{{ currentMerchant?.shopName }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">商品数量</span>
          <span class="form-value highlight">{{ currentMerchant?.productCount }} 件</span>
        </div>
        <div class="ban-tip danger">
          <span class="tip-icon">🚫</span>
          <span class="tip-text">关闭店铺将下架该商家的所有商品，商家无法进行任何操作。</span>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showCloseDialog = false">取消</button>
        <button class="dialog-btn confirm-btn danger" @click="closeShop">确认关闭</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showDetailDialog" title="商家详情" width="600px">
      <div v-if="currentMerchant" class="detail-content">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">用户ID</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.userId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">姓名</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">手机号</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">邮箱</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">性别</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.gender }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">城市</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.city }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">银行卡号</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.bankAccount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态</span>
              <StatusTag :status="getStatusType(currentMerchant.basicInfo)" :text="getStatusText(currentMerchant.basicInfo)" />
            </div>
            <div class="detail-item">
              <span class="detail-label">注册时间</span>
              <span class="detail-value">{{ currentMerchant.basicInfo.createTime }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <div class="section-title">店铺信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">店铺名称</span>
              <span class="detail-value">{{ currentMerchant.shopInfo.shopName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商家等级</span>
              <span 
                class="level-badge" 
                :style="{ backgroundColor: colorMap[currentMerchant.shopInfo.levelId] || '#999999' }"
              >
                {{ getLevelText(currentMerchant.shopInfo.levelId) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平台费率</span>
              <span class="detail-value">{{ (currentMerchant.shopInfo.rate * 100).toFixed(2) }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">店铺状态</span>
              <StatusTag :status="getStatusType({ status: currentMerchant.shopInfo.shopStatus })" :text="getStatusText({ status: currentMerchant.shopInfo.shopStatus })" />
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ currentMerchant.shopInfo.createTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">更新时间</span>
              <span class="detail-value">{{ currentMerchant.shopInfo.updateTime }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="currentMerchant.banRecords && currentMerchant.banRecords.length > 0" class="detail-section">
          <div class="section-title">封禁记录</div>
          <div class="ban-records">
            <div v-for="record in currentMerchant.banRecords" :key="record.id" class="ban-record-item">
              <div class="record-row">
                <span class="record-label">封禁原因</span>
                <span class="record-value danger">{{ record.banReason }}</span>
              </div>
              <div class="record-row">
                <span class="record-label">封禁时间</span>
                <span class="record-value">{{ record.banStartTime }} ~ {{ record.banEndTime }}</span>
              </div>
              <div class="record-row">
                <span class="record-label">状态</span>
                <StatusTag :status="record.status === 'active' ? 'danger' : 'info'" :text="record.status === 'active' ? '生效中' : '已解除'" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn confirm-btn" @click="showDetailDialog = false">关闭</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showLevelDialog" title="调整商家等级" width="400px">
      <div v-if="currentMerchant" class="level-dialog-content">
        <div class="level-info">
          <span class="level-label">商家名称:</span>
          <span class="level-value">{{ currentMerchant.shopName }}</span>
        </div>
        <div class="level-info">
          <span class="level-label">当前等级:</span>
          <span 
            class="level-badge" 
            :style="{ backgroundColor: colorMap[currentMerchant.levelId] || '#999999' }"
          >
            {{ getLevelText(currentMerchant.levelId) }}
          </span>
        </div>
        <div class="form-item">
          <span class="form-label">选择新等级</span>
          <el-select v-model="selectedLevelId" class="form-select">
            <el-option
              v-for="(name, id) in levelMap"
              :key="id"
              :label="name"
              :value="parseInt(id)"
            />
          </el-select>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showLevelDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="saveLevelAdjust">确认调整</button>
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
  font-family: Inter;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.filter-select {
  width: 140px;
}

::v-deep(.filter-select .el-select__wrapper) {
  border-radius: 100px !important;
  box-shadow: none !important;
  border: solid 1px #d9d9d9 !important;
}

::v-deep(.filter-select .el-select__wrapper.is-hovering) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3) !important;
}

::v-deep(.filter-select .el-select__wrapper.is-focused) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5) !important;
}

.search-btn, .reset-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn {
  background-color: #cb5747;
  border: none;
  color: #ffffff;
}

.search-btn:hover {
  background-color: #b04a3c;
}

.reset-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.reset-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.merchants-list {
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
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-family: Inter;
  color: #999999;
  font-weight: 500;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
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

.level-badge {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-family: Inter;
  font-weight: 500;
  color: #ffffff;
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

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #cb5747;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  min-width: 80px;
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.detail-value {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.ban-records {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ban-record-item {
  padding: 12px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #ffebee;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.record-row:last-child {
  margin-bottom: 0;
}

.record-label {
  min-width: 80px;
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}

.record-value {
  font-size: 13px;
  font-family: Inter;
  color: #333333;
}

.record-value.danger {
  color: #f44336;
}

.level-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-label {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  min-width: 80px;
}

.level-value {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}
</style>
