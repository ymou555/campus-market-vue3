<script setup>
import { ref, onMounted } from 'vue';
import axios from '../../utils/axios';
import UploadImage from '../../components/UploadImage.vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const banners = ref([]);

const fetchBanners = async () => {
  try {
    const response = await axios.get('/banner/list');
    if (response && response.code === 200) {
      banners.value = response.data;
    } else {
      ElMessage.error(response?.message || '获取轮播图列表失败');
    }
  } catch (error) {
    ElMessage.error('获取轮播图列表失败');
  }
};

onMounted(() => {
  fetchBanners();
});

const showAddDialog = ref(false);
const newBanner = ref({
  bannerName: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 1
});
const newBannerFile = ref(null);
const uploadImageKey = ref(0);

const showEditDialog = ref(false);
const editBannerData = ref({
  id: null,
  bannerName: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 1
});
const editBannerFile = ref(null);
const editImageKey = ref(0);

const openAddDialog = () => {
  newBanner.value = { bannerName: '', imageUrl: '', linkUrl: '', sortOrder: 1 };
  newBannerFile.value = null;
  uploadImageKey.value++;
  showAddDialog.value = true;
};

const handleBannerFileUpload = (file) => {
  newBannerFile.value = file;
};

const handleEditFileUpload = (file) => {
  editBannerFile.value = file;
};

const toggleStatus = async (banner) => {
  try {
    if (banner.status === 'active') {
      const response = await axios.post(`/banner/deactivate?id=${banner.id}`);
      if (response && response.code === 200) {
        banner.status = 'inactive';
        ElMessage.success('已禁用');
      } else {
        ElMessage.error(response?.message || '禁用失败');
      }
    } else {
      const response = await axios.post(`/banner/activate?id=${banner.id}`);
      if (response && response.code === 200) {
        banner.status = 'active';
        ElMessage.success('已启用');
      } else {
        ElMessage.error(response?.message || '启用失败');
      }
    }
  } catch (error) {
    ElMessage.error('操作失败，请稍后重试');
  }
};

const editBanner = async (banner) => {
  try {
    const response = await axios.get(`/banner/detail?id=${banner.id}`);
    if (response && response.code === 200) {
      const data = response.data;
      editBannerData.value = {
        id: data.id,
        bannerName: data.bannerName || '',
        imageUrl: `http://localhost:8080/campus-market${data.imageUrl}`,
        linkUrl: data.linkUrl || '',
        sortOrder: data.sortOrder || 1
      };
      editBannerFile.value = null;
      editImageKey.value++;
      showEditDialog.value = true;
    } else {
      ElMessage.error(response?.message || '获取轮播图详情失败');
    }
  } catch (error) {
    ElMessage.error('获取轮播图详情失败');
  }
};

const updateBanner = async () => {
  try {
    const formData = new FormData();
    formData.append('id', editBannerData.value.id);
    if (editBannerFile.value) {
      formData.append('file', editBannerFile.value);
    }
    formData.append('bannerName', editBannerData.value.bannerName || '');
    formData.append('linkUrl', editBannerData.value.linkUrl || '');
    formData.append('sortOrder', editBannerData.value.sortOrder);
    
    const response = await axios.post('/banner/update-with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response && response.code === 200) {
      showEditDialog.value = false;
      ElMessage.success('更新成功');
      fetchBanners();
    } else {
      ElMessage.error(response?.message || '更新失败');
    }
  } catch (error) {
    ElMessage.error('更新失败，请稍后重试');
  }
};

const deleteBanner = (banner) => {
  ElMessageBox.confirm(
    `确定要删除轮播图"${banner.bannerName || '未命名'}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`/banner/delete?id=${banner.id}`);
      if (response && response.code === 200) {
        ElMessage.success('删除成功');
        fetchBanners();
      } else {
        ElMessage.error(response?.message || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {});
};

const addBanner = async () => {
  if (!newBannerFile.value) {
    ElMessage.error('请上传图片');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', newBannerFile.value);
    if (newBanner.value.bannerName) {
      formData.append('bannerName', newBanner.value.bannerName);
    }
    if (newBanner.value.linkUrl) {
      formData.append('linkUrl', newBanner.value.linkUrl);
    }
    formData.append('sortOrder', newBanner.value.sortOrder);
    
    const response = await axios.post('/banner/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response && response.code === 200) {
      newBanner.value = { bannerName: '', imageUrl: '', linkUrl: '', sortOrder: 1 };
      newBannerFile.value = null;
      showAddDialog.value = false;
      ElMessage.success('添加成功');
      fetchBanners();
    } else {
      ElMessage.error(response?.message || '添加失败');
    }
  } catch (error) {
    ElMessage.error('添加失败，请稍后重试');
  }
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
        <button class="add-btn" @click="openAddDialog">+ 新增轮播图</button>
      </div>
      
      <div class="banners-list">
        <div v-for="banner in banners" :key="banner.id" class="banner-item">
          <img :src="`http://localhost:8080/campus-market${banner.imageUrl}`" class="banner-image" />
          <div class="banner-info">
            <div class="banner-title">{{ banner.bannerName }}</div>
            <div class="banner-meta">
              <span>跳转链接: {{ banner.linkUrl || '无' }}</span>
              <span>排序: {{ banner.sortOrder }}</span>
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
            v-model="newBanner.bannerName"
            class="form-input"
            placeholder="请输入标题"
          />
        </div>
        <div class="form-item">
          <span class="form-label">图片</span>
          <UploadImage 
            :key="uploadImageKey"
            v-model="newBanner.imageUrl"
            placeholder="点击上传轮播图"
            @upload="handleBannerFileUpload"
          />
        </div>
        <div class="form-item">
          <span class="form-label">跳转链接</span>
          <input 
            v-model="newBanner.linkUrl"
            class="form-input"
            placeholder="请输入跳转链接"
          />
        </div>
        <div class="form-item">
          <span class="form-label">排序</span>
          <input 
            v-model.number="newBanner.sortOrder"
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
    
    <el-dialog v-model="showEditDialog" title="编辑轮播图" width="600px">
      <div class="add-form">
        <div class="form-item">
          <span class="form-label">标题</span>
          <input 
            v-model="editBannerData.bannerName"
            class="form-input"
            placeholder="请输入标题"
          />
        </div>
        <div class="form-item">
          <span class="form-label">图片</span>
          <UploadImage 
            :key="editImageKey"
            v-model="editBannerData.imageUrl"
            placeholder="点击更换轮播图"
            @upload="handleEditFileUpload"
          />
        </div>
        <div class="form-item">
          <span class="form-label">跳转链接</span>
          <input 
            v-model="editBannerData.linkUrl"
            class="form-input"
            placeholder="请输入跳转链接"
          />
        </div>
        <div class="form-item">
          <span class="form-label">排序</span>
          <input 
            v-model.number="editBannerData.sortOrder"
            type="number"
            class="form-input"
            placeholder="请输入排序值"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showEditDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="updateBanner">确定</button>
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
