<script setup>
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../store/user';
  const router = useRouter();
  const userStore = useUserStore();
  
  const goToLogin = () => {
    router.push('/login');
  };
  
  const goToProfile = () => {
    // 跳转到个人资料页面
    router.push('/profile');
  };
  
  const logout = () => {
    userStore.logout();
    router.push('/login');
  };
  
  const goToSearch = () => {
    // 跳转到商品搜索页
    router.push('/search');
  };
  
  // 生成用户头像文本（取用户名前两个字母）
  const getUserAvatarText = () => {
    if (!userStore.userInfo || !userStore.userInfo.username) {
      return '?';
    }
    const username = userStore.userInfo.username;
    return username.substring(0, 2).toUpperCase();
  };
</script>

<template>
  <div class="flex-row justify-center items-center relative">
    <div class="flex-row items-center pos">
      <img
        class="shrink-0 image"
        src="../assets/logo.svg"
      />
      <span class="ml-10 text">校园二手交易平台</span>
    </div>
    <div class="flex-row items-center section">
      <input type="text" placeholder="请输入信息..." class="font text_3 search-input" />
      <div class="flex-col justify-start items-center shrink-0 text-wrapper_2 ml-304 search-btn" @click="goToSearch">
        <span class="font text_4">搜索</span>
      </div>
    </div>
    <!-- 登录状态显示 -->
    <div v-if="userStore.isLoggedIn" class="flex-row items-center pos_2">
      <div class="flex-col justify-center items-center user-avatar" @click="goToProfile">
        <span class="avatar-text">{{ getUserAvatarText() }}</span>
      </div>
      <div class="flex-col justify-center items-center logout-btn ml-10" @click="logout">
        <span class="text_2">退出</span>
      </div>
    </div>
    <!-- 未登录状态显示 -->
    <div v-else class="flex-col justify-start items-center text-wrapper pos_2 login-btn" @click="goToLogin">
      <span class="text_2">登录</span>
    </div>
  </div>
</template>

<style scoped lang="css">
  .ml-304 {
    margin-left: 40px;
  }
  .ml-10 {
    margin-left: 10px;
  }
  .pos {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
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
    padding: 10px 10px 10px 20px;
    background-color: #ffffff;
    border-radius: 100px;
    filter: drop-shadow(0px 0px 13.5px #00000033);
    width: 500px;
    display: flex;
    align-items: center;
  }
  .font {
    font-size: 16px;
    font-family: Inter;
    line-height: 15px;
    color: #333333;
  }
  .text_3 {
    color: #999999;
    line-height: 15px;
  }
  .text-wrapper_2 {
    padding: 8px 0;
    background-color: #d03838;
    border-radius: 100px;
    width: 70px;
    height: 29px;
  }
  .text_4 {
    color: #ffffff;
    line-height: 15px;
  }
  
  .search-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    font-family: Inter;
    line-height: 15px;
    color: #999999;
    width: 360px;
  }
  
  .search-btn {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .search-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(208, 56, 56, 0.5);
  }
  .text-wrapper {
    padding: 12px 0 10px;
    border-radius: 100px;
    width: 75px;
    border-left: solid 2px #ffffff;
    border-right: solid 2px #ffffff;
    border-top: solid 2px #ffffff;
    border-bottom: solid 2px #ffffff;
  }
  .pos_2 {
    position: absolute;
    right: 0;
    top: 0;
  }
  .text_2 {
    color: #ffffff;
    font-size: 16px;
    font-family: Inter;
    font-weight: 600;
    line-height: 15px;
  }
  .login-btn {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .login-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #d03838;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .user-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(208, 56, 56, 0.5);
  }
  
  .avatar-text {
    color: #ffffff;
    font-size: 16px;
    font-family: Inter;
    font-weight: 600;
    line-height: 15px;
  }
  
  .logout-btn {
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 12px 0 10px;
    border-radius: 100px;
    width: 75px;
    border-left: solid 2px #ffffff;
    border-right: solid 2px #ffffff;
    border-top: solid 2px #ffffff;
    border-bottom: solid 2px #ffffff;
  }
  
  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
</style>