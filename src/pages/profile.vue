<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import DataCard from '../components/DataCard.vue';
import FormInput from '../components/FormInput.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const userInfo = reactive({
  id: null,
  username: '',
  name: '',
  phone: '',
  email: '',
  city: '',
  gender: '',
  bankAccount: '',
  balance: 0,
  points: 0,
  orderCount: 0,
  reviewCount: 0
});

const getUserAvatarText = () => {
  if (!userInfo.username) {
    return '?';
  }
  return userInfo.username.substring(0, 2).toUpperCase();
};

const fetchUserProfile = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    return;
  }
  
  try {
    const response = await axios.get('/user/profile', {
      params: {
        id: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      Object.assign(userInfo, response.data);
    } else {
      ElMessage.error(response?.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请稍后重试');
  }
};

const showEditDialog = ref(false);
const showPasswordDialog = ref(false);

const editForm = reactive({
  username: '',
  phone: '',
  email: '',
  city: '',
  gender: '',
  bankAccount: ''
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
  editForm.username = userInfo.username;
  editForm.phone = userInfo.phone;
  editForm.email = userInfo.email;
  editForm.city = userInfo.city;
  editForm.gender = userInfo.gender;
  editForm.bankAccount = userInfo.bankAccount;
  showEditDialog.value = true;
};

const saveEdit = async () => {
  if (!editForm.username) {
    ElMessage.error('请输入用户名');
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
  
  try {
    const params = new URLSearchParams();
    params.append('id', userInfo.id);
    params.append('username', editForm.username);
    params.append('phone', editForm.phone);
    params.append('email', editForm.email);
    if (editForm.city) {
      params.append('city', editForm.city);
    }
    if (editForm.gender) {
      params.append('gender', editForm.gender);
    }
    if (editForm.bankAccount) {
      params.append('bankAccount', editForm.bankAccount);
    }
    
    const response = await axios.put('/user/profile', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response && response.code === 200) {
      userInfo.username = editForm.username;
      userInfo.phone = editForm.phone;
      userInfo.email = editForm.email;
      userInfo.city = editForm.city;
      userInfo.gender = editForm.gender;
      userInfo.bankAccount = editForm.bankAccount;
      showEditDialog.value = false;
      ElMessage.success('修改成功');
    } else {
      ElMessage.error(response?.message || '修改失败');
    }
  } catch (error) {
    console.error('修改失败:', error);
    ElMessage.error('修改失败，请稍后重试');
  }
};

const openPasswordDialog = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  showPasswordDialog.value = true;
};

const changePassword = async () => {
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
  
  try {
    const params = new URLSearchParams();
    params.append('userId', userInfo.id);
    params.append('oldPassword', passwordForm.oldPassword);
    params.append('newPassword', passwordForm.newPassword);
    
    const response = await axios.post('/auth/change-password', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response && response.code === 200) {
      showPasswordDialog.value = false;
      ElMessage.success('密码修改成功');
    } else {
      ElMessage.error(response?.message || '密码修改失败');
    }
  } catch (error) {
    console.error('密码修改失败:', error);
    ElMessage.error('密码修改失败，请稍后重试');
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
    
    <div class="profile-container">
      <div class="user-section">
        <div class="user-avatar">
          <span class="avatar-text">{{ getUserAvatarText() }}</span>
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
          <div class="info-item">
            <span class="info-label">城市</span>
            <span class="info-value">{{ userInfo.city || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别</span>
            <span class="info-value">{{ userInfo.gender || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">银行卡号</span>
            <span class="info-value">{{ userInfo.bankAccount || '未设置' }}</span>
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
          v-model="editForm.username"
          label="用户名"
          placeholder="请输入用户名"
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
        <FormInput 
          v-model="editForm.city"
          label="城市"
          placeholder="请输入城市"
        />
        <div class="form-item">
          <label class="form-label">性别</label>
          <div class="gender-options">
            <label class="gender-option">
              <input type="radio" v-model="editForm.gender" value="男" />
              <span>男</span>
            </label>
            <label class="gender-option">
              <input type="radio" v-model="editForm.gender" value="女" />
              <span>女</span>
            </label>
          </div>
        </div>
        <FormInput 
          v-model="editForm.bankAccount"
          label="银行卡号"
          placeholder="请输入银行卡号"
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.avatar-text {
  color: #ffffff;
  font-size: 32px;
  font-family: Inter;
  font-weight: 600;
  line-height: 1;
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

.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.gender-option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #cb5747;
}
</style>
