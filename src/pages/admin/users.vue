<script setup>
import { ref } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const searchKeyword = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');

const users = ref([
  { id: 1, username: 'zhangsan', name: '张三', phone: '13800138000', email: 'zhangsan@example.com', role: 'user', status: 'active', registerTime: '2024-01-15' },
  { id: 2, username: 'lisi', name: '李四', phone: '13900139000', email: 'lisi@example.com', role: 'merchant', status: 'active', registerTime: '2024-01-14' },
  { id: 3, username: 'wangwu', name: '王五', phone: '13700137000', email: 'wangwu@example.com', role: 'user', status: 'banned', registerTime: '2024-01-13' },
  { id: 4, username: 'zhaoliu', name: '赵六', phone: '13600136000', email: 'zhaoliu@example.com', role: 'merchant', status: 'active', registerTime: '2024-01-12' }
]);

const showRechargeDialog = ref(false);
const currentUser = ref(null);
const rechargeAmount = ref('');

const getRoleText = (role) => {
  const roleMap = { 'user': '普通用户', 'merchant': '商家', 'admin': '管理员' };
  return roleMap[role] || '未知';
};

const getStatusText = (status) => {
  return status === 'active' ? '正常' : '已封禁';
};

const getStatusType = (status) => {
  return status === 'active' ? 'success' : 'danger';
};

const searchUsers = () => {
  ElMessage.success('搜索功能开发中');
};

const resetSearch = () => {
  searchKeyword.value = '';
  selectedRole.value = '';
  selectedStatus.value = '';
};

const viewDetail = (user) => {
  ElMessage.info('查看用户详情功能开发中');
};

const toggleBan = (user) => {
  user.status = user.status === 'active' ? 'banned' : 'active';
  ElMessage.success(user.status === 'active' ? '已解封' : '已封禁');
};

const openRechargeDialog = (user) => {
  currentUser.value = user;
  rechargeAmount.value = '';
  showRechargeDialog.value = true;
};

const handleRecharge = () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    ElMessage.error('请输入有效的充值金额');
    return;
  }
  showRechargeDialog.value = false;
  ElMessage.success(`已为用户 ${currentUser.value.name} 充值 ${rechargeAmount.value} 元`);
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 用户管理</span>
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
        <el-select v-model="selectedRole" placeholder="用户角色" class="filter-select" clearable>
          <el-option label="普通用户" value="user" />
          <el-option label="商家" value="merchant" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="selectedStatus" placeholder="用户状态" class="filter-select" clearable>
          <el-option label="正常" value="active" />
          <el-option label="已封禁" value="banned" />
        </el-select>
        <button class="search-btn" @click="searchUsers">搜索</button>
        <button class="reset-btn" @click="resetSearch">重置</button>
      </div>
      
      <div class="users-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <div class="user-info">
            <div class="user-header">
              <span class="user-name">{{ user.name }}</span>
              <StatusTag :status="selectedRole === 'merchant' ? 'warning' : 'info'" :text="getRoleText(user.role)" />
              <StatusTag :status="getStatusType(user.status)" :text="getStatusText(user.status)" />
            </div>
            <div class="user-meta">
              <span>用户名: {{ user.username }}</span>
              <span>手机号: {{ user.phone }}</span>
              <span>邮箱: {{ user.email }}</span>
              <span>注册时间: {{ user.registerTime }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="action-btn" @click="viewDetail(user)">查看详情</button>
            <button 
              class="action-btn"
              :class="user.status === 'active' ? 'ban-btn' : 'unban-btn'"
              @click="toggleBan(user)"
            >
              {{ user.status === 'active' ? '封禁' : '解封' }}
            </button>
            <button class="action-btn primary-btn" @click="openRechargeDialog(user)">充值</button>
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
</style>
