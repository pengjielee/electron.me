<template>
  <div class="note-tags">
    <template v-if="isShowLoading">
      <Loading height="300" />
    </template>
    <template v-else>
      <div class="tags" v-if="tags.length > 0">
        <span
          v-for="tag in tags"
          v-bind:key="tag.id"
          class="tag"
          :style="{ background: '#' + tag.color }"
          @click="handleTag(tag.name)"
        >
          {{ tag.name }}
        </span>
      </div>
      <div class="empty" v-else>什么也没有</div>
    </template>
  </div>
</template>

<script>
import noteApi from '@/api/note';
import { loadingMixin } from '@/mixins/loading.js';

export default {
  name: 'NoteTags',
  mixins: [loadingMixin],
  async created() {
    this.isShowLoading = true;
    const config = await noteApi.getConfig();
    if (!config) {
      this.$router.replace('/note/setting');
      return;
    }
    try {
      const res = await noteApi.getTags(config);
      let tags = [];
      res.data.forEach(tag => {
        if (this.systemTags.indexOf(tag.name) < 0) {
          tags.push(tag);
        }
      });
      this.tags = tags;
      this.isShowLoading = false;
    } catch (error) {
      this.$swal('出错了', error.message, 'error');
    }
  },
  methods: {
    handleTag(name) {
      this.$router.push(`/note/list/${name}`);
    },
  },
  data() {
    return {
      tags: [],
      systemTags: [
        'bug',
        'documentation',
        'duplicate',
        'enhancement',
        'good first issue',
        'help wanted',
        'invalid',
        'question',
        'wontfix',
      ],
    };
  },
};
</script>
