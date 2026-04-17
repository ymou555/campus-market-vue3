<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import FormInput from '../components/FormInput.vue';
import PageCard from '../components/PageCard.vue';
import UploadImage from '../components/UploadImage.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
  city: '',
  gender: 'male',
  bankAccount: '',
  shopName: '',
  businessLicense: '',
  idCardFront: '',
  idCardBack: '',
  verifyCode: ''
});

const verifyCodeImage = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyNSIgeT0iMjUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiPkFCQ0Q8L3RleHQ+PC9zdmc+');
const correctVerifyCode = ref('ABCD');

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
];

const refreshVerifyCode = () => {
  const codes = ['ABCD', 'EFGH', 'IJKL', 'MNOP', 'QRST', 'UVWX', 'YZAB'];
  const randomCode = codes[Math.floor(Math.random() * codes.length)];
  correctVerifyCode.value = randomCode;
  verifyCodeImage.value = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyNSIgeT0iMjUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiPiR7cmFuZG9tQ29kZX08L3RleHQ+PC9zdmc+`;
};

const handleRegister = () => {
  if (!registerForm.username) {
    ElMessage.error('请输入用户名');
    return;
  }
  if (!registerForm.password) {
    ElMessage.error('请输入密码');
    return;
  }
  if (!registerForm.confirmPassword) {
    ElMessage.error('请确认密码');
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  if (!registerForm.name) {
    ElMessage.error('请输入姓名');
    return;
  }
  if (!registerForm.phone) {
    ElMessage.error('请输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.error('手机号格式不正确');
    return;
  }
  if (!registerForm.email) {
    ElMessage.error('请输入邮箱');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.error('邮箱格式不正确');
    return;
  }
  if (!registerForm.shopName) {
    ElMessage.error('请输入店铺名称');
    return;
  }
  if (!registerForm.businessLicense) {
    ElMessage.error('请上传营业执照');
    return;
  }
  if (!registerForm.idCardFront || !registerForm.idCardBack) {
    ElMessage.error('请上传身份证正反面');
    return;
  }
  if (!registerForm.verifyCode) {
    ElMessage.error('请输入验证码');
    return;
  }
  if (registerForm.verifyCode.toUpperCase() !== correctVerifyCode.value) {
    ElMessage.error('验证码错误');
    refreshVerifyCode();
    return;
  }

  ElMessage.success('入驻申请已提交，请等待管理员审核');
  setTimeout(() => {
    router.push('/login');
  }, 1500);
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
    
    <PageCard title="商家入驻注册" width="850px">
      <div class="register-form">
        <h3 class="section-title">基础信息</h3>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="registerForm.username"
              label="用户名"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-item">
            <FormInput 
              v-model="registerForm.name"
              label="姓名"
              placeholder="请输入真实姓名"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="registerForm.password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              required
            />
          </div>
          <div class="form-item">
            <FormInput 
              v-model="registerForm.confirmPassword"
              type="password"
              label="确认密码"
              placeholder="请再次输入密码"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="registerForm.phone"
              label="手机号"
              placeholder="请输入手机号"
              required
            />
          </div>
          <div class="form-item">
            <FormInput 
              v-model="registerForm.email"
              label="邮箱"
              placeholder="请输入邮箱"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="registerForm.city"
              label="城市"
              placeholder="请输入城市"
            />
          </div>
          <div class="form-item">
            <div class="gender-wrapper">
              <span class="gender-label">性别</span>
              <el-radio-group v-model="registerForm.gender" class="gender-group">
                <el-radio value="male">男</el-radio>
                <el-radio value="female">女</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item full-width">
            <FormInput 
              v-model="registerForm.bankAccount"
              label="银行账号"
              placeholder="请输入银行账号"
            />
          </div>
        </div>
        
        <h3 class="section-title">店铺信息</h3>
        <div class="form-row">
          <div class="form-item full-width">
            <FormInput 
              v-model="registerForm.shopName"
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
              v-model="registerForm.businessLicense"
              placeholder="点击上传营业执照"
            />
          </div>
          <div class="upload-item">
            <span class="upload-label">身份证正面 <span class="required-mark">*</span></span>
            <UploadImage 
              v-model="registerForm.idCardFront"
              placeholder="点击上传身份证正面"
            />
          </div>
          <div class="upload-item">
            <span class="upload-label">身份证反面 <span class="required-mark">*</span></span>
            <UploadImage 
              v-model="registerForm.idCardBack"
              placeholder="点击上传身份证反面"
            />
          </div>
        </div>
        
        <h3 class="section-title">验证码</h3>
        <div class="form-row">
          <div class="form-item">
            <FormInput 
              v-model="registerForm.verifyCode"
              label="验证码"
              placeholder="请输入验证码"
              required
            />
          </div>
          <div class="form-item verify-code-item">
            <div class="verify-code-wrapper">
              <img :src="verifyCodeImage" class="verify-code-image" @click="refreshVerifyCode" />
              <span class="refresh-text" @click="refreshVerifyCode">点击刷新</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="register-btn" @click="handleRegister">提交申请</button>
        </div>
        
        <div class="form-footer">
          <span class="footer-text">已有账号？</span>
          <span class="footer-link" @click="router.push('/login')">立即登录</span>
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

.register-form {
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

.gender-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gender-label {
  font-size: 15px;
  font-family: Inter;
  line-height: 14px;
  color: #333333;
}

.gender-group {
  display: flex;
  gap: 20px;
}

::v-deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #cb5747;
  background: #cb5747;
}

::v-deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #cb5747;
}

::v-deep(.el-radio__inner:hover) {
  border-color: #cb5747;
}

.upload-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.verify-code-item {
  display: flex;
  align-items: flex-end;
}

.verify-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.verify-code-image {
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-code-image:hover {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.refresh-text {
  font-size: 12px;
  color: #999999;
  cursor: pointer;
  transition: color 0.3s ease;
}

.refresh-text:hover {
  color: #cb5747;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.register-btn {
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

.register-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.footer-text {
  font-size: 14px;
  color: #999999;
  font-family: Inter;
}

.footer-link {
  font-size: 14px;
  color: #cb5747;
  font-family: Inter;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #b04a3c;
}
</style>
