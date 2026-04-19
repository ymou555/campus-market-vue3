<script setup>
import { ref, onMounted } from 'vue';
import BackButton from '../../components/BackButton.vue';
import { ElMessage } from 'element-plus';
import axios from '../../utils/axios';

const levels = ref([]);

const levelMap = {
  1: '钻石商家',
  2: '金牌商家',
  3: '高级商家',
  4: '中级商家',
  5: '初级商家'
};

const colorMap = {
  1: '#00bcd4',
  2: '#ffd700',
  3: '#ff9800',
  4: '#666666',
  5: '#999999'
};

const fetchLevels = async () => {
  try {
    const response = await axios.get('/merchant/level/list');
    if (response && response.code === 200) {
      levels.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取等级列表失败');
    }
  } catch (error) {
    console.error('获取等级列表失败:', error);
    ElMessage.error('获取等级列表失败，请稍后重试');
  }
};

const getDescription = (level) => {
  const ratePercent = (level.rate * 100).toFixed(2);
  if (level.minAmount === 0) {
    return `新入驻商家，平台费率${ratePercent}%`;
  }
  const minAmountStr = level.minAmount >= 10000 
    ? `${(level.minAmount / 10000).toFixed(0)}万` 
    : level.minAmount.toLocaleString();
  return `销售额达到${minAmountStr}，享受${ratePercent}%平台费率`;
};

const showEditDialog = ref(false);
const currentLevel = ref(null);
const editRate = ref('');
const editMinSales = ref('');

const editLevel = (level) => {
  currentLevel.value = level;
  editRate.value = (level.rate * 100).toString();
  editMinSales.value = level.minAmount.toString();
  showEditDialog.value = true;
};

const saveLevel = async () => {
  if (!editRate.value || isNaN(editRate.value)) {
    ElMessage.error('请输入有效的费率');
    return;
  }
  if (editMinSales.value === '' || isNaN(editMinSales.value)) {
    ElMessage.error('请输入有效的销售额');
    return;
  }
  
  try {
    const response = await axios.put('/merchant/level/update', {
      id: currentLevel.value.id,
      levelName: currentLevel.value.levelName,
      rate: parseFloat(editRate.value) / 100,
      minAmount: parseFloat(editMinSales.value)
    });
    
    if (response && response.code === 200) {
      currentLevel.value.rate = parseFloat(editRate.value) / 100;
      currentLevel.value.minAmount = parseFloat(editMinSales.value);
      showEditDialog.value = false;
      ElMessage.success('等级配置更新成功');
    } else {
      ElMessage.error(response?.message || '更新失败');
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败，请稍后重试');
  }
};

onMounted(() => {
  fetchLevels();
});
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商家等级管理</span>
    </div>
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="levels-container">
      <h2 class="page-title">商家等级配置</h2>
      
      <div class="levels-list">
        <div v-for="level in levels" :key="level.id" class="level-item">
          <div class="level-header">
            <div class="level-name-wrapper">
              <span class="level-name">{{ level.levelName }}</span>
              <span 
                class="level-badge" 
                :style="{ backgroundColor: colorMap[level.id] || '#999999' }"
              >
                {{ levelMap[level.id] || '未知等级' }}
              </span>
            </div>
            <span class="level-rate">平台费率: {{ (level.rate * 100).toFixed(2) }}%</span>
          </div>
          <div class="level-info">
            <div class="info-item">
              <span class="info-label">升级条件</span>
              <span class="info-value">销售额 ≥ ¥{{ level.minAmount.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">等级说明</span>
              <span class="info-value">{{ getDescription(level) }}</span>
            </div>
          </div>
          <button class="edit-btn" @click="editLevel(level)">编辑</button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showEditDialog" title="编辑等级配置" width="400px">
      <div v-if="currentLevel" class="edit-content">
        <div class="edit-info">
          <span class="edit-label">等级名称:</span>
          <span class="edit-value">{{ currentLevel.levelName }}</span>
        </div>
        <div class="form-item">
          <span class="form-label">平台费率 (%)</span>
          <input 
            v-model="editRate"
            type="number"
            class="form-input"
            placeholder="请输入费率"
          />
        </div>
        <div class="form-item">
          <span class="form-label">升级所需最低销售额 (元)</span>
          <input 
            v-model="editMinSales"
            type="number"
            class="form-input"
            placeholder="请输入销售额"
          />
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showEditDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="saveLevel">保存</button>
      </template>
    </el-dialog>
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
}

.levels-container {
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

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.level-item {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  border-left: 4px solid #cb5747;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.level-name {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.level-name-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-badge {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-family: Inter;
  font-weight: 500;
  color: #ffffff;
}

.level-rate {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #cb5747;
}

.level-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.info-label {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.edit-btn {
  padding: 8px 20px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #b04a3c;
}

.edit-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-info {
  display: flex;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
}
</style>
