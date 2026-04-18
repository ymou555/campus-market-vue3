<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '../../components/BackButton.vue';
import FormInput from '../../components/FormInput.vue';
import UploadImage from '../../components/UploadImage.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const productForm = reactive({
  name: '',
  category: '',
  condition: '',
  isBargain: false,
  originalPrice: '',
  discountPrice: '',
  stock: '',
  images: [],
  description: '',
  specifications: ''
});

const categoryOptions = [
  { value: 'electronics', label: '电子产品' },
  { value: 'clothing', label: '服装' },
  { value: 'books', label: '图书' },
  { value: 'sports', label: '运动器材' },
  { value: 'furniture', label: '家具' },
  { value: 'other', label: '其他' }
];

const conditionOptions = [
  { value: 'new', label: '全新' },
  { value: 'almost-new', label: '几乎全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' }
];

const handleSubmit = () => {
  if (!productForm.name) {
    ElMessage.error('请输入商品名称');
    return;
  }
  if (!productForm.category) {
    ElMessage.error('请选择商品分类');
    return;
  }
  if (!productForm.condition) {
    ElMessage.error('请选择新旧程度');
    return;
  }
  if (!productForm.discountPrice) {
    ElMessage.error('请输入折扣价');
    return;
  }
  if (!productForm.stock) {
    ElMessage.error('请输入库存数量');
    return;
  }
  if (productForm.images.length === 0) {
    ElMessage.error('请上传商品图片');
    return;
  }
  if (!productForm.description) {
    ElMessage.error('请输入商品描述');
    return;
  }
  
  ElMessage.success('商品提交成功，等待审核');
  setTimeout(() => {
    router.push('/merchant/products');
  }, 1500);
};

const handleSave = () => {
  ElMessage.success('商品已保存为草稿');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 发布商品</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="publish-container">
      <h2 class="page-title">发布商品</h2>
      
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="productForm.name"
              label="商品名称"
              placeholder="请输入商品名称"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <span class="form-label">商品分类 <span class="required-mark">*</span></span>
            <el-select v-model="productForm.category" placeholder="请选择分类" class="form-select">
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="form-item">
            <span class="form-label">新旧程度 <span class="required-mark">*</span></span>
            <el-select v-model="productForm.condition" placeholder="请选择" class="form-select">
              <el-option
                v-for="item in conditionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item checkbox-item">
            <input type="checkbox" v-model="productForm.isBargain" class="checkbox" />
            <span class="checkbox-label">支持议价</span>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">价格库存</h3>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="productForm.originalPrice"
              label="原价"
              placeholder="请输入原价"
            />
          </div>
          <div class="form-item">
            <FormInput 
              v-model="productForm.discountPrice"
              label="折扣价"
              placeholder="请输入折扣价"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="productForm.stock"
              label="库存数量"
              placeholder="请输入库存数量"
              required
            />
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">商品图片</h3>
        <div class="upload-grid">
          <div class="upload-item">
            <UploadImage 
              v-model="productForm.images[0]"
              placeholder="主图"
            />
          </div>
          <div class="upload-item">
            <UploadImage 
              v-model="productForm.images[1]"
              placeholder="图片2"
            />
          </div>
          <div class="upload-item">
            <UploadImage 
              v-model="productForm.images[2]"
              placeholder="图片3"
            />
          </div>
          <div class="upload-item">
            <UploadImage 
              v-model="productForm.images[3]"
              placeholder="图片4"
            />
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">商品描述</h3>
        <textarea 
          v-model="productForm.description"
          class="description-input"
          placeholder="请输入商品描述..."
          rows="6"
        ></textarea>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">规格信息（可选）</h3>
        <textarea 
          v-model="productForm.specifications"
          class="description-input"
          placeholder="请输入规格信息，如尺寸、颜色等..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button class="action-btn save-btn" @click="handleSave">保存草稿</button>
        <button class="action-btn submit-btn" @click="handleSubmit">提交审核</button>
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

.publish-container {
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

.form-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.required-mark {
  color: #cb5747;
}

.form-select {
  width: 100%;
}

::v-deep(.form-select .el-select__wrapper) {
  border-radius: 8px !important;
  box-shadow: none !important;
  border: solid 1px #d9d9d9 !important;
}

::v-deep(.form-select .el-select__wrapper.is-hovering) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3) !important;
}

::v-deep(.form-select .el-select__wrapper.is-focused) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5) !important;
}

.checkbox-item {
  flex-direction: row !important;
  align-items: center;
  gap: 8px !important;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #cb5747;
}

.checkbox-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.upload-item {
  min-height: 150px;
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
  gap: 16px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 12px 48px;
  border-radius: 100px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: #ffffff;
  border: 2px solid #d9d9d9;
  color: #666666;
}

.save-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.submit-btn {
  background-color: #cb5747;
  border: 2px solid #cb5747;
  color: #ffffff;
}

.submit-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
  transform: scale(1.05);
}
</style>
