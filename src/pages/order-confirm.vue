<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '../components/BackButton.vue';
import FormInput from '../components/FormInput.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const selectedProducts = ref([
  { id: 1, name: 'iPhone 13 Pro', price: 5999, quantity: 1, image: 'https://via.placeholder.com/80', merchant: '数码小店' },
  { id: 2, name: 'AirPods Pro', price: 1299, quantity: 2, image: 'https://via.placeholder.com/80', merchant: '数码小店' }
]);

const addresses = ref([
  { id: 1, name: '张三', phone: '13800138000', address: '北京市朝阳区某某街道某某小区1号楼101室', isDefault: true },
  { id: 2, name: '李四', phone: '13900139000', address: '北京市海淀区某某路某某号', isDefault: false }
]);

const selectedAddress = ref(1);
const showAddressDialog = ref(false);

const newAddress = reactive({
  name: '',
  phone: '',
  address: ''
});

const userPoints = ref(1500);
const usePoints = ref(0);
const pointsToMoney = 100;

const productTotal = computed(() => {
  return selectedProducts.value.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0).toFixed(2);
});

const pointsDiscount = computed(() => {
  return (usePoints.value / pointsToMoney).toFixed(2);
});

const totalAmount = computed(() => {
  const amount = parseFloat(productTotal.value) - parseFloat(pointsDiscount.value);
  return Math.max(0, amount).toFixed(2);
});

const selectAddress = (addressId) => {
  selectedAddress.value = addressId;
};

const addNewAddress = () => {
  if (!newAddress.name) {
    ElMessage.error('请输入收货人姓名');
    return;
  }
  if (!newAddress.phone) {
    ElMessage.error('请输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(newAddress.phone)) {
    ElMessage.error('手机号格式不正确');
    return;
  }
  if (!newAddress.address) {
    ElMessage.error('请输入详细地址');
    return;
  }
  
  addresses.value.push({
    id: Date.now(),
    ...newAddress,
    isDefault: false
  });
  
  newAddress.name = '';
  newAddress.phone = '';
  newAddress.address = '';
  showAddressDialog.value = false;
  ElMessage.success('地址添加成功');
};

const submitOrder = () => {
  const address = addresses.value.find(a => a.id === selectedAddress.value);
  if (!address) {
    ElMessage.error('请选择收货地址');
    return;
  }
  
  ElMessage.success('订单提交成功，跳转到支付页面');
  setTimeout(() => {
    router.push('/orders');
  }, 1500);
};
</script>

<template>
  <div class="flex-col page">
    <div class="flex-row items-center self-stretch group">
      <img class="image" src="../assets/logo.svg" />
      <span class="ml-10 text">校园二手交易平台</span>
    </div>
    <div class="flex-row justify-start items-center self-start mb-20">
      <BackButton />
    </div>
    
    <div class="order-container">
      <div class="section">
        <h3 class="section-title">收货地址</h3>
        <div class="address-list">
          <div 
            v-for="address in addresses" 
            :key="address.id"
            class="address-item"
            :class="{ selected: selectedAddress === address.id }"
            @click="selectAddress(address.id)"
          >
            <div class="address-radio">
              <input type="radio" :checked="selectedAddress === address.id" />
            </div>
            <div class="address-content">
              <div class="address-header">
                <span class="address-name">{{ address.name }}</span>
                <span class="address-phone">{{ address.phone }}</span>
                <span v-if="address.isDefault" class="default-tag">默认</span>
              </div>
              <div class="address-detail">{{ address.address }}</div>
            </div>
          </div>
        </div>
        <button class="add-address-btn" @click="showAddressDialog = true">+ 新增收货地址</button>
      </div>
      
      <div class="section">
        <h3 class="section-title">商品清单</h3>
        <div class="product-list">
          <div v-for="product in selectedProducts" :key="product.id" class="product-item">
            <img :src="product.image" class="product-image" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-merchant">商家: {{ product.merchant }}</div>
            </div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
            <div class="product-subtotal">¥{{ (product.price * product.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">积分抵扣</h3>
        <div class="points-section">
          <div class="points-info">
            <span class="points-label">可用积分:</span>
            <span class="points-value">{{ userPoints }} 积分</span>
          </div>
          <div class="points-info">
            <span class="points-label">抵扣规则:</span>
            <span class="points-value">{{ pointsToMoney }} 积分 = 1 元</span>
          </div>
          <div class="points-input-wrapper">
            <span class="points-label">使用积分:</span>
            <input 
              v-model.number="usePoints"
              type="number"
              class="points-input"
              :max="userPoints"
              min="0"
              placeholder="请输入使用积分"
            />
            <span class="points-discount">可抵扣 ¥{{ pointsDiscount }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">金额明细</h3>
        <div class="amount-list">
          <div class="amount-item">
            <span class="amount-label">商品总额</span>
            <span class="amount-value">¥{{ productTotal }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">积分抵扣</span>
            <span class="amount-value discount">-¥{{ pointsDiscount }}</span>
          </div>
          <div class="amount-item total">
            <span class="amount-label">实付金额</span>
            <span class="amount-value">¥{{ totalAmount }}</span>
          </div>
        </div>
      </div>
      
      <div class="submit-section">
        <button class="submit-btn" @click="submitOrder">提交订单</button>
      </div>
    </div>
    
    <el-dialog v-model="showAddressDialog" title="新增收货地址" width="500px">
      <div class="dialog-form">
        <FormInput 
          v-model="newAddress.name"
          label="收货人姓名"
          placeholder="请输入收货人姓名"
          required
        />
        <FormInput 
          v-model="newAddress.phone"
          label="手机号"
          placeholder="请输入手机号"
          required
        />
        <FormInput 
          v-model="newAddress.address"
          label="详细地址"
          placeholder="请输入详细地址"
          required
        />
      </div>
      <template #footer>
        <button class="dialog-btn cancel-btn" @click="showAddressDialog = false">取消</button>
        <button class="dialog-btn confirm-btn" @click="addNewAddress">确定</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
.mb-20 {
  margin-bottom: 20px;
}

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
  line-height: 21.5px;
}

.order-container {
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  padding: 30px;
}

.section {
  margin-bottom: 30px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #cb5747;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.address-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  border-color: #cb5747;
}

.address-item.selected {
  border-color: #cb5747;
  background-color: rgba(203, 87, 71, 0.05);
}

.address-radio input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #cb5747;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.address-phone {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.default-tag {
  padding: 2px 8px;
  background-color: #cb5747;
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
}

.address-detail {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  line-height: 1.5;
}

.add-address-btn {
  width: 100%;
  padding: 12px;
  background-color: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  color: #666666;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-address-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
  background-color: rgba(203, 87, 71, 0.02);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  color: #333333;
}

.product-merchant {
  font-size: 13px;
  font-family: Inter;
  color: #999999;
}

.product-price {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #cb5747;
}

.product-quantity {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.product-subtotal {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
  min-width: 100px;
  text-align: right;
}

.points-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.points-label {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  min-width: 80px;
}

.points-value {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.points-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.points-input {
  width: 150px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  outline: none;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  transition: all 0.3s ease;
}

.points-input:hover:not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.points-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.points-discount {
  font-size: 14px;
  font-family: Inter;
  color: #cb5747;
}

.amount-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.amount-item.total {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.amount-label {
  font-size: 15px;
  font-family: Inter;
  color: #666666;
}

.amount-item.total .amount-label {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.amount-value {
  font-size: 16px;
  font-family: Inter;
  color: #333333;
}

.amount-value.discount {
  color: #4caf50;
}

.amount-item.total .amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #cb5747;
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  padding: 14px 80px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 18px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-btn {
  padding: 10px 32px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.cancel-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.confirm-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}

.confirm-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
}
</style>
