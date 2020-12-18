<template>
    <div class="page note-list">
        <div class="page-header">
            <div class="ui buttons">
                <button class="ui primary button" @click="handleNew">新建笔记</button>
                <button class="ui positive button" @click="handleSort">{{ directionName }}排列</button>
            </div>
        </div>
        <div class="list">
            <ul>
                <li v-for="note in notes" v-bind:key="note.id" class="item">
                    <p class="title" @click="handleLook(note.number)">
                        {{ note.title }}
                    </p>
                    <div class="content">{{ note.body }}</div>
                    <div class="tags">
                        <span v-for="tag in note.labels" v-bind:key="tag.id" class="tag">{{ tag.name }}</span>
                    </div>
                    <div class="date">{{ note.created_at }}</div>
                    <div class="action"><a @click="handleEdit(note.number)">编辑</a></div>
                </li>
            </ul>
            <template v-if="isShowLoading">
                <Loading />
            </template>
            <div class="load-more">
                <button class="ui button" @click="handleLoad" v-if="!isLoadOver">加载更多</button>
                <p class="info" v-else>没有更多了</p>
            </div>
        </div>
    </div>
</template>

<script>
import noteApi from '@/api/note';
import { loadingMixin } from '@/mixins/loading.js';

export default {
    name: 'NoteList',
    mixins: [loadingMixin],
    created: function () {
        const tag = this.$route.params && this.$route.params.tag;
        if (tag) {
            this.search.labels = tag;
        }
        this.getNotes();
    },
    computed: {
        directionName: function () {
            return this.search.direction === 'asc' ? '降序' : '升序';
        },
    },
    methods: {
        handleSort() {
            let direction = '';
            if (this.search.direction === 'asc') {
                direction = 'desc';
            } else {
                direction = 'asc';
            }
            this.search.direction = direction;
            this.notes = [];
            this.search.page = 1;
            this.isLoadOver = false;
            this.getNotes();
        },
        handleNew() {
            this.$router.push(`/note/add`);
        },
        handleEdit(number) {
            this.$router.push(`/note/edit/${number}`);
        },
        handleLook(number) {
            this.$router.push(`/note/detail/${number}`);
        },
        handleLoad() {
            this.search.page = this.search.page + 1;
            this.getNotes();
        },
        async getNotes() {
            this.isShowLoading = true;
            const { page, direction, labels } = this.search;

            const config = await noteApi.getConfig();
            if (!config) {
                this.$router.replace('/note/setting');
                return;
            }
            const size = config.size ? config.size : 20;
            try {
                const res = await noteApi.getList(page, size, direction, labels, config);
                let newNotes = res.data.map(note => {
                    if (note.body.length > 100) {
                        note.body = note.body.slice(0, 100);
                    }
                    return note;
                });
                const oldNotes = this.notes;
                if (newNotes.length <= 0) {
                    this.isLoadOver = true;
                }
                this.isShowLoading = false;
                this.notes = oldNotes.concat(newNotes);
            } catch (error) {
                this.$swal('出错了', error.message, 'error');
            }
        },
    },
    data() {
        return {
            notes: [],
            search: {
                page: 1,
                direction: 'desc',
                labels: '',
            },
            isLoadOver: false,
        };
    },
};
</script>
