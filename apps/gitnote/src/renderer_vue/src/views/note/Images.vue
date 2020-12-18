<template>
    <div>
        <note-upload v-on:uploadSuccess="onUploadSuccess"></note-upload>
        <div class="note-images">
            <template v-if="isShowLoading">
                <Loading height="300" />
            </template>
            <ul class="list">
                <li v-for="image in images" v-bind:key="image.sha" class="item">
                    <dl class="media">
                        <dt class="media-left">
                            <img :src="image.download_url" width="100px" />
                        </dt>
                        <dd class="media-object">
                            <p class="title">{{ image.name }}</p>
                            <p class="size">{{ image.size }}</p>
                            <p class="action">
                                <a @click="handleCopy(image, 'http')">复制为HTTP</a
                                ><a @click="handleCopy(image, 'md')">复制为MARKDOWN</a>
                            </p>
                        </dd>
                    </dl>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import noteApi from '@/api/note';
import NoteUpload from './Upload.vue';
import { loadingMixin } from '@/mixins/loading.js';

export default {
    name: 'NoteImages',
    mixins: [loadingMixin],
    components: {
        NoteUpload,
    },
    created() {
        this.getImages();
    },
    methods: {
        onUploadSuccess() {
            this.getImages();
        },
        async getImages() {
            this.isShowLoading = true;
            const config = await noteApi.getConfig();

            if (!config) {
                this.$router.replace('/note/setting');
                return;
            }
            try {
                const res = await noteApi.getImages(config);
                var images = res.data;
                images.map(item => {
                    item.size = parseInt(item.size / 1000) + 'KB';
                    return item;
                });
                this.images = images;
                this.isShowLoading = false;
            } catch (error) {
                this.$swal('出错了', error.message, 'error');
                this.isShowLoading = false;
            }
        },
        handleCopy(image, type) {
            const self = this;
            var content = image.download_url;
            if (type === 'md') {
                content = `![](${content})`;
            }
            self.$copyText(content).then(
                function () {
                    self.$swal('复制成功', '已复制到剪贴板', 'success');
                },
                function () {
                    self.$swal('复制失败', '', 'error');
                },
            );
        },
    },
    data() {
        return {
            images: [],
        };
    },
};
</script>
