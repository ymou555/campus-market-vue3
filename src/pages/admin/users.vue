<script setup>
import { ref, onMounted, computed } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../../utils/axios';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const searchKeyword = ref('');
const selectedStatus = ref('');
const loading = ref(false);

const users = ref([]);

const showRechargeDialog = ref(false);
const currentUser = ref(null);
const rechargeAmount = ref('');

const showBlacklistDialog = ref(false);
const blacklistReason = ref('');

const showDetailDialog = ref(false);

const getStatusText = (user) => {
  if (user.status === 'pending') {
    return '待审核';
  }
  if (user.blacklistType === 'admin' || user.blacklistType === 'both') {
    return '已拉黑';
  }
  return '正常';
};

const getStatusType = (user) => {
  if (user.status === 'pending') {
    return 'warning';
  }
  if (user.blacklistType === 'admin' || user.blacklistType === 'both') {
    return 'danger';
  }
  return 'success';
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      role: 'user'
    };
    
    if (searchKeyword.value) {
      params.username = searchKeyword.value;
    }
    
    const response = await axios.get('/admin/user/list', { params });
    
    if (response && response.code === 200) {
      users.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!selectedStatus.value) {
    return users.value;
  }
  
  return users.value.filter(user => {
    if (selectedStatus.value === 'pending') {
      return user.status === 'pending';
    } else if (selectedStatus.value === 'blocked') {
      return user.blacklistType === 'admin' || user.blacklistType === 'both';
    } else if (selectedStatus.value === 'active') {
      return user.status !== 'pending' && user.blacklistType !== 'admin' && user.blacklistType !== 'both';
    }
    return true;
  });
});

const searchUsers = () => {
  fetchUsers();
};

const resetSearch = () => {
  searchKeyword.value = '';
  selectedStatus.value = '';
  fetchUsers();
};

const viewDetail = (user) => {
  currentUser.value = user;
  showDetailDialog.value = true;
};

const openBlacklistDialog = (user) => {
  currentUser.value = user;
  blacklistReason.value = '';
  showBlacklistDialog.value = true;
};

const handleBlacklist = async () => {
  if (!blacklistReason.value) {
    ElMessage.error('请输入拉黑原因');
    return;
  }
  
  if (!userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.error('请先登录');
    return;
  }
  
  try {
    const response = await axios.post('/admin/user/blacklist', null, {
      params: {
        userId: currentUser.value.id,
        adminId: userStore.userInfo.id,
        reason: blacklistReason.value
      }
    });
    
    if (response && response.code === 200) {
      currentUser.value.blacklistType = 'admin';
      showBlacklistDialog.value = false;
      ElMessage.success(`已将用户 ${currentUser.value.name} 加入黑名单`);
    } else {
      ElMessage.error(response?.message || '拉黑失败');
    }
  } catch (error) {
    console.error('拉黑失败:', error);
    ElMessage.error('拉黑失败，请稍后重试');
  }
};

const removeFromBlacklist = async (user) => {
  if (!userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.error('请先登录');
    return;
  }
  
  try {
    const response = await axios.post('/admin/user/blacklist/remove', null, {
      params: {
        userId: user.id,
        adminId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      user.blacklistType = 'none';
      ElMessage.success(`已将用户 ${user.name} 从黑名单移除`);
    } else {
      ElMessage.error(response?.message || '解除拉黑失败');
    }
  } catch (error) {
    console.error('解除拉黑失败:', error);
    ElMessage.error('解除拉黑失败，请稍后重试');
  }
};

const openRechargeDialog = (user) => {
  currentUser.value = user;
  rechargeAmount.value = '';
  showRechargeDialog.value = true;
};

const handleRecharge = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    ElMessage.error('请输入有效的充值金额');
    return;
  }
  
  try {
    const response = await axios.post('/wallet/deposit', null, {
      params: {
        userId: currentUser.value.id,
        amount: rechargeAmount.value
      }
    });
    
    if (response && response.code === 200) {
      showRechargeDialog.value = false;
      ElMessage.success(`已为用户 ${currentUser.value.name} 充值 ${rechargeAmount.value} 元`);
    } else {
      ElMessage.error(response?.message || '充值失败');
    }
  } catch (error) {
    console.error('充值失败:', error);
    ElMessage.error('充值失败，请稍后重试');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 普通用户管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="users-container">
      <div class="search-section">
        <input 
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索用户名、姓名、手机号..."
        />
        <el-select v-model="selectedStatus" placeholder="用户状态" class="filter-select" clearable>
          <el-option label="待审核" value="pending" />
          <el-option label="正常" value="active" />
          <el-option label="已拉黑" value="blocked" />
        </el-select>
        <button class="search-btn" @click="searchUsers">搜索</button>
        <button class="reset-btn" @click="resetSearch">重置</button>
      </div>
      
      <div class="users-list">
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">暂无用户</div>
        </div>
        <div v-else v-for="user in filteredUsers" :key="user.id" class="user-item">
          <div class="user-info">
            <div class="user-header">
              <span class="user-name">{{ user.name }}</span>
              <StatusTag :status="getStatusType(user)" :text="getStatusText(user)" />
            </div>
            <div class="user-meta">
              <span>用户名: {{ user.username }}</span>
              <span>手机号: {{ user.phone }}</span>
              <span>邮箱: {{ user.email }}</span>
              <span>注册时间: {{ user.createTime }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="action-btn" @click="viewDetail(user)">查看详情</button>
            <template v-if="user.status === 'pending'">
            </template>
            <template v-else-if="user.blacklistType === 'admin' || user.blacklistType === 'both'">
              <button 
                class="action-btn unban-btn"
                @click="removeFromBlacklist(user)"
              >
                解除拉黑
              </button>
            </template>
            <template v-else>
              <button 
                class="action-btn ban-btn"
                @click="openBlacklistDialog(user)"
              >
                拉黑
              </button>
              <button class="action-btn primary-btn" @click="openRechargeDialog(user)">充值</button>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showRechargeDialog" title="用户充值" width="400px">
      <div v-if="currentUser" class="recharge-content">
        <div class="recharge-info">
          <span class="recharge-label">用户姓名:</span>
          <span class="recharge-value">{{ currentUser.name }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">充值金额</span>
          <input 
            v-model.number="rechargeAmount"
            type="number"
            class="form-input"
            placeholder="请输入充值金额"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showRechargeDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="handleRecharge">确定充值</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showDetailDialog" title="用户详情" width="550px">
      <div v-if="currentUser" class="detail-form">
        <div class="detail-row">
          <span class="detail-label">用户ID</span>
          <span class="detail-value">{{ currentUser.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用户名</span>
          <span class="detail-value">{{ currentUser.username }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">姓名</span>
          <span class="detail-value">{{ currentUser.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">手机号</span>
          <span class="detail-value">{{ currentUser.phone }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">邮箱</span>
          <span class="detail-value">{{ currentUser.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">城市</span>
          <span class="detail-value">{{ currentUser.city || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">性别</span>
          <span class="detail-value">{{ currentUser.gender || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">银行卡号</span>
          <span class="detail-value">{{ currentUser.bankAccount || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">角色</span>
          <span class="detail-value">{{ currentUser.role === 'user' ? '普通用户' : currentUser.role }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">状态</span>
          <StatusTag :status="getStatusType(currentUser)" :text="getStatusText(currentUser)" />
        </div>
        <div class="detail-row">
          <span class="detail-label">注册时间</span>
          <span class="detail-value">{{ currentUser.createTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">更新时间</span>
          <span class="detail-value">{{ currentUser.updateTime || '-' }}</span>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn confirm-btn" @click="showDetailDialog = false">关闭</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showBlacklistDialog" title="添加黑名单" width="550px">
      <div v-if="currentUser" class="blacklist-form">
        <div class="form-item">
          <span class="form-label">用户名</span>
          <input 
            :value="currentUser.username"
            class="form-input"
            disabled
          />
        </div>
        <div class="form-item">
          <span class="form-label">拉黑原因 <span class="required-mark">*</span></span>
          <textarea 
            v-model="blacklistReason"
            class="form-textarea"
            placeholder="请输入拉黑原因..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showBlacklistDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="handleBlacklist">确定</button>
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
  line-height: 21.5px;
}

.users-container {
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

.users-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-item:hover {
  background-color: #f5f5f5;
}

.user-info {
  flex: 1;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-name {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.user-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  font-family: Inter;
  color: #666666;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 20px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 13px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.ban-btn:hover {
  border-color: #f44336;
  color: #f44336;
}

.unban-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
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
}

.recharge-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recharge-info {
  display: flex;
  gap: 12px;
}

.recharge-label {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  min-width: 80px;
}

.recharge-value {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.required-mark {
  color: #cb5747;
}

.detail-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  min-width: 100px;
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.blacklist-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
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

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
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
</style>
