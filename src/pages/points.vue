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

const points = ref(0);
const transactions = ref([]);

const fetchPointsTotal = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    const response = await axios.get('/points/total', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      points.value = response.totalPoints;
    } else {
      ElMessage.error(response?.message || '获取积分失败');
    }
  } catch (error) {
    console.error('获取积分失败:', error);
    ElMessage.error('获取积分失败，请稍后重试');
  }
};

const fetchPointsRecords = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    return;
  }
  
  try {
    const response = await axios.get('/points/records', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200 && response.data) {
      transactions.value = response.data.map(item => ({
        id: item.id,
        type: item.type,
        amount: item.points,
        time: item.createTime,
        desc: item.remark
      }));
    } else {
      ElMessage.error(response?.message || '获取交易记录失败');
    }
  } catch (error) {
    console.error('获取交易记录失败:', error);
    ElMessage.error('获取交易记录失败，请稍后重试');
  }
};

onMounted(() => {
  fetchPointsTotal();
  fetchPointsRecords();
});

const rules = [
  { title: '获取规则', items: ['购物满1元获得1积分', '评价商品获得10-50积分', '每日签到获得10积分', '邀请好友获得100积分'] },
  { title: '抵扣规则', items: ['100积分可抵扣1元', '单笔订单最多抵扣50%', '积分抵扣不可与其他优惠同享', '积分有效期1年'] }
];

const getTypeText = (type) => {
  const typeMap = {
    'earn': '获取',
    'deduct': '使用',
    'expire': '过期'
  };
  return typeMap[type] || '其他';
};

const getTypeClass = (type) => {
  const classMap = {
    'earn': 'type-earn',
    'deduct': 'type-use',
    'expire': 'type-expire'
  };
  return classMap[type] || '';
};
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
    
    <div class="points-container">
      <div class="points-section">
        <div class="points-label">当前积分</div>
        <div class="points-amount">{{ points }}</div>
        <div class="points-tip">100积分 = 1元</div>
      </div>
      
      <div class="rules-section">
        <div v-for="rule in rules" :key="rule.title" class="rule-item">
          <h3 class="rule-title">{{ rule.title }}</h3>
          <ul class="rule-list">
            <li v-for="(item, index) in rule.items" :key="index" class="rule-text">{{ item }}</li>
          </ul>
        </div>
      </div>
      
      <div class="transactions-section">
        <h3 class="section-title">积分流水</h3>
        <div class="transaction-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-desc">{{ transaction.desc }}</div>
              <div class="transaction-time">{{ transaction.time }}</div>
            </div>
            <div class="transaction-right">
              <div class="transaction-amount" :class="getTypeClass(transaction.type)">
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
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

.points-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.points-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 16px;
  margin-bottom: 30px;
}

.points-label {
  font-size: 16px;
  font-family: Inter;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.points-amount {
  font-size: 56px;
  font-family: Inter;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.points-tip {
  font-size: 14px;
  font-family: Inter;
  color: rgba(255, 255, 255, 0.8);
}

.rules-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.rule-item {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
}

.rule-title {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #cb5747;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
}

.rule-text {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1.8;
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

.transaction-amount.type-earn {
  color: #4caf50;
}

.transaction-amount.type-use {
  color: #f44336;
}

.transaction-amount.type-expire {
  color: #999999;
}

.transaction-balance {
  font-size: 12px;
  font-family: Inter;
  color: #999999;
}
</style>
