<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const balance = ref(1250.50);
const transactions = ref([
  { id: 1, type: 'recharge', amount: 500, balance: 1250.50, time: '2024-01-15 10:30:00', desc: '账户充值' },
  { id: 2, type: 'consume', amount: -199, balance: 750.50, time: '2024-01-14 15:20:00', desc: '购买商品-运动跑鞋' },
  { id: 3, type: 'refund', amount: 89, balance: 949.50, time: '2024-01-13 09:15:00', desc: '订单退款-编程书籍' },
  { id: 4, type: 'consume', amount: -299, balance: 860.50, time: '2024-01-12 14:30:00', desc: '购买商品-机械键盘' },
  { id: 5, type: 'recharge', amount: 300, balance: 1159.50, time: '2024-01-11 11:00:00', desc: '账户充值' }
]);

const getTypeText = (type) => {
  const typeMap = {
    'recharge': '充值',
    'consume': '消费',
    'refund': '退款'
  };
  return typeMap[type] || '其他';
};

const getTypeClass = (type) => {
  const classMap = {
    'recharge': 'type-recharge',
    'consume': 'type-consume',
    'refund': 'type-refund'
  };
  return classMap[type] || '';
};

const handleRecharge = () => {
  ElMessage.info('充值功能仅管理员可见');
};
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <div class="wallet-container">
      <div class="balance-section">
        <div class="balance-label">账户余额</div>
        <div class="balance-amount">¥{{ balance.toFixed(2) }}</div>
        <button class="recharge-btn" @click="handleRecharge">充值</button>
      </div>
      
      <div class="transactions-section">
        <h3 class="section-title">交易流水</h3>
        <div class="transaction-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-desc">{{ transaction.desc }}</div>
              <div class="transaction-time">{{ transaction.time }}</div>
            </div>
            <div class="transaction-right">
              <div class="transaction-amount" :class="getTypeClass(transaction.type)">
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount.toFixed(2) }}
              </div>
              <div class="transaction-balance">余额: ¥{{ transaction.balance.toFixed(2) }}</div>
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

.recharge-btn {
  padding: 12px 48px;
  background-color: #ffffff;
  border: none;
  border-radius: 100px;
  color: #cb5747;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recharge-btn:hover {
  transform: scale(1.05);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
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

.transaction-balance {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}
</style>
