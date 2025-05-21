<template>
  <div>
    <h1 class="page-title">Управление вкладами</h1>
    <DepositManager />
  </div>
</template>

<script setup>
import DepositManager from '~/components/finances/DepositManager.vue';
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}
</style>
