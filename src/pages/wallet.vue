<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const balance = ref(0);
const lastUpdateTime = ref('');
const transactions = ref([]);

const fetchWalletInfo = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.get('/wallet/info', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200 && response.wallet) {
      balance.value = response.wallet.balance;
      lastUpdateTime.value = response.wallet.lastUpdateTime;
    } else {
      ElMessage.error(response?.message || '获取钱包信息失败');
    }
  } catch (error) {
    console.error('获取钱包信息失败:', error);
    ElMessage.error('获取钱包信息失败，请稍后重试');
  }
};

const fetchTransactions = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    return;
  }
  
  try {
    const response = await axios.get('/wallet/transactions', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      transactions.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取交易记录失败');
    }
  } catch (error) {
    console.error('获取交易记录失败:', error);
    ElMessage.error('获取交易记录失败，请稍后重试');
  }
};

const getTypeText = (type) => {
  const typeMap = {
    'deposit': '充值',
    'payment': '支付',
    'refund': '退款'
  };
  return typeMap[type] || '其他';
};

const getTypeClass = (type) => {
  const classMap = {
    'deposit': 'type-recharge',
    'payment': 'type-consume',
    'refund': 'type-refund'
  };
  return classMap[type] || '';
};

onMounted(() => {
  fetchWalletInfo();
  fetchTransactions();
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
    
    <div class="wallet-container">
      <div class="balance-section">
        <div class="balance-label">账户余额</div>
        <div class="balance-amount">¥{{ balance.toFixed(2) }}</div>
      </div>
      
      <div class="transactions-section">
        <h3 class="section-title">交易流水</h3>
        <div class="transaction-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-desc">{{ transaction.remark }}</div>
              <div class="transaction-time">{{ transaction.transactionTime }}</div>
            </div>
            <div class="transaction-right">
              <div class="transaction-amount" :class="getTypeClass(transaction.type)">
                {{ (transaction.type === 'deposit' || transaction.type === 'refund') ? '+' : (transaction.type === 'payment' ? '-' : '') }}{{ transaction.amount.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.page {
  padding: 15px 30px 65px;
  background-color: #cb5647;
  background-image: radial-gradient(circle, #a03a30 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100%;
}

.wallet-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.balance-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #cb5747 0%, #a03a30 100%);
  border-radius: 16px;
  margin-bottom: 30px;
}

.balance-label {
  font-size: 16px;
  font-family: Inter;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.balance-amount {
  font-size: 48px;
  font-family: Inter;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  background-color: #f5f5f5;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-size: 15px;
  font-family: Inter;
  color: #333333;
  margin-bottom: 8px;
}

.transaction-time {
  font-size: 13px;
  font-family: Inter;
  color: #999999;
}

.transaction-right {
  text-align: right;
}

.transaction-amount {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  margin-bottom: 4px;
}

.transaction-amount.type-recharge {
  color: #4caf50;
}

.transaction-amount.type-consume {
  color: #f44336;
}

.transaction-amount.type-refund {
  color: #2196f3;
}
</style>
