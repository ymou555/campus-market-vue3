<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  placeholder: {
    type: String,
    default: '点击上传图片'
  },
  preview: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'upload']);

const fileInput = ref(null);
const previewUrl = ref(props.modelValue || '');

const handleClick = () => {
  fileInput.value?.click();
};

const handleChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result;
      emit('update:modelValue', e.target?.result);
      emit('upload', file);
    };
    reader.readAsDataURL(file);
  }
};

const handleRemove = () => {
  previewUrl.value = '';
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<template>
  <div class="upload-wrapper">
    <input 
      ref="fileInput"
      type="file"
      :accept="accept"
      class="file-input"
      @change="handleChange"
    />
    
    <div v-if="!previewUrl" class="upload-area" @click="handleClick">
      <div class="upload-icon">+</div>
      <div class="upload-text">{{ placeholder }}</div>
    </div>
    
    <div v-else class="preview-area">
      <img :src="previewUrl" class="preview-image" />
      <div class="preview-actions">
        <button class="action-btn" @click="handleClick">更换</button>
        <button class="action-btn remove-btn" @click="handleRemove">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.upload-wrapper {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-area {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #cb5747;
  background-color: rgba(203, 87, 71, 0.02);
}

.upload-icon {
  font-size: 48px;
  color: #999999;
  line-height: 1;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #666666;
  font-family: Inter;
}

.preview-area {
  position: relative;
  width: 100%;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.preview-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333333;
}

.action-btn:hover {
  background-color: #cb5747;
  color: #ffffff;
}

.remove-btn:hover {
  background-color: #f44336;
}
</style>
