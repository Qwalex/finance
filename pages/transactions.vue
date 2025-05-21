<template>
  <div>
    <h1 class="page-title">Транзакции</h1>
    <TransactionManager />
  </div>
</template>

<script setup>
import TransactionManager from '~/components/finances/TransactionManager.vue';
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}
</style>
