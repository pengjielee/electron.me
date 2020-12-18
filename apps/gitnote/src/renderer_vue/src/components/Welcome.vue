<template>
    <div class="welcome">
        <h1 class="title">欢迎使用GitNote!</h1>
        <p class="des">GitNote是基于Github API的笔记应用。</p>
        <p class="action" @click="handleJump"><a class="link">点击进入</a></p>
    </div>
</template>

<script>
export default {
    name: 'Welcome',
    props: {
        msg: String,
    },
    methods: {
        handleJump() {
            this.$router.push('/note/list');
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.welcome {
    display: flex;
    flex-direction: column;
    margin: 200px 0;
}
.welcome .title {
    margin-bottom: 10px;
}
.welcome .des {
    margin-bottom: 10px;
}
.welcome .link {
    color: blue;
    font-size: 14px;
    cursor: pointer;
}
</style>
