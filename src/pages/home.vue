<script setup>
  import { useRouter } from 'vue-router';
  import { reactive, onMounted, ref } from 'vue';
  import Navbar from '../components/Navbar.vue';
  import ProductCard from '../components/ProductCard.vue';

  const props = defineProps({});

  const data = reactive({});
  const value1 = ref([]);
  const options = [
    { value: 'electronics', label: '电子产品' },
    { value: 'clothing', label: '服装' },
    { value: 'books', label: '图书' },
    { value: 'sports', label: '运动器材' },
    { value: 'furniture', label: '家具' },
    { value: 'other', label: '其他' }
  ];

  // 模拟后端返回的商品列表数据
  const productList = ref([
    { id: 1, name: '商品1', price: 50, merchant: '商家1' },
    { id: 2, name: '商品2', price: 80, merchant: '商家2' },
    { id: 3, name: '商品3', price: 120, merchant: '商家3' },
    { id: 4, name: '商品4', price: 65, merchant: '商家4' },
    { id: 5, name: '商品5', price: 200, merchant: '商家5' },
    { id: 6, name: '商品6', price: 45, merchant: '商家6' },
    { id: 7, name: '商品7', price: 88, merchant: '商家7' },
    { id: 8, name: '商品8', price: 150, merchant: '商家8' },
    { id: 9, name: '商品9', price: 180, merchant: '商家9' }
  ]);

  const router = useRouter();
</script>

<template>
  <div class="flex-col page">
    <Navbar />
    
    <el-carousel :interval="4000" type="card" height="250px" style="margin-top: 20px;">
      <el-carousel-item v-for="item in 6" :key="item">
        <h3 class="medium">{{ item }}</h3>
      </el-carousel-item>
    </el-carousel>
    
    <div class="flex-col section_2 mt-265">
      <el-select 
        v-model="value1" 
        multiple 
        collapse-tags 
        placeholder="请选择商品分类" 
        class="category-select">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <div class="mt-10 grid">
        <ProductCard 
          v-for="product in productList" 
          :key="product.id" 
          :product="product" 
        />
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
  }
  ::v-deep(.category-select .el-select__wrapper) {
    height: 39px !important;
    border-radius: 30px !important;
    box-shadow: none !important;
    border: solid 1px #000000 !important;
  }
  ::v-deep(.category-select .el-select__wrapper.is-hovering) {
    box-shadow: none !important;
    border-color: #ff0000 !important;
    box-shadow: 0px 0px 4px rgba(255, 0, 0, 0.3) !important;
  }
  ::v-deep(.category-select .el-select__wrapper.is-focused) {
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
  /* 轮播图样式 */
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>