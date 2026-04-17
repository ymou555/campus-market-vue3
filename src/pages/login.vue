<script setup>
  import { useRouter } from 'vue-router';
  import { reactive, ref } from 'vue';
  import BackButton from '../components/BackButton.vue';
  import { useUserStore } from '../store/user';
  import axios from '../utils/axios';
  import { ElMessage } from 'element-plus';

  const props = defineProps({});

  const router = useRouter();
  const userStore = useUserStore();
  const loginFormRef = ref();
  const identity = ref('user');
  const identityOptions = [
    { value: 'user', label: '普通用户' },
    { value: 'merchant', label: '商家' },
    { value: 'admin', label: '管理员' }
  ];
  const loginForm = reactive({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async () => {
    // 检查用户名是否为空
    if (!loginForm.username) {
      ElMessage.error('请输入用户名');
      return;
    }
    // 检查密码是否为空
    if (!loginForm.password) {
      ElMessage.error('请输入密码');
      return;
    }
    // 检查确认密码是否为空
    if (!loginForm.confirmPassword) {
      ElMessage.error('请再次输入密码');
      return;
    }
    // 检查密码一致性
    if (loginForm.password !== loginForm.confirmPassword) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }
    
    try {
      console.log('发送登录请求:', loginForm);
      const response = await axios.post('/auth/login', {
        username: loginForm.username,
        password: loginForm.password
      });
      console.log('登录响应:', response);
      
      // 检查响应结构
      if (response && response.code === 200) {
        if (response.token) {
          userStore.setToken(response.token);
          // 直接使用接口返回的用户信息
          userStore.setUserInfo(response.user || {});
          ElMessage.success('登录成功');
          router.push('/');
        } else {
          ElMessage.error('登录失败: 缺少token');
        }
      } else {
        ElMessage.error(response?.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      console.error('错误详情:', error.response);
      if (error.response) {
        // 服务器返回错误
        ElMessage.error(`登录失败: ${error.response.data?.message || '服务器错误'}`);
      } else if (error.request) {
        // 请求已发送但没有收到响应
        ElMessage.error('登录失败: 服务器无响应');
      } else {
        // 请求配置出错
        ElMessage.error('登录失败: 请求配置错误');
      }
    }
  };

  // 注册类型选择弹窗
  const showRegisterDialog = ref(false);
  const selectedRegisterType = ref('user');
  
  const handleRegisterTypeSelect = () => {
    showRegisterDialog.value = false;
    if (selectedRegisterType.value === 'user') {
      router.push('/register');
    } else if (selectedRegisterType.value === 'merchant') {
      router.push('/merchant-register');
    }
  };

  // 忘记密码弹窗
  const showForgotPasswordDialog = ref(false);
  const forgotPasswordForm = reactive({
    username: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const handleForgotPassword = async () => {
    if (!forgotPasswordForm.username) {
      ElMessage.error('请输入用户名');
      return;
    }
    if (!forgotPasswordForm.newPassword) {
      ElMessage.error('请输入新密码');
      return;
    }
    if (!forgotPasswordForm.confirmNewPassword) {
      ElMessage.error('请再次输入新密码');
      return;
    }
    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmNewPassword) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }
    
    try {
      console.log('发送重置密码请求:', forgotPasswordForm);
      // 模拟重置密码
      ElMessage.success('密码重置成功');
      showForgotPasswordDialog.value = false;
    } catch (error) {
      console.error('重置密码失败:', error);
      ElMessage.error('重置密码失败，请稍后重试');
    }
  };
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img
        class="image"
        src="../assets/logo.svg"
      />
      <span class="ml-10 text">校园二手交易平台</span>
    </div>
    <div class="flex-row justify-start items-center self-start mb-20">
      <BackButton />
    </div>
    <div class="flex-col self-center section">
      <span class="self-center text_2">登录</span>
      <div class="mt-50 flex-col self-stretch">
        <span class="self-center text_3">请选择您的身份</span>
        <div class="flex-col justify-start items-center self-center">
          <el-select v-model="identity" placeholder="请选择" class="identity-select">
            <el-option
              v-for="item in identityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <el-form :model="loginForm" class="mt-10">
          <div class="flex-col self-stretch group_2">
            <span class="self-start font text_5">用户名</span>
            <div class="mt-2 flex-col justify-start items-start self-center">
              <div>
                <input 
                  class="task-input" 
                  type="text" 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名" 
                />
              </div>
            </div>
          </div>
          <div class="flex-col self-stretch group_2">
            <span class="self-start font text_8">密码</span>
            <div class="mt-2 flex-col justify-start items-start self-center">
              <div>
                <input 
                  class="task-input" 
                  type="password" 
                  v-model="loginForm.password" 
                  placeholder="请输入密码" 
                />
              </div>
            </div>
          </div>
          <div class="flex-col self-stretch group_2">
            <span class="self-start font text_10">确认密码</span>
            <div class="mt-2 flex-col justify-start items-start self-center">
              <input 
                class="task-input" 
                type="password" 
                v-model="loginForm.confirmPassword" 
                placeholder="请再次输入密码" 
              />
            </div>
          </div>
          <div class="flex-col self-stretch group_5">
            <div class="flex-col justify-start items-center self-center text-wrapper_4 login-btn" @click="handleLogin">
              <span class="text_15">登录</span>
            </div>
            <div class="form-footer">
              <span class="footer-text">没有账号？</span>
              <span class="footer-link" @click="showRegisterDialog = true">立即注册</span>
            </div>
            <span class="self-center footer-link" @click="showForgotPasswordDialog = true">忘记密码</span>
          </div>
        </el-form>
      </div>
    </div>
  </div>

  <!-- 注册类型选择弹窗 -->
  <el-dialog v-model="showRegisterDialog" title="选择注册类型" width="300px">
    <div class="register-type-container">
      <div class="register-type-item">
        <el-radio v-model="selectedRegisterType" label="user">普通用户</el-radio>
      </div>
      <div class="register-type-item">
        <el-radio v-model="selectedRegisterType" label="merchant">商家</el-radio>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn" @click="showRegisterDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="handleRegisterTypeSelect">确定</button>
      </div>
    </template>
  </el-dialog>

  <!-- 忘记密码弹窗 -->
  <el-dialog v-model="showForgotPasswordDialog" title="重置密码" width="400px">
    <div class="forgot-password-form">
      <div class="form-item">
        <span class="form-label">用户名</span>
        <input 
          v-model="forgotPasswordForm.username"
          type="text"
          class="task-input"
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-item">
        <span class="form-label">新密码</span>
        <input 
          v-model="forgotPasswordForm.newPassword"
          type="password"
          class="task-input"
          placeholder="请输入新密码"
        />
      </div>
      <div class="form-item">
        <span class="form-label">确认新密码</span>
        <input 
          v-model="forgotPasswordForm.confirmNewPassword"
          type="password"
          class="task-input"
          placeholder="请再次输入新密码"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button class="dialog-btn cancel-btn" @click="showForgotPasswordDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="handleForgotPassword">确定重置</button>
      </div>
    </template>
  </el-dialog>
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
    height: 100%;
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
  .section {
    padding: 46px 0 32px;
    background-color: #ffffff;
    border-radius: 20px;
    filter: drop-shadow(0px 0px 35px #00000026);
    overflow: hidden;
    width: 750px;
  }
  .text_2 {
    color: #000000;
    font-size: 52px;
    font-family: Inter;
    font-weight: 700;
    line-height: 48.5px;
  }
  .text_3 {
    color: #555555;
    font-size: 13px;
    font-family: Inter;
    line-height: 12px;
  }
  .font {
    font-size: 15px;
    font-family: Inter;
    line-height: 14px;
    color: #333333;
  }
  /* 身份选择器样式 */
  .identity-select {
    margin-top: 6px;
    width: 110px;
  }
  ::v-deep(.identity-select .el-select__wrapper) {
    height: 25px !important;
    border-radius: 30px !important;
    box-shadow: none !important;
    border: solid 1px #000000 !important;
  }
  ::v-deep(.identity-select .el-select__wrapper.is-hovering) {
    box-shadow: none !important;
    border-color: #cb5747 !important;
    box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3) !important;
  }
  ::v-deep(.identity-select .el-select__wrapper.is-focused) {
    box-shadow: none !important;
    border-color: #cb5747 !important;
    box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5) !important;
  }
  .group_2 {
    margin-top: 15px;
  }
  .text_5 {
    margin-left: 238px;
    line-height: 14px;
  }
  .text_8 {
    margin-left: 238px;
  }
  .text_10 {
    margin-left: 238px;
    line-height: 14px;
  }
  .group_5 {
    margin-top: 20px;
  }
  .text-wrapper_4 {
    padding: 12px 0;
    background-color: #cb5747;
    border-radius: 100px;
    width: 112px;
  }
  .text_15 {
    color: #ffffff;
    font-size: 16px;
    font-family: Inter;
    font-weight: 700;
    line-height: 15px;
  }
  .login-btn {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .login-btn:hover {
    background-color: #b04a3c;
    transform: scale(1.05);
  }

  .task-input {
    width: 275px;
    padding: 8px 10px;
    margin: 0;
    border-radius: 5px;
    border: solid 1px #999999;
    outline: none;
    background: transparent;
    font-size: 15px;
    font-family: Inter;
    line-height: 14px;
    color: #999999;
    box-sizing: border-box;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  /* 输入框占位符样式 */
  .task-input::placeholder {
    color: #999999;
    font-size: 15px;
    font-family: Inter;
    line-height: 15px;
  }
  /* 输入框悬停&聚焦效果，改成红色 */
  .task-input:hover:not(:focus) {
    border-color: #cb5747;
    box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
  }
  .task-input:focus {
    border-color: #cb5747;
    box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
    cursor: text;
  }

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
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

/* 注册类型选择弹窗样式 */
.register-type-container {
  margin-bottom: 20px;
}

.register-type-item {
  margin-bottom: 10px;
}

/* 红色radio样式 */
::v-deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #cb5747;
  background-color: #cb5747;
}

::v-deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #cb5747;
  font-weight: 500;
}

::v-deep(.el-radio__input:hover .el-radio__inner) {
  border-color: #cb5747;
}

/* 忘记密码表单样式 */
.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* 弹窗按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-btn {
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
}

.cancel-btn {
  background-color: #ffffff;
  color: #666666;
}

.cancel-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.confirm-btn {
  background-color: #cb5747;
  border-color: #cb5747;
  color: #ffffff;
}

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
}
</style>