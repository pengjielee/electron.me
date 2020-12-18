// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const Home = require("./pages/home.js");
const About = require("./pages/about.js");

const routes = [
  { path: "/", component: Home, },
  { path: "/about", component: About }
];

const router = new VueRouter({
  routes, // (缩写) 相当于 routes: routes
});

const app = new Vue({
  el: "#app",
  router,
  data: {
    message: "Hello Vue!",
  },
});