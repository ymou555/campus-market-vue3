<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import SearchBox from '../components/SearchBox.vue';
import ProductCard from '../components/ProductCard.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const searchValue = ref('');
const selectedCategories = ref([]);
const priceRange = reactive({
  min: '',
  max: ''
});
const selectedCondition = ref('');
const sortBy = ref('default');

const categoryOptions = [
  { value: 'electronics', label: '电子产品' },
  { value: 'clothing', label: '服装' },
  { value: 'books', label: '图书' },
  { value: 'sports', label: '运动器材' },
  { value: 'furniture', label: '家具' },
  { value: 'other', label: '其他' }
];

const conditionOptions = [
  { value: 'new', label: '全新' },
  { value: 'almost-new', label: '几乎全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' }
];

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'time-desc', label: '最新发布' }
];

const searchResults = ref([
  { id: 1, name: 'iPhone 13 Pro', price: 5999, originalPrice: 7999, merchant: '数码小店', image: 'https://via.placeholder.com/200', condition: 'almost-new' },
  { id: 2, name: 'MacBook Pro 2021', price: 12999, originalPrice: 14999, merchant: '苹果专卖店', image: 'https://via.placeholder.com/200', condition: 'new' },
  { id: 3, name: '机械键盘', price: 299, originalPrice: 499, merchant: '外设天地', image: 'https://via.placeholder.com/200', condition: 'good' },
  { id: 4, name: '运动跑鞋', price: 199, originalPrice: 399, merchant: '运动装备', image: 'https://via.placeholder.com/200', condition: 'fair' },
  { id: 5, name: '编程书籍合集', price: 89, originalPrice: 199, merchant: '书香阁', image: 'https://via.placeholder.com/200', condition: 'good' },
  { id: 6, name: '二手自行车', price: 450, originalPrice: 800, merchant: '单车世界', image: 'https://via.placeholder.com/200', condition: 'good' }
]);

const historySearches = ref(['iPhone', 'MacBook', '机械键盘', '运动鞋', '编程书籍']);

const handleSearch = (keyword) => {
  searchValue.value = keyword;
  ElMessage.success(`搜索关键词: ${keyword || '全部商品'}`);
};

const clearHistory = () => {
  historySearches.value = [];
  ElMessage.success('历史记录已清空');
};

const handleHistoryClick = (keyword) => {
  searchValue.value = keyword;
  handleSearch(keyword);
};

const applyFilters = () => {
  ElMessage.success('筛选条件已应用');
};

const resetFilters = () => {
  selectedCategories.value = [];
  priceRange.min = '';
  priceRange.max = '';
  selectedCondition.value = '';
  sortBy.value = 'default';
  ElMessage.success('筛选条件已重置');
};

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`);
};
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <div class="search-container">
      <SearchBox @search="handleSearch" />
      
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
            <el-select 
              v-model="selectedCategories" 
              multiple 
              collapse-tags 
              placeholder="请选择分类" 
              class="filter-select"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
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
        
        <div class="products-grid">
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
