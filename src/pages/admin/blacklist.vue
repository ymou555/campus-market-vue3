<script setup>
import { ref } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const blacklist = ref([
  { id: 1, username: 'baduser1', name: '不良用户1', blockedBy: '管理员A', reason: '发布违规商品', time: '2024-01-15 10:30:00' },
  { id: 2, username: 'baduser2', name: '不良用户2', blockedBy: '管理员B', reason: '恶意评价', time: '2024-01-14 15:20:00' }
]);

const showAddDialog = ref(false);
const newBlacklist = ref({
  username: '',
  reason: ''
});

const removeFromBlacklist = (item) => {
  const index = blacklist.value.findIndex(b => b.id === item.id);
  if (index > -1) {
    blacklist.value.splice(index, 1);
    ElMessage.success('已从黑名单移除');
  }
};

const addToBlacklist = () => {
  if (!newBlacklist.value.username) {
    ElMessage.error('请输入用户名');
    return;
  }
  if (!newBlacklist.value.reason) {
    ElMessage.error('请输入拉黑原因');
    return;
  }
  
  blacklist.value.unshift({
    id: Date.now(),
    username: newBlacklist.value.username,
    name: newBlacklist.value.username,
    blockedBy: '当前管理员',
    reason: newBlacklist.value.reason,
    time: new Date().toLocaleString()
  });
  
  newBlacklist.value = { username: '', reason: '' };
  showAddDialog.value = false;
  ElMessage.success('已添加到黑名单');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 黑名单管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="blacklist-container">
      <div class="header-section">
        <h2 class="page-title">黑名单管理</h2>
        <button class="add-btn" @click="showAddDialog = true">+ 添加黑名单</button>
      </div>
      
      <div class="blacklist-list">
        <div v-for="item in blacklist" :key="item.id" class="blacklist-item">
          <div class="item-info">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-username">@{{ item.username }}</span>
            </div>
            <div class="item-meta">
              <span>拉黑者: {{ item.blockedBy }}</span>
              <span>原因: {{ item.reason }}</span>
              <span>时间: {{ item.time }}</span>
            </div>
          </div>
          <button class="remove-btn" @click="removeFromBlacklist(item)">解除拉黑</button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showAddDialog" title="添加黑名单" width="500px">
      <div class="add-form">
        <div class="form-item">
          <span class="form-label">用户名</span>
          <input 
            v-model="newBlacklist.username"
            class="form-input"
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-item">
          <span class="form-label">拉黑原因</span>
          <textarea 
            v-model="newBlacklist.reason"
            class="form-textarea"
            placeholder="请输入拉黑原因..."
            rows="4"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showAddDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="addToBlacklist">确定</button>
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

.blacklist-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-family: Inter;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

.add-btn {
  padding: 10px 24px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.blacklist-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.blacklist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.item-username {
  font-size: 14px;
  color: #999999;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666666;
}

.remove-btn {
  padding: 8px 20px;
  background-color: #ffffff;
  border: 1px solid #4caf50;
  border-radius: 100px;
  color: #4caf50;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: #4caf50;
  color: #ffffff;
}

.add-form {
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

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}
</style>
