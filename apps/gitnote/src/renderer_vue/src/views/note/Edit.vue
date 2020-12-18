<template>
  <div class="page note-edit">
    <template v-if="isShowLoading">
      <Loading height="300" />
    </template>
    <template v-else>
      <div class="form-group">
        <input
          class="form-input"
          type="text"
          v-model="note.title"
          name="title"
          v-validate="'required'"
        />
        <div v-show="errors.has('title')" class="form-error">
          {{ errors.first('title') }}
        </div>
      </div>
      <div class="form-group">
        <input-tag placeholder="请输入标签" v-model="note.labels" :limit="limit"></input-tag>
      </div>
      <div class="form-group form-area">
        <div class="ui pointing menu">
          <a :class="{ item: true, active: !isPreview }" @click="handleMarkdown"> Markdown </a>
          <a :class="{ item: true, active: isPreview }" @click="handlePreview"> 预览HTML </a>
        </div>
        <div class="ui segment">
          <div v-if="!isPreview">
            <textarea class="textarea" v-model="note.body" placeholder="请输入内容"></textarea>
          </div>
          <template v-else>
            <div class="markdown" v-html="html"></div>
          </template>
        </div>
      </div>
      <div class="form-group">
        <div class="ui buttons">
          <button class="large ui primary button" @click="handleSave">保存</button>
          <button class="large ui button" @click="handleBack">返回</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import noteApi from '@/api/note';
import { loadingMixin } from '@/mixins/loading.js';
import { noteMixin } from '@/mixins/note.js';

export default {
  name: 'NoteEdit',
  mixins: [loadingMixin, noteMixin],
  async created() {
    const config = await noteApi.getConfig();
    if (!config) {
      this.$router.replace('/note/setting');
      return;
    }

    const number = this.$route.params.number;
    this.number = number;
    this.isShowLoading = true;
    try {
      const res = await noteApi.getDetail(number, config);
      const data = res.data;
      const labels = data.labels.map(item => item.name);
      this.note = { title: data.title, body: data.body, labels: labels };
      this.isShowLoading = false;
    } catch (error) {
      this.$swal('出错了', error.message, 'error');
    }
  },
  methods: {
    async handleSave() {
      const valid = await this.$validator.validate();
      if (!valid) {
        return false;
      }

      const config = await noteApi.getConfig();
      if (!config) {
        this.$router.replace('/note/setting');
        return;
      }

      const note = this.note;
      const number = this.number;
      try {
        const res = await noteApi.editNote(number, note, config);
        if (res.status === 200) {
          this.$swal('保存成功', '', 'success');
        }
      } catch (error) {
        this.$swal('出错了', error.message, 'error');
      }
    },
    handleBack() {
      this.$router.back();
    },
  },
  data() {
    return {
      note: {
        title: '',
        body: '',
        labels: [],
      },
      limit: 10,
    };
  },
};
</script>
