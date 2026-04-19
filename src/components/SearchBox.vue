<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search', 'update:modelValue']);

const searchValue = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  searchValue.value = newVal;
});

watch(searchValue, (newVal) => {
  emit('update:modelValue', newVal);
});

const handleSearch = () => {
  emit('search', searchValue.value);
};

const handleClear = () => {
  searchValue.value = '';
  emit('search', '');
};
</script>

<template>
  <div class="search-box">
    <input 
      v-model="searchValue"
      type="text"
      class="search-input"
      placeholder="搜索商品..."
      @keyup.enter="handleSearch"
    />
    <button class="search-btn" @click="handleSearch">
      <span>搜索</span>
    </button>
    <button v-if="searchValue" class="clear-btn" @click="handleClear">
      <span>清空</span>
    </button>
  </div>
</template>

<style scoped lang="css">
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 100px;
  border: solid 1px #999999;
  outline: none;
  background: #ffffff;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #999999;
}

.search-input:hover:not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.search-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.search-btn {
  padding: 10px 24px;
  background-color: #cb5747;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.clear-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.clear-btn:hover {
  background-color: #e0e0e0;
  border-color: #999999;
}
</style>
