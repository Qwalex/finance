<template>
  <div>
    <header class="app-header">
      <nav>
        <div class="app-container">
          <h1 class="app-title">Финансовый учет</h1>
          <div class="nav-links">
            <NuxtLink to="/">Панель управления</NuxtLink>
            <NuxtLink to="/transactions">Транзакции</NuxtLink>
            <NuxtLink to="/recurring">Регулярные платежи</NuxtLink>
            <NuxtLink to="/deposits">Вклады</NuxtLink>
            <NuxtLink to="/debts">Задолженности</NuxtLink>
            <NuxtLink to="/reports">Отчеты</NuxtLink>
          </div>
        </div>
      </nav>
    </header>
    <main class="app-container">
      <NuxtPage />
    </main>
    <footer class="app-footer">
      <div class="app-container">
        <p>&copy; 2025 Финансовый учет. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<style>
.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 10px 0;
  margin-bottom: 20px;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  margin-top: 10px;
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 5px 0;
  position: relative;
}

.nav-links a:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
}

.app-footer {
  margin-top: 40px;
  padding: 20px 0;
  background-color: #f1f1f1;
  color: #666;
  text-align: center;
}
</style>
