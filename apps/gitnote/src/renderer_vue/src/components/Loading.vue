<template>
  <div class="loading" :style="{ height: height + 'px' }">
    <img src="../assets/img/loading.png" class="img" />
    <p class="info">努力加载中</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    height: {
      type: String,
      default: '60',
    },
  },
};
</script>

<style>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.loading {
  margin: 30px 0 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.loading .info {
  margin: 8px 0;
}
.loading img {
  animation: rotate 3s linear infinite;
}
</style>
