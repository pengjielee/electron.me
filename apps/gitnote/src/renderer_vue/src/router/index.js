import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

import NoteIndex from '../views/note/Index.vue';
import NoteSetting from '../views/note/Setting.vue';
import NoteList from '../views/note/List.vue';
import NoteAdd from '../views/note/Add.vue';
import NoteEdit from '../views/note/Edit.vue';
import NoteDetail from '../views/note/Detail.vue';
import NoteTags from '../views/note/Tags.vue';
import NoteImages from '../views/note/Images.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: { title: 'GitNote' },
    },
    {
        path: '/note',
        name: 'noteIndex',
        component: NoteIndex,
        children: [
            {
                path: 'list/:tag?',
                name: 'noteList',
                component: NoteList,
                meta: { title: '笔记列表' },
            },
            {
                path: 'tags',
                name: 'noteTags',
                component: NoteTags,
                meta: { title: '笔记标签' },
            },
            {
                path: 'images',
                name: 'noteImages',
                component: NoteImages,
                meta: { title: '图片列表' },
            },
            {
                path: 'detail/:number',
                name: 'noteDetail',
                component: NoteDetail,
                meta: { title: '笔记详情' },
            },
            {
                path: 'add',
                name: 'noteAdd',
                component: NoteAdd,
                meta: { title: '添加笔记' },
            },
            {
                path: 'edit/:number',
                name: 'noteEdit',
                component: NoteEdit,
                meta: { title: '编辑笔记' },
            },
            {
                path: 'setting',
                name: 'noteSetting',
                component: NoteSetting,
                meta: { title: '设置' },
            },
        ],
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () =>
    //     import(/* webpackChunkName: "about" */ "../views/About.vue")
    // }
];

const router = new VueRouter({
    routes,
});

router.afterEach(to => {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
});

export default router;
