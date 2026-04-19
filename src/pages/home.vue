<script setup>
  import { useRouter } from 'vue-router';
  import { reactive, onMounted, ref } from 'vue';
  import Navbar from '../components/Navbar.vue';
  import ProductCard from '../components/ProductCard.vue';
  import axios from '../utils/axios';
  import { ElMessage } from 'element-plus';

  const props = defineProps({});

  const data = reactive({});
  const value1 = ref([]);
  
  const cascaderProps = {
    expandTrigger: 'hover'
  };
  
  const handleChange = (value) => {
    console.log('选中的分类:', value);
    if (value && value.length > 0) {
      const categoryId = value[value.length - 1];
      fetchProducts(categoryId);
    } else {
      fetchProducts();
    }
  };
  
  const options = ref([]);

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

  const productList = ref([]);
  
  const banners = ref([]);

  const router = useRouter();

  const fetchBanners = async () => {
    try {
      const response = await axios.get('/banner/active');
      if (response && response.code === 200) {
        banners.value = response.data.map(item => ({
          id: item.id,
          bannerName: item.bannerName,
          imageUrl: `http://localhost:8080/campus-market${item.imageUrl}`,
          linkUrl: item.linkUrl
        }));
      }
    } catch (error) {
      console.error('获取轮播图失败:', error);
    }
  };

  const handleBannerClick = (linkUrl) => {
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl.trim(), '_blank');
    } else {
      router.push(linkUrl.trim());
    }
  };

  const fetchProducts = async (categoryId = null) => {
    try {
      let url = '/product/search';
      if (categoryId) {
        url += `?categoryId=${categoryId}`;
      }
      const response = await axios.get(url);
      if (response && response.code === 200) {
        productList.value = response.data.map(item => ({
          id: item.id,
          name: item.productName,
          price: item.discountPrice,
          merchant: item.merchantName,
          image: item.firstImage ? `http://localhost:8080/campus-market${item.firstImage}` : ''
        }));
      } else {
        ElMessage.error(response?.message || '获取商品列表失败');
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
      ElMessage.error('获取商品列表失败，请稍后重试');
    }
  };

  onMounted(() => {
    fetchProducts();
    fetchCategories();
    fetchBanners();
  });
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <el-carousel v-if="banners.length > 0" :interval="4000" type="card" height="250px" style="margin-top: 20px;">
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <img 
          :src="banner.imageUrl" 
          class="banner-image"
          @click="banner.linkUrl && handleBannerClick(banner.linkUrl)"
        />
      </el-carousel-item>
    </el-carousel>
    
    <div class="flex-col section_2 mt-265">
      <el-cascader 
        v-model="value1" 
        :options="options" 
        :props="cascaderProps" 
        @change="handleChange"
        placeholder="请选择商品分类"
        class="category-select"
        clearable
      />
      <div class="mt-10 grid" v-if="productList.length > 0">
        <ProductCard 
          v-for="product in productList" 
          :key="product.id" 
          :product="product" 
        />
      </div>
      <div class="mt-10 empty-tip" v-else>
        <span class="empty-text">暂无商品</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
  .mt-265 {
    margin-top: 20px;
  }
  .ml-11 {
    margin-left: 11px;
  }
  .page {
    padding: 15px 30px 65px;
    background-color: #cb5647;
    background-image: radial-gradient(circle, #a03a30 1px, transparent 1px);
    background-size: 20px 20px;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
  }
  .section_2 {
    margin-left: 51px;
    margin-right: 51px;
    padding: 18px 30px;
    background-color: #ffffff;
    border-radius: 20px;
    filter: drop-shadow(0px 0px 35px #00000026);
    overflow: hidden;
  }
  /* 商品分类选择器样式 */
  .category-select {
    width: 144px;
  }
  ::v-deep(.category-select) {
    --el-border-radius-base: 30px !important;
    width: 144px;
  }
  ::v-deep(.category-select .el-input__wrapper) {
    height: 39px !important;
    border-radius: 30px !important;
    box-shadow: none !important;
    border: solid 1px #000000 !important;
    padding: 0 15px !important;
  }
  ::v-deep(.category-select .el-input__inner) {
    padding-left: 5px !important;
  }
  ::v-deep(.category-select .el-input__wrapper:hover) {
    box-shadow: none !important;
    border-color: #ff0000 !important;
    box-shadow: 0px 0px 4px rgba(255, 0, 0, 0.3) !important;
  }
  ::v-deep(.category-select .el-input__wrapper.is-focus) {
    box-shadow: none !important;
    border-color: #ff0000 !important;
    box-shadow: 0px 0px 6px rgba(255, 0, 0, 0.5) !important;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 340px;
    row-gap: 11.5px;
    column-gap: 16.5px;
  }
  .empty-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    width: 100%;
  }
  .empty-text {
    font-size: 18px;
    font-family: Inter;
    color: #999999;
    font-weight: 500;
  }
  /* 轮播图样式 */
  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>