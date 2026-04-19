<script setup>
import { ref, reactive, onMounted, onUnmounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import SearchBox from '../components/SearchBox.vue';
import ProductCard from '../components/ProductCard.vue';
import BackButton from '../components/BackButton.vue';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'SearchView'
});

const router = useRouter();

const searchValue = ref('');
const selectedCategories = ref([]);
const priceRange = reactive({
  min: '',
  max: ''
});
const selectedCondition = ref('');
const sortBy = ref('default');

const options = ref([]);

const cascaderProps = {
  expandTrigger: 'hover'
};

const fetchCategories = async () => {
  try {
    const response = await axios.get('/product/categories');
    if (response && response.code === 200) {
      options.value = response.data;
    } else {
      ElMessage.error(response?.message || '获取分类失败');
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    ElMessage.error('获取分类失败，请稍后重试');
  }
};

const handleCategoryChange = (value) => {
  console.log('选中的分类:', value);
};

const conditionOptions = [
  { value: 'new', label: '全新' },
  { value: 'like_new', label: '几乎全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' }
];

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'sales', label: '销量从高到低' },
  { value: 'rating', label: '好评率从高到低' }
];

const searchResults = ref([]);
const loading = ref(false);

const formatProductData = (product) => {
  return {
    id: product.id,
    name: product.productName || '未知商品',
    price: product.discountPrice || product.originalPrice || 0,
    originalPrice: product.originalPrice || 0,
    merchant: product.merchantName || '未知商家',
    image: product.firstImage ? `http://localhost:8080/campus-market${product.firstImage}` : ''
  };
};

const searchProducts = async () => {
  loading.value = true;
  try {
    const params = {};
    
    if (searchValue.value) {
      params.keyword = searchValue.value;
    }
    
    if (selectedCategories.value && selectedCategories.value.length > 0) {
      params.categoryId = selectedCategories.value[selectedCategories.value.length - 1];
    }
    
    if (sortBy.value && sortBy.value !== 'default') {
      params.sortBy = sortBy.value;
    }
    
    if (priceRange.min) {
      params.minPrice = parseFloat(priceRange.min);
    }
    
    if (priceRange.max) {
      params.maxPrice = parseFloat(priceRange.max);
    }
    
    if (selectedCondition.value) {
      params.newness = selectedCondition.value;
    }
    
    const response = await axios.get('/product/search', { params });
    
    if (response && response.code === 200) {
      const rawData = response.data || [];
      searchResults.value = rawData.map(formatProductData);
    } else {
      ElMessage.error(response?.message || '搜索失败');
      searchResults.value = [];
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

const historySearches = ref([]);

const loadHistorySearches = () => {
  try {
    const saved = localStorage.getItem('historySearches');
    if (saved) {
      historySearches.value = JSON.parse(saved);
    } else {
      historySearches.value = [];
    }
  } catch (e) {
    console.error('读取历史搜索记录失败:', e);
    historySearches.value = [];
  }
};

const saveHistorySearches = () => {
  try {
    localStorage.setItem('historySearches', JSON.stringify(historySearches.value));
  } catch (e) {
    console.error('保存历史搜索记录失败:', e);
  }
};

const addHistorySearch = (keyword) => {
  if (!keyword || !keyword.trim()) return;
  
  const trimmedKeyword = keyword.trim();
  
  const existingIndex = historySearches.value.indexOf(trimmedKeyword);
  if (existingIndex !== -1) {
    historySearches.value.splice(existingIndex, 1);
  }
  
  historySearches.value.unshift(trimmedKeyword);
  
  if (historySearches.value.length > 10) {
    historySearches.value = historySearches.value.slice(0, 10);
  }
  
  saveHistorySearches();
};

const handleSearch = (keyword) => {
  searchValue.value = keyword;
  addHistorySearch(keyword);
  searchProducts();
};

const clearHistory = () => {
  historySearches.value = [];
  localStorage.removeItem('historySearches');
  ElMessage.success('历史记录已清空');
};

const handleHistoryClick = (keyword) => {
  searchValue.value = keyword;
  searchProducts();
};

const applyFilters = () => {
  searchProducts();
  ElMessage.success('筛选条件已应用');
};

const resetFilters = () => {
  selectedCategories.value = [];
  priceRange.min = '';
  priceRange.max = '';
  selectedCondition.value = '';
  sortBy.value = 'default';
  searchProducts();
  ElMessage.success('筛选条件已重置');
};

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`);
};

const handleSearchTriggered = () => {
  const keyword = sessionStorage.getItem('searchKeyword') || '';
  if (keyword) {
    searchValue.value = keyword;
    sessionStorage.removeItem('searchKeyword');
    addHistorySearch(keyword);
    searchProducts();
  }
};

const handleUserLogout = () => {
  historySearches.value = [];
};

onMounted(() => {
  fetchCategories();
  loadHistorySearches();
  
  const keyword = sessionStorage.getItem('searchKeyword') || '';
  if (keyword) {
    searchValue.value = keyword;
    sessionStorage.removeItem('searchKeyword');
    addHistorySearch(keyword);
  }
  searchProducts();
  
  window.addEventListener('search-triggered', handleSearchTriggered);
  window.addEventListener('user-logout', handleUserLogout);
});

onActivated(() => {
  loadHistorySearches();
  
  const keyword = sessionStorage.getItem('searchKeyword') || '';
  if (keyword) {
    searchValue.value = keyword;
    sessionStorage.removeItem('searchKeyword');
    addHistorySearch(keyword);
    searchProducts();
  }
});

onUnmounted(() => {
  window.removeEventListener('search-triggered', handleSearchTriggered);
  window.removeEventListener('user-logout', handleUserLogout);
});
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    <div class="flex-row justify-start items-center self-start">
      <BackButton />
    </div>
    
    <div class="search-container">
      <SearchBox v-model="searchValue" @search="handleSearch" />
      
      <div class="history-section" v-if="historySearches.length > 0">
        <div class="history-header">
          <span class="history-title">历史搜索</span>
          <span class="clear-btn" @click="clearHistory">清空</span>
        </div>
        <div class="history-tags">
          <span 
            v-for="(item, index) in historySearches" 
            :key="index"
            class="history-tag"
            @click="handleHistoryClick(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">商品分类</span>
            <el-cascader 
              v-model="selectedCategories" 
              :options="options" 
              :props="cascaderProps" 
              @change="handleCategoryChange"
              placeholder="请选择商品分类"
              class="category-cascader"
              clearable
            />
          </div>
          
          <div class="filter-item">
            <span class="filter-label">新旧程度</span>
            <el-select 
              v-model="selectedCondition" 
              placeholder="请选择" 
              class="filter-select"
              clearable
            >
              <el-option
                v-for="item in conditionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">排序方式</span>
            <el-select 
              v-model="sortBy" 
              placeholder="请选择" 
              class="filter-select"
            >
              <el-option
                v-for="item in sortOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-item price-filter">
            <span class="filter-label">价格区间</span>
            <div class="price-inputs">
              <input 
                v-model="priceRange.min"
                type="number"
                class="price-input"
                placeholder="最低价"
              />
              <span class="price-separator">-</span>
              <input 
                v-model="priceRange.max"
                type="number"
                class="price-input"
                placeholder="最高价"
              />
            </div>
          </div>
          
          <div class="filter-actions">
            <button class="action-btn reset-btn" @click="resetFilters">重置</button>
            <button class="action-btn apply-btn" @click="applyFilters">应用筛选</button>
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <div class="results-header">
          <span class="results-count">找到 {{ searchResults.length }} 个商品</span>
        </div>
        
        <div v-if="loading" class="loading-container">
          <span class="loading-text">搜索中...</span>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="empty-container">
          <span class="empty-text">暂无搜索结果</span>
        </div>
        
        <div v-else class="products-grid">
          <div 
            v-for="product in searchResults" 
            :key="product.id"
            class="product-card-wrapper"
            @click="goToProductDetail(product.id)"
          >
            <ProductCard :product="product" />
          </div>
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

.search-container {
  margin-top: 20px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 20px;
  filter: drop-shadow(0px 0px 35px #00000026);
}

.history-section {
  margin-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-title {
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  color: #333333;
}

.clear-btn {
  font-size: 12px;
  color: #999999;
  cursor: pointer;
  transition: color 0.3s ease;
}

.clear-btn:hover {
  color: #cb5747;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  padding: 6px 16px;
  background-color: #f5f5f5;
  border-radius: 100px;
  font-size: 13px;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-tag:hover {
  background-color: rgba(203, 87, 71, 0.1);
  color: #cb5747;
}

.filters-section {
  margin-top: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  align-items: flex-end;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  font-weight: 500;
}

.filter-select {
  width: 200px;
}

.category-cascader {
  width: 200px;
}

::v-deep(.category-cascader) {
  --el-border-radius-base: 30px !important;
  width: 200px;
}

::v-deep(.category-cascader .el-input__wrapper) {
  height: 32px !important;
  border-radius: 30px !important;
  box-shadow: none !important;
  border: solid 1px #d9d9d9 !important;
  padding: 0 15px !important;
  width: 200px;
}

::v-deep(.category-cascader .el-input__inner) {
  padding-left: 5px !important;
}

::v-deep(.category-cascader .el-input__wrapper:hover) {
  box-shadow: none !important;
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3) !important;
}

::v-deep(.category-cascader .el-input__wrapper.is-focus) {
  box-shadow: none !important;
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5) !important;
}

::v-deep(.filter-select .el-select__wrapper) {
  border-radius: 100px !important;
  box-shadow: none !important;
  border: solid 1px #d9d9d9 !important;
}

::v-deep(.filter-select .el-select__wrapper.is-hovering) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3) !important;
}

::v-deep(.filter-select .el-select__wrapper.is-focused) {
  border-color: #cb5747 !important;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5) !important;
}

.price-filter {
  flex: 1;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 120px;
  padding: 8px 12px;
  border-radius: 100px;
  border: solid 1px #d9d9d9;
  outline: none;
  font-size: 14px;
  font-family: Inter;
  color: #333333;
  transition: all 0.3s ease;
}

.price-input:hover:not(:focus) {
  border-color: #cb5747;
  box-shadow: 0px 0px 4px rgba(203, 87, 71, 0.3);
}

.price-input:focus {
  border-color: #cb5747;
  box-shadow: 0px 0px 6px rgba(203, 87, 71, 0.5);
}

.price-separator {
  color: #999999;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.action-btn {
  padding: 8px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-family: Inter;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  color: #666666;
}

.reset-btn:hover {
  border-color: #cb5747;
  color: #cb5747;
}

.apply-btn {
  background-color: #cb5747;
  border: 1px solid #cb5747;
  color: #ffffff;
}

.apply-btn:hover {
  background-color: #b04a3c;
  border-color: #b04a3c;
  transform: scale(1.05);
}

.results-section {
  margin-top: 20px;
}

.results-header {
  margin-bottom: 16px;
}

.results-count {
  font-size: 14px;
  font-family: Inter;
  color: #666666;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.loading-text,
.empty-text {
  font-size: 16px;
  font-family: Inter;
  color: #999999;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.product-card-wrapper {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-card-wrapper:hover {
  transform: translateY(-4px);
}
</style>
