<template>
  <div>
    <h1 class="page-title">Регулярные платежи</h1>
    <RecurringManager />
  </div>
</template>

<script setup>
import RecurringManager from '~/components/finances/RecurringManager.vue';
</script>

<style scoped>
.page-title {
  margin-bottom: 25px;
  font-size: 1.8rem;
  color: #2c3e50;
}
</style>
