<template>
  <div>
    <h1 class="page-title">Панель управления</h1>
    <DashboardStats />
  </div>
</template>

<script setup>
import DashboardStats from '~/components/dashboard/DashboardStats.vue';
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}
</style>
