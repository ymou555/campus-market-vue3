<script setup>
import { ref, computed, onMounted } from 'vue';
import StatusTag from '../../components/StatusTag.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../../utils/axios';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const searchKeyword = ref('');
const filterType = ref('');
const loading = ref(false);

const blacklist = ref([]);

const showAddDialog = ref(false);
const newBlacklist = ref({
  userId: '',
  reason: ''
});

const getTypeText = (blacklistType) => {
  return blacklistType === 'admin' ? '平台拉黑' : '商家拉黑';
};

const getTypeStatus = (blacklistType) => {
  return blacklistType === 'admin' ? 'danger' : 'warning';
};

const getScopeText = (blacklistType, merchantName) => {
  if (blacklistType === 'admin') return '全平台禁止购买';
  return `仅限"${merchantName}"店铺禁止购买`;
};

const getScopeStatus = (blacklistType) => {
  return blacklistType === 'admin' ? 'danger' : 'info';
};

const fetchBlacklist = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/admin/user/blacklist/list');
    
    if (response && response.code === 200) {
      blacklist.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取黑名单失败');
    }
  } catch (error) {
    console.error('获取黑名单失败:', error);
    ElMessage.error('获取黑名单失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const removeFromBlacklist = async (item) => {
  if (!userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.error('请先登录');
    return;
  }
  
  try {
    ElMessageBox.confirm('确定要将该用户从黑名单移除吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const response = await axios.post('/admin/user/blacklist/remove', null, {
        params: {
          userId: item.id,
          adminId: userStore.userInfo.id
        }
      });
      
      if (response && response.code === 200) {
        ElMessage.success('已从黑名单移除');
        fetchBlacklist();
      } else {
        ElMessage.error(response?.message || '解除拉黑失败');
      }
    }).catch(() => {});
  } catch (error) {
    console.error('解除拉黑失败:', error);
    ElMessage.error('解除拉黑失败，请稍后重试');
  }
};

const addToBlacklist = async () => {
  if (!newBlacklist.value.userId) {
    ElMessage.error('请输入用户ID');
    return;
  }
  if (!newBlacklist.value.reason) {
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
        userId: newBlacklist.value.userId,
        adminId: userStore.userInfo.id,
        reason: newBlacklist.value.reason
      }
    });
    
    if (response && response.code === 200) {
      newBlacklist.value = { 
        userId: '', 
        reason: ''
      };
      showAddDialog.value = false;
      ElMessage.success('已添加到黑名单');
      fetchBlacklist();
    } else {
      ElMessage.error(response?.message || '添加黑名单失败');
    }
  } catch (error) {
    console.error('添加黑名单失败:', error);
    ElMessage.error('添加黑名单失败，请稍后重试');
  }
};

const filteredBlacklist = computed(() => {
  let result = blacklist.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(item => 
      item.username.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword)
    );
  }
  
  if (filterType.value) {
    result = result.filter(item => item.blacklistType === filterType.value);
  }
  
  return result;
});

const resetFilters = () => {
  searchKeyword.value = '';
  filterType.value = '';
};

onMounted(() => {
  fetchBlacklist();
});
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
      
      <div class="filter-section">
        <input 
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索用户名..."
        />
        <el-select v-model="filterType" placeholder="拉黑类型" class="filter-select" clearable>
          <el-option label="平台拉黑" value="admin" />
          <el-option label="商家拉黑" value="merchant" />
        </el-select>
        <button class="reset-btn" @click="resetFilters">重置</button>
      </div>
      
      <div class="blacklist-list">
        <div v-for="item in filteredBlacklist" :key="item.id" class="blacklist-item">
          <div class="item-info">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-username">@{{ item.username }}</span>
              <StatusTag :status="getTypeStatus(item.blacklistType)" :text="getTypeText(item.blacklistType)" />
            </div>
            <div class="item-meta">
              <span>拉黑者: {{ item.blockedBy }}</span>
              <span>原因: {{ item.reason }}</span>
              <span>时间: {{ item.time }}</span>
            </div>
            <div class="item-scope">
              <StatusTag :status="getScopeStatus(item.blacklistType)" :text="getScopeText(item.blacklistType, item.merchantName)" />
            </div>
          </div>
          <button class="remove-btn" @click="removeFromBlacklist(item)">解除拉黑</button>
        </div>
        
        <div v-if="filteredBlacklist.length === 0" class="empty-list">
          <span class="empty-text">暂无符合条件的黑名单记录</span>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showAddDialog" title="添加黑名单" width="550px">
      <div class="add-form">
        <div class="form-item">
          <span class="form-label">用户ID <span class="required-mark">*</span></span>
          <input 
            v-model="newBlacklist.userId"
            class="form-input"
            placeholder="请输入用户ID"
          />
        </div>
        <div class="form-item">
          <span class="form-label">拉黑原因 <span class="required-mark">*</span></span>
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
  margin-bottom: 20px;
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
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #b04a3c;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 100px;
  border: solid 1px #d9d9d9;
  outline: none;
  font-size: 14px;
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

.reset-btn {
  padding: 10px 24px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
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
  transition: all 0.3s ease;
}

.blacklist-item:hover {
  background-color: #f5f5f5;
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
  margin-bottom: 8px;
}

.item-scope {
  margin-top: 8px;
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

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.empty-text {
  font-size: 14px;
  color: #999999;
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

.required-mark {
  color: #cb5747;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
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

.confirm-btn:hover {
  background-color: #b04a3c;
}
</style>
