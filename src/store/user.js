import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    isLoggedIn: !!localStorage.getItem('token')
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
      this.isLoggedIn = true;
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('historySearches');
      sessionStorage.removeItem('searchKeyword');
    }
  }
});