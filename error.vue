<template>
  <div>
    <h1 class="error-title">{{ props.error.statusCode }}</h1>
    <div class="error-message">{{ props.error.message }}</div>
    <div class="error-actions">
      <Button label="Вернуться на главную" @click="handleError" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
});

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>

<style scoped>
.error-title {
  font-size: 8rem;
  color: #e74c3c;
  margin: 0;
  text-align: center;
}

.error-message {
  font-size: 1.5rem;
  text-align: center;
  margin: 20px 0 40px;
  color: #333;
}

.error-actions {
  display: flex;
  justify-content: center;
}
</style>
