<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const levels = ref([
  { name: '金牌商家', rate: 0.05, minSales: 100000, description: '销售额达到10万，享受5%平台费率' },
  { name: '银牌商家', rate: 0.08, minSales: 50000, description: '销售额达到5万，享受8%平台费率' },
  { name: '铜牌商家', rate: 0.10, minSales: 20000, description: '销售额达到2万，享受10%平台费率' },
  { name: '普通商家', rate: 0.12, minSales: 0, description: '新入驻商家，平台费率12%' }
]);

const showEditDialog = ref(false);
const currentLevel = ref(null);
const editRate = ref('');

const editLevel = (level) => {
  currentLevel.value = level;
  editRate.value = (level.rate * 100).toString();
  showEditDialog.value = true;
};

const saveLevel = () => {
  if (!editRate.value || isNaN(editRate.value)) {
    ElMessage.error('请输入有效的费率');
    return;
  }
  currentLevel.value.rate = parseFloat(editRate.value) / 100;
  showEditDialog.value = false;
  ElMessage.success('等级配置更新成功');
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台 - 商家等级管理</span>
    </div>
    
    <div class="levels-container">
      <h2 class="page-title">商家等级配置</h2>
      
      <div class="levels-list">
        <div v-for="level in levels" :key="level.name" class="level-item">
          <div class="level-header">
            <span class="level-name">{{ level.name }}</span>
            <span class="level-rate">平台费率: {{ (level.rate * 100).toFixed(0) }}%</span>
          </div>
          <div class="level-info">
            <div class="info-item">
              <span class="info-label">升级条件</span>
              <span class="info-value">销售额 ≥ ¥{{ level.minSales.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">等级说明</span>
              <span class="info-value">{{ level.description }}</span>
            </div>
          </div>
          <button class="edit-btn" @click="editLevel(level)">编辑费率</button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showEditDialog" title="编辑费率" width="400px">
      <div v-if="currentLevel" class="edit-content">
        <div class="edit-info">
          <span class="edit-label">等级名称:</span>
          <span class="edit-value">{{ currentLevel.name }}</span>
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
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}
</style>
