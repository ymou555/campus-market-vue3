import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/register.vue'),
  },
  {
    path: '/merchant-register',
    name: 'merchant-register',
    component: () => import('../pages/merchant-register.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/home.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../pages/search.vue'),
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('../pages/product-detail.vue'),
  },
  {
    path: '/shop/:id',
    name: 'shop',
    component: () => import('../pages/shop.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/cart.vue'),
  },
  {
    path: '/order-confirm',
    name: 'order-confirm',
    component: () => import('../pages/order-confirm.vue'),
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../pages/orders.vue'),
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('../pages/order-detail.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/profile.vue'),
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('../pages/wallet.vue'),
  },
  {
    path: '/points',
    name: 'points',
    component: () => import('../pages/points.vue'),
  },
  {
    path: '/reviews',
    name: 'reviews',
    component: () => import('../pages/reviews.vue'),
  },
  {
    path: '/merchant/dashboard',
    name: 'merchant-dashboard',
    component: () => import('../pages/merchant/dashboard.vue'),
  },
  {
    path: '/merchant/products',
    name: 'merchant-products',
    component: () => import('../pages/merchant/products.vue'),
  },
  {
    path: '/merchant/product-publish',
    name: 'merchant-product-publish',
    component: () => import('../pages/merchant/product-publish.vue'),
  },
  {
    path: '/merchant/product-edit/:id',
    name: 'merchant-product-edit',
    component: () => import('../pages/merchant/product-edit.vue'),
  },
  {
    path: '/merchant/orders',
    name: 'merchant-orders',
    component: () => import('../pages/merchant/orders.vue'),
  },
  {
    path: '/merchant/shop-settings',
    name: 'merchant-shop-settings',
    component: () => import('../pages/merchant/shop-settings.vue'),
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../pages/admin/dashboard.vue'),
  },
  {
    path: '/admin/user-audit',
    name: 'admin-user-audit',
    component: () => import('../pages/admin/user-audit.vue'),
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../pages/admin/users.vue'),
  },
  {
    path: '/admin/product-audit',
    name: 'admin-product-audit',
    component: () => import('../pages/admin/product-audit.vue'),
  },
  {
    path: '/admin/merchants',
    name: 'admin-merchants',
    component: () => import('../pages/admin/merchants.vue'),
  },
  {
    path: '/admin/merchant-levels',
    name: 'admin-merchant-levels',
    component: () => import('../pages/admin/merchant-levels.vue'),
  },
  {
    path: '/admin/banners',
    name: 'admin-banners',
    component: () => import('../pages/admin/banners.vue'),
  },
  {
    path: '/admin/blacklist',
    name: 'admin-blacklist',
    component: () => import('../pages/admin/blacklist.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
