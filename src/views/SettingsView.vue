<script setup>
const appVersion = __APP_VERSION__
</script>

<template>
  <main class="view">
    <h1>⚙ Settings</h1>

    <section class="settings-section">
      <h2>About</h2>
      <div class="setting-row">
        <span class="setting-label">App version</span>
        <span class="setting-value">v{{ appVersion }}</span>
      </div>
    </section>

    <router-link to="/" class="back-link">← Back</router-link>
  </main>
</template>

<style scoped>
.view {
  padding: 2rem;
  max-width: 480px;
  margin: 0 auto;
}

.settings-section {
  margin-top: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.settings-section h2 {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
}

.setting-label {
  font-size: 1rem;
  color: #333;
}

.setting-value {
  font-size: 1rem;
  color: #555;
  font-variant-numeric: tabular-nums;
}

.back-link {
  display: inline-block;
  margin-top: 2rem;
  color: #4a90e2;
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
