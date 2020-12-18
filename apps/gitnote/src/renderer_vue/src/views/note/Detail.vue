<template>
  <div class="note-detail">
    <div class="note-header">
      <a class="back" @click="handleBack">返回</a>
    </div>
    <template v-if="isShowLoading">
      <Loading height="300" />
    </template>
    <template v-else>
      <h3 class="title">{{ note.title }}</h3>
      <p class="date">{{ note.created_at }}</p>
      <div class="tags" v-if="note.tags">
        <span
          v-for="tag in note.tags"
          v-bind:key="tag.id"
          class="tag"
          :style="{ background: '#' + tag.color }"
          @click="handleTag(tag.name)"
        >
          {{ tag.name }}
        </span>
      </div>
      <div class="content">
        <pre>{{ note.body }}</pre>
      </div>
    </template>
  </div>
</template>

<script>
import noteApi from '@/api/note';
import { loadingMixin } from '@/mixins/loading.js';

export default {
  name: 'NoteDetail',
  mixins: [loadingMixin],
  async created() {
    const config = await noteApi.getConfig();
    if (!config) {
      this.$router.replace('/note/setting');
      return;
    }

    const number = this.$route.params.number;
    try {
      const res = await noteApi.getDetail(number, config);
      this.note = res.data;
    } catch (error) {
      this.$swal('出错了', error.message, 'error');
    }
  },
  methods: {
    handleTag(name) {
      this.$router.push(`/note/list/${name}`);
    },
    handleBack() {
      this.$router.back();
    },
  },
  data() {
    return {
      note: {
        title: '',
        created_at: '',
        body: '',
      },
    };
  },
};
</script>
