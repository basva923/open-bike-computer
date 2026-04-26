<template>
  <main class="view">
    <h1>Open Bike Computer</h1>
    <p>Welcome! Use the settings menu to configure your bike computer.</p>
    <router-link to="/settings" class="settings-link">⚙ Settings</router-link>
  </main>
</template>

<style scoped>
.view {
  padding: 2rem;
  text-align: center;
}

.settings-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: #4a90e2;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

.settings-link:hover {
  background: #357abd;
}
</style>
