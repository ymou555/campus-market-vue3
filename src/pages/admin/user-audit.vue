<script setup>
import { ref } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import { ElMessage } from 'element-plus';

const currentTab = ref('pending');

const tabs = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
];

const pendingUsers = ref([
  { id: 1, username: 'zhangsan', name: '张三', phone: '13800138000', type: 'user', registerTime: '2024-01-15 10:30:00' },
  { id: 2, username: 'lisi', name: '李四', phone: '13900139000', type: 'merchant', registerTime: '2024-01-14 15:20:00', shopName: '数码小店', license: 'https://via.placeholder.com/200' },
  { id: 3, username: 'wangwu', name: '王五', phone: '13700137000', type: 'merchant', registerTime: '2024-01-13 09:15:00', shopName: '运动装备', license: 'https://via.placeholder.com/200' }
]);

const auditedUsers = ref([
  { id: 4, username: 'zhaoliu', name: '赵六', phone: '13600136000', type: 'user', registerTime: '2024-01-12 14:30:00', auditTime: '2024-01-12 16:00:00', status: 'approved', auditor: '管理员A' },
  { id: 5, username: 'sunqi', name: '孙七', phone: '13500135000', type: 'merchant', registerTime: '2024-01-11 11:00:00', auditTime: '2024-01-11 14:00:00', status: 'rejected', auditor: '管理员A', reason: '营业执照信息不完整' }
]);

const showDetailDialog = ref(false);
const showAuditDialog = ref(false);
const currentUser = ref(null);
const auditOpinion = ref('');

const getTypeText = (type) => {
  return type === 'merchant' ? '商家' : '普通用户';
};

const viewDetail = (user) => {
  currentUser.value = user;
  showDetailDialog.value = true;
};

const openAuditDialog = (user) => {
  currentUser.value = user;
  auditOpinion.value = '';
  showAuditDialog.value = true;
};

const handleAudit = (approved) => {
  if (!approved && !auditOpinion.value) {
    ElMessage.error('请填写拒绝原因');
    return;
  }
  
  const index = pendingUsers.value.findIndex(u => u.id === currentUser.value.id);
  if (index > -1) {
    const user = pendingUsers.value[index];
    auditedUsers.value.unshift({
      ...user,
      auditTime: new Date().toLocaleString(),
      status: approved ? 'approved' : 'rejected',
      auditor: '当前管理员',
      reason: approved ? '' : auditOpinion.value
    });
    pendingUsers.value.splice(index, 1);
  }
  
  showAuditDialog.value = false;
  ElMessage.success(approved ? '审核通过' : '已拒绝');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 用户审核</span>
    </div>
    
    <div class="audit-container">
      <div class="tabs-wrapper">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>
      
      <div v-if="currentTab === 'pending'" class="user-list">
        <div v-for="user in pendingUsers" :key="user.id" class="user-item">
          <div class="user-info">
            <div class="user-header">
              <span class="user-name">{{ user.name }}</span>
              <StatusTag :status="user.type === 'merchant' ? 'warning' : 'info'" :text="getTypeText(user.type)" />
            </div>
            <div class="user-meta">
              <span>用户名: {{ user.username }}</span>
              <span>手机号: {{ user.phone }}</span>
              <span>注册时间: {{ user.registerTime }}</span>
            </div>
            <div v-if="user.type === 'merchant'" class="shop-info">
              <span>店铺名称: {{ user.shopName }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="action-btn" @click="viewDetail(user)">查看详情</button>
            <button class="action-btn primary-btn" @click="openAuditDialog(user)">审核</button>
          </div>
        </div>
      </div>
      
      <div v-else class="user-list">
        <div v-for="user in auditedUsers" :key="user.id" class="user-item">
          <div class="user-info">
            <div class="user-header">
              <span class="user-name">{{ user.name }}</span>
              <StatusTag :status="user.type === 'merchant' ? 'warning' : 'info'" :text="getTypeText(user.type)" />
              <StatusTag :status="user.status === 'approved' ? 'success' : 'danger'" :text="user.status === 'approved' ? '已通过' : '已拒绝'" />
            </div>
            <div class="user-meta">
              <span>用户名: {{ user.username }}</span>
              <span>手机号: {{ user.phone }}</span>
              <span>审核时间: {{ user.auditTime }}</span>
            </div>
            <div v-if="user.reason" class="reject-reason">
              拒绝原因: {{ user.reason }}
            </div>
          </div>
          <div class="user-actions">
            <button class="action-btn" @click="viewDetail(user)">查看详情</button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showDetailDialog" title="用户详情" width="600px">
      <div v-if="currentUser" class="detail-content">
        <div class="detail-item">
          <span class="detail-label">用户名</span>
          <span class="detail-value">{{ currentUser.username }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">姓名</span>
          <span class="detail-value">{{ currentUser.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">手机号</span>
          <span class="detail-value">{{ currentUser.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户类型</span>
          <span class="detail-value">{{ getTypeText(currentUser.type) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">注册时间</span>
          <span class="detail-value">{{ currentUser.registerTime }}</span>
        </div>
        <div v-if="currentUser.type === 'merchant'" class="detail-item">
          <span class="detail-label">店铺名称</span>
          <span class="detail-value">{{ currentUser.shopName }}</span>
        </div>
        <div v-if="currentUser.license" class="detail-item">
          <span class="detail-label">营业执照</span>
          <img :src="currentUser.license" class="license-image" />
        </div>
      </div>
    </el-dialog>
    
    <el-dialog v-model="showAuditDialog" title="审核用户" width="500px">
      <div v-if="currentUser" class="audit-content">
        <div class="audit-info">
          <span class="audit-label">用户姓名:</span>
          <span class="audit-value">{{ currentUser.name }}</span>
        </div>
        <div class="audit-info">
          <span class="audit-label">用户类型:</span>
          <span class="audit-value">{{ getTypeText(currentUser.type) }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">审核意见</span>
          <textarea 
            v-model="auditOpinion"
            class="form-textarea"
            placeholder="请填写审核意见（拒绝时必填）..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn reject-btn" @click="handleAudit(false)">拒绝</button>
        <button class="dialog-btn confirm-btn" @click="handleAudit(true)">通过</button>
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

.audit-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.tabs-wrapper {
  display: flex;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  font-family: Inter;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #cb5747;
  background-color: rgba(203, 87, 71, 0.02);
}

.tab-item.active {
  color: #cb5747;
  font-weight: 600;
  border-bottom-color: #cb5747;
  background-color: #ffffff;
}

.user-list {
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
  margin-bottom: 8px;
}

.shop-info {
  font-size: 13px;
  font-family: Inter;
  color: #cb5747;
}

.reject-reason {
  font-size: 13px;
  font-family: Inter;
  color: #f44336;
  margin-top: 8px;
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

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
}

.detail-value {
  font-size: 15px;
  font-family: Inter;
  color: #333333;
}

.license-image {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.audit-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-info {
  display: flex;
  gap: 12px;
}

.audit-label {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  min-width: 80px;
}

.audit-value {
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

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reject-btn {
  background-color: #ffffff;
  border: 1px solid #f44336;
  color: #f44336;
}

.reject-btn:hover {
  background-color: #f44336;
  color: #ffffff;
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
