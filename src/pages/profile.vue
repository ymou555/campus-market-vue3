<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import DataCard from '../components/DataCard.vue';
import FormInput from '../components/FormInput.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const userInfo = reactive({
  username: 'zhangsan',
  name: '张三',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  avatar: 'https://via.placeholder.com/100',
  balance: 1250.50,
  points: 1500,
  orderCount: 12,
  reviewCount: 8
});

const showEditDialog = ref(false);
const showPasswordDialog = ref(false);

const editForm = reactive({
  name: userInfo.name,
  phone: userInfo.phone,
  email: userInfo.email
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const quickActions = [
  { icon: '💰', title: '我的钱包', path: '/wallet' },
  { icon: '⭐', title: '我的积分', path: '/points' },
  { icon: '📦', title: '我的订单', path: '/orders' },
  { icon: '💬', title: '我的评价', path: '/reviews' }
];

const goTo = (path) => {
  router.push(path);
};

const openEditDialog = () => {
  editForm.name = userInfo.name;
  editForm.phone = userInfo.phone;
  editForm.email = userInfo.email;
  showEditDialog.value = true;
};

const saveEdit = () => {
  if (!editForm.name) {
    ElMessage.error('请输入姓名');
    return;
  }
  if (!editForm.phone) {
    ElMessage.error('请输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(editForm.phone)) {
    ElMessage.error('手机号格式不正确');
    return;
  }
  if (!editForm.email) {
    ElMessage.error('请输入邮箱');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
    ElMessage.error('邮箱格式不正确');
    return;
  }
  
  userInfo.name = editForm.name;
  userInfo.phone = editForm.phone;
  userInfo.email = editForm.email;
  showEditDialog.value = false;
  ElMessage.success('修改成功');
};

const openPasswordDialog = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  showPasswordDialog.value = true;
};

const changePassword = () => {
  if (!passwordForm.oldPassword) {
    ElMessage.error('请输入旧密码');
    return;
  }
  if (!passwordForm.newPassword) {
    ElMessage.error('请输入新密码');
    return;
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('密码长度至少6位');
    return;
  }
  if (!passwordForm.confirmPassword) {
    ElMessage.error('请确认新密码');
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  
  showPasswordDialog.value = false;
  ElMessage.success('密码修改成功');
};
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <div class="profile-container">
      <div class="user-section">
        <div class="user-avatar">
          <img :src="userInfo.avatar" class="avatar-img" />
          <div class="avatar-edit">编辑</div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-username">@{{ userInfo.username }}</div>
        </div>
      </div>
      
      <div class="stats-section">
        <DataCard title="账户余额" :value="userInfo.balance" unit="元" icon="💰" />
        <DataCard title="我的积分" :value="userInfo.points" unit="积分" icon="⭐" />
        <DataCard title="订单数量" :value="userInfo.orderCount" unit="个" icon="📦" />
        <DataCard title="评价数量" :value="userInfo.reviewCount" unit="条" icon="💬" />
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
      
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ userInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userInfo.phone }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userInfo.email }}</span>
          </div>
        </div>
        <div class="info-actions">
          <button class="info-btn" @click="openEditDialog">编辑资料</button>
          <button class="info-btn" @click="openPasswordDialog">修改密码</button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <div class="dialog-form">
        <FormInput 
          v-model="editForm.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />
        <FormInput 
          v-model="editForm.phone"
          label="手机号"
          placeholder="请输入手机号"
          required
        />
        <FormInput 
          v-model="editForm.email"
          label="邮箱"
          placeholder="请输入邮箱"
          required
        />
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showEditDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="saveEdit">保存</button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <div class="dialog-form">
        <FormInput 
          v-model="passwordForm.oldPassword"
          type="password"
          label="旧密码"
          placeholder="请输入旧密码"
          required
        />
        <FormInput 
          v-model="passwordForm.newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
          required
        />
        <FormInput 
          v-model="passwordForm.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
          required
        />
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showPasswordDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="changePassword">确定</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
.page {
  padding: 15px 30px 65px;
  background-color: #cb5647;
  background-image: radial-gradient(circle, #a03a30 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100%;
}

.profile-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #cb5747;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 4px 8px;
  background-color: #cb5747;
  color: #ffffff;
  font-size: 11px;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-avatar:hover .avatar-edit {
  opacity: 1;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-family: Inter;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
}

.user-username {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  padding: 20px;
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
  font-size: 32px;
}

.action-title {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.info-label {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
  min-width: 80px;
}

.info-value {
  font-size: 15px;
  font-family: Inter;
  color: #333333;
}

.info-actions {
  display: flex;
  gap: 12px;
}

.info-btn {
  flex: 1;
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-btn {
  padding: 10px 32px;
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
