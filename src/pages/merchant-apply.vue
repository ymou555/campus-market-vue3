<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import FormInput from '../components/FormInput.vue';
import PageCard from '../components/PageCard.vue';
import UploadImage from '../components/UploadImage.vue';
import { useUserStore } from '../store/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  name: '',
  phone: '',
  email: '',
  shopName: '',
  businessLicense: '',
  idCard: ''
});

onMounted(() => {
  if (userStore.userInfo) {
    form.name = userStore.userInfo.name || '';
    form.phone = userStore.userInfo.phone || '';
    form.email = userStore.userInfo.email || '';
  }
});

const handleSubmit = () => {
  if (!form.shopName) {
    ElMessage.error('请输入店铺名称');
    return;
  }
  if (!form.businessLicense) {
    ElMessage.error('请上传营业执照');
    return;
  }
  if (!form.idCard) {
    ElMessage.error('请上传身份证图片');
    return;
  }
  
  ElMessage.success('申请已提交，请等待管理员审核');
  router.push('/');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台</span>
    </div>
    <div class="flex-row justify-start items-center self-start mb-20">
      <BackButton />
    </div>
    
    <PageCard title="商家入驻申请" width="850px">
      <div class="apply-form">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              :model-value="form.name"
              label="姓名"
              disabled
            />
          </div>
          <div class="form-item">
            <FormInput 
              :model-value="form.phone"
              label="手机号"
              disabled
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              :model-value="form.email"
              label="邮箱"
              disabled
            />
          </div>
        </div>
        
        <h3 class="section-title">店铺信息</h3>
        <div class="form-row">
          <div class="form-item full-width">
            <FormInput 
              v-model="form.shopName"
              label="店铺名称"
              placeholder="请输入店铺名称"
              required
            />
          </div>
        </div>
        
        <h3 class="section-title">证件上传</h3>
        <div class="upload-section">
          <div class="upload-item">
            <span class="upload-label">营业执照 <span class="required-mark">*</span></span>
            <UploadImage 
              v-model="form.businessLicense"
              placeholder="点击上传营业执照"
            />
          </div>
          <div class="upload-item">
            <span class="upload-label">身份证图片 <span class="required-mark">*</span></span>
            <UploadImage 
              v-model="form.idCard"
              placeholder="点击上传身份证图片"
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button class="cancel-btn" @click="router.push('/')">取消</button>
          <button class="submit-btn" @click="handleSubmit">提交申请</button>
        </div>
      </div>
    </PageCard>
  </div>
</template>

<style scoped lang="css">
.mb-20 {
  margin-bottom: 20px;
}

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

.apply-form {
  width: 100%;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #cb5747;
}

.section-title:first-of-type {
  margin-top: 0;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
}

.form-item.full-width {
  flex: none;
  width: 100%;
}

.upload-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-label {
  font-size: 15px;
  font-family: Inter;
  line-height: 14px;
  color: #333333;
}

.required-mark {
  color: #cb5747;
  margin-left: 2px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cancel-btn {
  padding: 12px 0 10px;
  border-radius: 100px;
  width: 120px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: transparent;
  border: solid 2px #cb5747;
  color: #cb5747;
}

.cancel-btn:hover {
  background-color: rgba(203, 87, 71, 0.1);
  transform: scale(1.05);
}

.submit-btn {
  padding: 12px 60px;
  background-color: #cb5747;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}
</style>
