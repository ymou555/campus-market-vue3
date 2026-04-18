<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '../../components/BackButton.vue';
import FormInput from '../../components/FormInput.vue';
import UploadImage from '../../components/UploadImage.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const shopForm = reactive({
  name: '数码小店',
  logo: 'https://via.placeholder.com/200',
  description: '专注二手数码产品，品质保证，价格实惠',
  phone: '13800138000',
  wechat: 'shop_wechat',
  businessLicense: 'https://via.placeholder.com/300'
});

const handleSave = () => {
  if (!shopForm.name) {
    ElMessage.error('请输入店铺名称');
    return;
  }
  if (!shopForm.phone) {
    ElMessage.error('请输入客服电话');
    return;
  }
  
  ElMessage.success('店铺信息更新成功');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 店铺设置</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="settings-container">
      <h2 class="page-title">店铺设置</h2>
      
      <div class="form-section">
        <h3 class="section-title">店铺信息</h3>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="shopForm.name"
              label="店铺名称"
              placeholder="请输入店铺名称"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <span class="form-label">店铺Logo</span>
            <UploadImage 
              v-model="shopForm.logo"
              placeholder="点击上传店铺Logo"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item full-width">
            <span class="form-label">店铺描述</span>
            <textarea 
              v-model="shopForm.description"
              class="description-input"
              placeholder="请输入店铺描述..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">联系方式</h3>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="shopForm.phone"
              label="客服电话"
              placeholder="请输入客服电话"
              required
            />
          </div>
          <div class="form-item">
            <FormInput 
              v-model="shopForm.wechat"
              label="微信号"
              placeholder="请输入微信号"
            />
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">营业执照</h3>
        
        <div class="form-row">
          <div class="form-item">
            <span class="form-label">营业执照图片</span>
            <UploadImage 
              v-model="shopForm.businessLicense"
              placeholder="点击查看/更换营业执照"
            />
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="save-btn" @click="handleSave">保存更新</button>
      </div>
    </div>
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

.settings-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.page-title {
  font-size: 24px;
  font-family: Inter;
  font-weight: 700;
  color: #333333;
  margin: 0 0 30px 0;
  text-align: center;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #cb5747;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  flex: none;
  width: 100%;
}

.form-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.description-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.description-input:hover:not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.description-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.save-btn {
  padding: 12px 60px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}
</style>
