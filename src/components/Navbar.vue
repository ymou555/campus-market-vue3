<script setup>
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useUserStore } from '../store/user';
  import { ElMessage } from 'element-plus';
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  
  const searchKeyword = ref('');
  
  const goToLogin = () => {
    router.push('/login');
  };
  
  const goToProfile = () => {
    router.push('/profile');
  };
  
  const goToCart = () => {
    router.push('/cart');
  };
  
  const logout = () => {
    userStore.logout();
    window.dispatchEvent(new CustomEvent('user-logout'));
    ElMessage.success('退出成功');
    router.push('/login');
  };
  
  const goToSearch = () => {
    sessionStorage.setItem('searchKeyword', searchKeyword.value);
    
    if (route.path === '/search') {
      window.dispatchEvent(new CustomEvent('search-triggered'));
    } else {
      router.push('/search');
    }
  };
  
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
      <input 
        type="text" 
        v-model="searchKeyword"
        placeholder="请输入信息..." 
        class="font text_3 search-input" 
        @keyup.enter="goToSearch"
      />
      <div class="flex-col justify-start items-center shrink-0 text-wrapper_2 ml-304 search-btn" @click="goToSearch">
        <span class="font text_4">搜索</span>
      </div>
    </div>
    <!-- 登录状态显示 -->
    <div v-if="userStore.isLoggedIn" class="flex-row items-center pos_2">
      <div class="cart-icon" @click="goToCart">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
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
  
  .cart-icon {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #ffffff;
    margin-right: 10px;
    transition: all 0.3s ease;
  }
  
  .cart-icon:hover {
    transform: scale(1.1);
    color: #ffcccc;
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