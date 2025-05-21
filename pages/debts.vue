<template>
  <div>
    <h1 class="page-title">Задолженности</h1>
    <DebtManager />
  </div>
</template>

<script setup>
import DebtManager from '~/components/debts/DebtManager.vue';
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}
</style>
