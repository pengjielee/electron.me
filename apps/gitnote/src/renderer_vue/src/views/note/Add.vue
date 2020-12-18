<template>
    <div class="note-edit">
        <header class="page-header">
            <div class="ui buttons">
                <button class="ui primary button" @click="handleSave">保存</button>
                <button class="ui button" @click="handleClear">清空</button>
            </div>
        </header>
        <div class="page-body">
            <div class="form-group">
                <div class="">
                    <input
                        type="text"
                        class="form-input"
                        v-model="note.title"
                        placeholder="请输入标题"
                        name="title"
                        v-validate="'required'"
                    />
                    <div v-show="errors.has('title')" class="form-error">
                        {{ errors.first('title') }}
                    </div>
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
        </div>
    </div>
</template>

<script>
import noteApi from '@/api/note';
import { noteMixin } from '@/mixins/note.js';

export default {
    name: 'NoteAdd',
    mixins: [noteMixin],
    // created() {
    //   this.$swal
    //     .fire({
    //       position: "top-center",
    //       icon: "success",
    //       title: "Your work has been saved",
    //       showConfirmButton: true,
    //       timer: 1500
    //     })
    //     .then(result => {
    //       if (result.value) {
    //         alert(result.value);
    //       }
    //     });
    // },
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
            try {
                const res = await noteApi.addNote(note, config);
                if (res.status === 201) {
                    //this.$swal("添加成功", "", "success");
                    this.$swal
                        .fire({
                            position: 'top-center',
                            icon: 'success',
                            title: '添加成功',
                            showConfirmButton: true,
                        })
                        .then(result => {
                            if (result.value) {
                                this.note = {
                                    title: '',
                                    body: '',
                                    labels: [],
                                };
                            }
                        });
                }
            } catch (error) {
                this.$swal('出错了', error.message, 'error');
            }
        },
        handleBack() {
            this.$router.back();
        },
        handleClear() {
            this.note = {
                title: '',
                body: '',
                labels: [],
            };
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

<style scoped>
.page-header {
    position: fixed;
    padding-bottom: 20px;
    z-index: 1000;
}
.page-body {
    padding-top: 60px;
}
</style>
