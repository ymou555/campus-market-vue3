<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
});

const statusColors = {
  default: { bg: '#f0f0f0', color: '#666666' },
  success: { bg: '#e8f5e9', color: '#2e7d32' },
  warning: { bg: '#fff3e0', color: '#f57c00' },
  danger: { bg: '#ffebee', color: '#c62828' },
  info: { bg: '#e3f2fd', color: '#1565c0' }
};
</script>

<template>
  <span 
    class="status-tag"
    :style="{
      backgroundColor: statusColors[status].bg,
      color: statusColors[status].color
    }"
  >
    {{ text }}
  </span>
</template>

<style scoped lang="css">
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-family: Inter;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}
</style>
