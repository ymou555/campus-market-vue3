<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

const cartItems = ref([
  {
    merchantId: 1,
    merchantName: '数码小店',
    merchantAvatar: 'https://via.placeholder.com/40',
    products: [
      { id: 1, name: 'iPhone 13 Pro', price: 5999, quantity: 1, image: 'https://via.placeholder.com/100', selected: false },
      { id: 2, name: 'AirPods Pro', price: 1299, quantity: 2, image: 'https://via.placeholder.com/100', selected: false }
    ]
  },
  {
    merchantId: 2,
    merchantName: '运动装备',
    merchantAvatar: 'https://via.placeholder.com/40',
    products: [
      { id: 3, name: '运动跑鞋', price: 199, quantity: 1, image: 'https://via.placeholder.com/100', selected: false }
    ]
  }
]);

const isAllSelected = computed(() => {
  return cartItems.value.every(merchant => 
    merchant.products.every(product => product.selected)
  );
});

const totalPrice = computed(() => {
  let total = 0;
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      if (product.selected) {
        total += product.price * product.quantity;
      }
    });
  });
  return total.toFixed(2);
});

const selectedCount = computed(() => {
  let count = 0;
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      if (product.selected) {
        count += product.quantity;
      }
    });
  });
  return count;
});

const toggleSelectAll = () => {
  const newState = !isAllSelected.value;
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      product.selected = newState;
    });
  });
};

const toggleMerchantSelect = (merchantId) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  if (merchant) {
    const allSelected = merchant.products.every(p => p.selected);
    merchant.products.forEach(product => {
      product.selected = !allSelected;
    });
  }
};

const isMerchantSelected = (merchantId) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  return merchant && merchant.products.every(p => p.selected);
};

const updateQuantity = (merchantId, productId, delta) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  if (merchant) {
    const product = merchant.products.find(p => p.id === productId);
    if (product) {
      const newQuantity = product.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= 99) {
        product.quantity = newQuantity;
      }
    }
  }
};

const removeProduct = (merchantId, productId) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const merchant = cartItems.value.find(m => m.merchantId === merchantId);
    if (merchant) {
      const index = merchant.products.findIndex(p => p.id === productId);
      if (index > -1) {
        merchant.products.splice(index, 1);
        if (merchant.products.length === 0) {
          const merchantIndex = cartItems.value.findIndex(m => m.merchantId === merchantId);
          cartItems.value.splice(merchantIndex, 1);
        }
        ElMessage.success('删除成功');
      }
    }
  }).catch(() => {});
};

const removeSelected = () => {
  const selectedProducts = [];
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      if (product.selected) {
        selectedProducts.push(product.name);
      }
    });
  });
  
  if (selectedProducts.length === 0) {
    ElMessage.warning('请选择要删除的商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedProducts.length} 件商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value.forEach(merchant => {
      merchant.products = merchant.products.filter(p => !p.selected);
    });
    cartItems.value = cartItems.value.filter(m => m.products.length > 0);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const goToCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }
  router.push('/order-confirm');
};
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <div class="cart-container">
      <div class="cart-header">
        <div class="select-all">
          <input 
            type="checkbox" 
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="checkbox"
          />
          <span class="select-text">全选</span>
        </div>
        <button class="delete-selected-btn" @click="removeSelected">删除选中</button>
      </div>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <div class="empty-text">购物车是空的</div>
        <button class="go-shopping-btn" @click="router.push('/')">去购物</button>
      </div>
      
      <div v-else class="cart-list">
        <div v-for="merchant in cartItems" :key="merchant.merchantId" class="merchant-section">
          <div class="merchant-header">
            <input 
              type="checkbox"
              :checked="isMerchantSelected(merchant.merchantId)"
              @change="toggleMerchantSelect(merchant.merchantId)"
              class="checkbox"
            />
            <img :src="merchant.merchantAvatar" class="merchant-avatar" />
            <span class="merchant-name">{{ merchant.merchantName }}</span>
          </div>
          
          <div class="product-list">
            <div v-for="product in merchant.products" :key="product.id" class="product-item">
              <input 
                type="checkbox"
                v-model="product.selected"
                class="checkbox"
              />
              <img :src="product.image" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
              <div class="quantity-control">
                <button class="quantity-btn" @click="updateQuantity(merchant.merchantId, product.id, -1)">-</button>
                <input type="number" v-model="product.quantity" class="quantity-input" min="1" max="99" />
                <button class="quantity-btn" @click="updateQuantity(merchant.merchantId, product.id, 1)">+</button>
              </div>
              <div class="product-subtotal">
                小计: ¥{{ (product.price * product.quantity).toFixed(2) }}
              </div>
              <button class="remove-btn" @click="removeProduct(merchant.merchantId, product.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cart-footer">
        <div class="footer-left">
          <div class="select-all">
            <input 
              type="checkbox" 
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="checkbox"
            />
            <span class="select-text">全选</span>
          </div>
        </div>
        <div class="footer-right">
          <div class="total-info">
            <span class="selected-count">已选 {{ selectedCount }} 件</span>
            <span class="total-label">合计:</span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
          <button class="checkout-btn" @click="goToCheckout">去结算</button>
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

.cart-container {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
  overflow: hidden;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #cb5747;
}

.select-text {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.delete-selected-btn {
  padding: 6px 16px;
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #666666;
  font-size: 13px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-selected-btn:hover {
  border-color: #f44336;
  color: #f44336;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #999999;
  font-family: Inter;
  margin-bottom: 20px;
}

.go-shopping-btn {
  padding: 10px 32px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.go-shopping-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}

.cart-list {
  padding: 0 24px;
}

.merchant-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.merchant-section:last-child {
  border-bottom: none;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.merchant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
}

.merchant-name {
  font-size: 15px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
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
  padding: 12px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.product-item:hover {
  background-color: #f5f5f5;
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
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  line-height: 1.4;
}

.product-price {
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  color: #cb5747;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #f5f5f5;
  color: #333333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #cb5747;
  color: #ffffff;
}

.quantity-input {
  width: 50px;
  height: 32px;
  border: none;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  outline: none;
}

.product-subtotal {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  padding: 6px 16px;
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  color: #999999;
  font-size: 12px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  border-color: #f44336;
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.total-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
}

.total-price {
  font-size: 24px;
  font-family: Inter;
  font-weight: 700;
  color: #cb5747;
}

.checkout-btn {
  padding: 12px 40px;
  background-color: #cb5747;
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-size: 16px;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background-color: #b04a3c;
  transform: scale(1.05);
}
</style>
