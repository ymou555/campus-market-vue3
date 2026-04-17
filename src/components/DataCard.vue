<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: 0
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="data-card">
    <div class="card-header">
      <span v-if="icon" class="card-icon">{{ icon }}</span>
      <span class="card-title">{{ title }}</span>
    </div>
    <div class="card-value">
      <span class="value-number">{{ value }}</span>
      <span v-if="unit" class="value-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped lang="css">
.data-card {
  padding: 20px 24px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.data-card:hover {
  border-color: #cb5747;
  box-shadow: 0px 4px 12px rgba(203, 87, 71, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-number {
  font-size: 32px;
  font-family: Inter;
  font-weight: 700;
  color: #cb5747;
  line-height: 1;
}

.value-unit {
  font-size: 14px;
  font-family: Inter;
  color: #999999;
  line-height: 1;
}
</style>
