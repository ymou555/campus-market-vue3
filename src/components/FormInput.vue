<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>

<template>
  <div class="form-input-wrapper">
    <span v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </span>
    <input 
      class="form-input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
    />
  </div>
</template>

<style scoped lang="css">
.form-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input-label {
  font-size: 15px;
  font-family: Inter;
  line-height: 14px;
  color: #333333;
  margin-bottom: 8px;
}

.required-mark {
  color: #cb5747;
  margin-left: 2px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 5px;
  border: solid 1px #999999;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-family: Inter;
  line-height: 14px;
  color: #333333;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #999999;
  font-size: 15px;
  font-family: Inter;
  line-height: 15px;
}

.form-input:hover:not(:disabled):not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.form-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
