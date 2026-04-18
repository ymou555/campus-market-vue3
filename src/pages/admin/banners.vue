<script setup>
import { ref } from 'vue';
import UploadImage from '../../components/UploadImage.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const banners = ref([
  { id: 1, title: '新年大促', image: 'https://via.placeholder.com/800x300', link: '/promotion/1', status: 'active', order: 1 },
  { id: 2, title: '开学季特惠', image: 'https://via.placeholder.com/800x300', link: '/promotion/2', status: 'active', order: 2 },
  { id: 3, title: '限时秒杀', image: 'https://via.placeholder.com/800x300', link: '/promotion/3', status: 'inactive', order: 3 }
]);

const showAddDialog = ref(false);
const newBanner = ref({
  title: '',
  image: '',
  link: '',
  order: 1
});

const toggleStatus = (banner) => {
  banner.status = banner.status === 'active' ? 'inactive' : 'active';
  ElMessage.success(banner.status === 'active' ? '已启用' : '已禁用');
};

const editBanner = (banner) => {
  ElMessage.info('编辑功能开发中');
};

const deleteBanner = (banner) => {
  const index = banners.value.findIndex(b => b.id === banner.id);
  if (index > -1) {
    banners.value.splice(index, 1);
    ElMessage.success('删除成功');
  }
};

const addBanner = () => {
  if (!newBanner.value.title) {
    ElMessage.error('请输入标题');
    return;
  }
  if (!newBanner.value.image) {
    ElMessage.error('请上传图片');
    return;
  }
  
  banners.value.push({
    id: Date.now(),
    ...newBanner.value,
    status: 'active'
  });
  
  newBanner.value = { title: '', image: '', link: '', order: 1 };
  showAddDialog.value = false;
  ElMessage.success('添加成功');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 轮播图管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="banners-container">
      <div class="header-section">
        <h2 class="page-title">轮播图管理</h2>
        <button class="add-btn" @click="showAddDialog = true">+ 新增轮播图</button>
      </div>
      
      <div class="banners-list">
        <div v-for="banner in banners" :key="banner.id" class="banner-item">
          <img :src="banner.image" class="banner-image" />
          <div class="banner-info">
            <div class="banner-title">{{ banner.title }}</div>
            <div class="banner-meta">
              <span>跳转链接: {{ banner.link || '无' }}</span>
              <span>排序: {{ banner.order }}</span>
              <span>状态: {{ banner.status === 'active' ? '已启用' : '已禁用' }}</span>
            </div>
          </div>
          <div class="banner-actions">
            <button 
              class="action-btn"
              :class="banner.status === 'active' ? 'disable-btn' : 'enable-btn'"
              @click="toggleStatus(banner)"
            >
              {{ banner.status === 'active' ? '禁用' : '启用' }}
            </button>
            <button class="action-btn" @click="editBanner(banner)">编辑</button>
            <button class="action-btn delete-btn" @click="deleteBanner(banner)">删除</button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showAddDialog" title="新增轮播图" width="600px">
      <div class="add-form">
        <div class="form-item">
          <span class="form-label">标题</span>
          <input 
            v-model="newBanner.title"
            class="form-input"
            placeholder="请输入标题"
          />
        </div>
        <div class="form-item">
          <span class="form-label">图片</span>
          <UploadImage 
            v-model="newBanner.image"
            placeholder="点击上传轮播图"
          />
        </div>
        <div class="form-item">
          <span class="form-label">跳转链接</span>
          <input 
            v-model="newBanner.link"
            class="form-input"
            placeholder="请输入跳转链接"
          />
        </div>
        <div class="form-item">
          <span class="form-label">排序</span>
          <input 
            v-model.number="newBanner.order"
            type="number"
            class="form-input"
            placeholder="请输入排序值"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showAddDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="addBanner">确定</button>
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

.banners-container {
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

.banners-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.banner-image {
  width: 200px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
}

.banner-info {
  flex: 1;
}

.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.banner-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666666;
}

.banner-actions {
  display: flex;
  gap: 8px;
  align-items: center;
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

.delete-btn:hover {
  border-color: #f44336;
  color: #f44336;
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
