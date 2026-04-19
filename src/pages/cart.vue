<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import BackButton from '../components/BackButton.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../utils/axios';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const cartItems = ref([]);

const loading = ref(false);

const getMerchantAvatarText = (merchantName) => {
  if (!merchantName) return '?';
  return merchantName.substring(0, 2);
};

const fetchCartItems = async () => {
  if (!userStore.isLoggedIn || !userStore.userInfo || !userStore.userInfo.id) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await axios.get('/cart/list', {
      params: {
        userId: userStore.userInfo.id
      }
    });
    
    if (response && response.code === 200) {
      cartItems.value = response.data || [];
    } else {
      ElMessage.error(response?.message || '获取购物车失败');
    }
  } catch (error) {
    console.error('获取购物车失败:', error);
    ElMessage.error('获取购物车失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const isAllSelected = computed(() => {
  if (cartItems.value.length === 0) return false;
  return cartItems.value.every(merchant => 
    merchant.products.every(product => product.isSelected)
  );
});

const totalPrice = computed(() => {
  let total = 0;
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      if (product.isSelected) {
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
      if (product.isSelected) {
        count += product.quantity;
      }
    });
  });
  return count;
});

const toggleSelectAll = async () => {
  if (!userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  const newState = !isAllSelected.value;
  
  try {
    const response = await axios.put('/cart/batch-update-selected', null, {
      params: {
        userId: userStore.userInfo.id,
        isSelected: newState
      }
    });
    
    if (response && response.code === 200) {
      cartItems.value.forEach(merchant => {
        merchant.products.forEach(product => {
          product.isSelected = newState;
        });
      });
    } else {
      ElMessage.error(response?.message || '更新选中状态失败');
    }
  } catch (error) {
    console.error('更新选中状态失败:', error);
    ElMessage.error('更新选中状态失败，请稍后重试');
  }
};

const toggleMerchantSelect = async (merchantId) => {
  if (!userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  if (merchant) {
    const allSelected = merchant.products.every(p => p.isSelected);
    const newState = !allSelected;
    
    try {
      const response = await axios.put('/cart/batch-update-selected-by-merchant', null, {
        params: {
          userId: userStore.userInfo.id,
          merchantId: merchantId,
          isSelected: newState
        }
      });
      
      if (response && response.code === 200) {
        merchant.products.forEach(product => {
          product.isSelected = newState;
        });
      } else {
        ElMessage.error(response?.message || '更新选中状态失败');
      }
    } catch (error) {
      console.error('更新选中状态失败:', error);
      ElMessage.error('更新选中状态失败，请稍后重试');
    }
  }
};

const isMerchantSelected = (merchantId) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  return merchant && merchant.products.every(p => p.isSelected);
};

const updateQuantity = async (merchantId, productId, delta) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  if (merchant) {
    const product = merchant.products.find(p => p.productId === productId);
    if (product) {
      const newQuantity = product.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= product.stock) {
        try {
          const response = await axios.put('/cart/update-quantity', null, {
            params: {
              cartId: product.cartId,
              quantity: newQuantity
            }
          });
          
          if (response && response.code === 200) {
            product.quantity = newQuantity;
          } else {
            ElMessage.error(response?.message || '更新数量失败');
          }
        } catch (error) {
          console.error('更新数量失败:', error);
          ElMessage.error('更新数量失败，请稍后重试');
        }
      }
    }
  }
};

const updateSelected = async (merchantId, productId) => {
  const merchant = cartItems.value.find(m => m.merchantId === merchantId);
  if (merchant) {
    const product = merchant.products.find(p => p.productId === productId);
    if (product) {
      try {
        const response = await axios.put('/cart/update-selected', null, {
          params: {
            cartId: product.cartId,
            isSelected: product.isSelected
          }
        });
        
        if (response && response.code !== 200) {
          product.isSelected = !product.isSelected;
          ElMessage.error(response?.message || '更新选中状态失败');
        }
      } catch (error) {
        console.error('更新选中状态失败:', error);
        product.isSelected = !product.isSelected;
        ElMessage.error('更新选中状态失败，请稍后重试');
      }
    }
  }
};

const removeProduct = (merchantId, productId) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const merchant = cartItems.value.find(m => m.merchantId === merchantId);
    if (merchant) {
      const product = merchant.products.find(p => p.productId === productId);
      if (product) {
        try {
          const response = await axios.delete('/cart/delete', {
            params: {
              cartId: product.cartId
            }
          });
          
          if (response && response.code === 200) {
            const index = merchant.products.findIndex(p => p.productId === productId);
            if (index > -1) {
              merchant.products.splice(index, 1);
              if (merchant.products.length === 0) {
                const merchantIndex = cartItems.value.findIndex(m => m.merchantId === merchantId);
                cartItems.value.splice(merchantIndex, 1);
              }
            }
            ElMessage.success('删除成功');
          } else {
            ElMessage.error(response?.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          ElMessage.error('删除失败，请稍后重试');
        }
      }
    }
  }).catch(() => {});
};

const removeSelected = () => {
  const selectedProducts = [];
  cartItems.value.forEach(merchant => {
    merchant.products.forEach(product => {
      if (product.isSelected) {
        selectedProducts.push(product.productName);
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
  }).then(async () => {
    try {
      const response = await axios.delete('/cart/delete-selected', {
        params: {
          userId: userStore.userInfo.id
        }
      });
      
      if (response && response.code === 200) {
        cartItems.value.forEach(merchant => {
          merchant.products = merchant.products.filter(p => !p.isSelected);
        });
        cartItems.value = cartItems.value.filter(m => m.products.length > 0);
        ElMessage.success('删除成功');
      } else {
        ElMessage.error(response?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {});
};

const clearCart = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车已经是空的');
    return;
  }
  
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete('/cart/clear', {
        params: {
          userId: userStore.userInfo.id
        }
      });
      
      if (response && response.code === 200) {
        cartItems.value = [];
        ElMessage.success('清空成功');
      } else {
        ElMessage.error(response?.message || '清空失败');
      }
    } catch (error) {
      console.error('清空失败:', error);
      ElMessage.error('清空失败，请稍后重试');
    }
  }).catch(() => {});
};

const goToCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }
  router.push('/order-confirm');
};

onMounted(() => {
  fetchCartItems();
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start mt-20">
      <BackButton />
    </div>
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
        <div class="header-actions">
          <button class="delete-selected-btn" @click="removeSelected">删除选中</button>
          <button class="clear-cart-btn" @click="clearCart">清空购物车</button>
        </div>
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
            <div class="merchant-avatar">
              <span class="avatar-text">{{ getMerchantAvatarText(merchant.merchantName) }}</span>
            </div>
            <span class="merchant-name">{{ merchant.merchantName }}</span>
          </div>
          
          <div class="product-list">
            <div v-for="product in merchant.products" :key="product.productId" class="product-item">
              <input 
                type="checkbox"
                v-model="product.isSelected"
                class="checkbox"
                @change="updateSelected(merchant.merchantId, product.productId)"
              />
              <img :src="`http://localhost:8080/campus-market${product.productImage}`" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ product.productName }}</div>
                <div class="product-price">¥{{ product.price }}</div>
              </div>
              <div class="quantity-control">
                <button class="quantity-btn" @click="updateQuantity(merchant.merchantId, product.productId, -1)">-</button>
                <input type="number" v-model="product.quantity" class="quantity-input" min="1" :max="product.stock" />
                <button class="quantity-btn" @click="updateQuantity(merchant.merchantId, product.productId, 1)">+</button>
              </div>
              <div class="product-subtotal">
                小计: ¥{{ (product.price * product.quantity).toFixed(2) }}
              </div>
              <button class="remove-btn" @click="removeProduct(merchant.merchantId, product.productId)">删除</button>
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

.mt-20 {
  margin-top: 20px;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.clear-cart-btn {
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

.clear-cart-btn:hover {
  border-color: #f44336;
  color: #ffffff;
  background-color: #f44336;
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
  background-color: #d03838;
  display: flex;
  justify-content: center;
  align-items: center;
}

.merchant-avatar .avatar-text {
  color: #ffffff;
  font-size: 12px;
  font-family: Inter;
  font-weight: 600;
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
