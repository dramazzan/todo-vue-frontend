<script setup></script>

<template>
  <main class="welcome-box">
    <div class="main-box">
      <h2>Ramazan To Do</h2>
      <p>To Do helps you focus,<br />whether for work or play</p>
      <div class="btn-box">
        <router-link to="/home" class="start-btn">Start</router-link>
        <router-link to="/info" class="info-btn">More Information</router-link>
      </div>
    </div>
    <div class="image-box">
      <img
        src="@/assets/images/welcome/welcome-main-icon.png"
        alt="Welcome Icon"
      />
    </div>
  </main>
</template>

<style scoped>
.welcome-box {
  font-family: "Raleway", sans-serif;
  width: 80%;
  max-width: 1000px;
  height: 500px;
  margin: 50px auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: -10px 15px 40px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 40px;
  /* backdrop-filter: blur(10px); */
  background-color: var( --background-color);
  overflow: hidden;
}

.main-box {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 50%;
}

.btn-box {
  display: flex;
  align-items: center;
  gap: 30px;
}

.btn-box .info-btn {
  color: #3a7ed1;
  font-size: 20px;
}

h2 {
  font-size: 38px;
  color: var(--text-color);
  margin-bottom: 10px;
}

p {
  font-size: 18px;
  color: var(--text-color);
  line-height: 1.5;
  margin-bottom: 20px;
}

a {
  text-decoration: none;
}

.start-btn {
  display: inline-block;
  width: 140px;
  height: 50px;
  background: #3a7ed1;
  color: #fff;
  text-align: center;
  line-height: 50px;
  border-radius: 25px;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  transition: background 0.3s ease, transform 0.3s ease;
}

.start-btn:hover {
  background: #2f6ab0;
  transform: scale(1.05);
}

.image-box img {
  width: 100%;
  max-width: 300px;
  padding-right: 120px;
}

@media (max-width: 768px) {
  .welcome-box {
    flex-direction: column;
    height: auto;
    text-align: center;
    padding: 30px;
  }
  .main-box {
    max-width: 100%;
    margin-bottom: 20px;
  }
  .image-box img {
    max-width: 250px;
  }
}
</style>
