<template>
    <div class="note-upload">
        <div class="uploader" @click="handleUpload">
            <input type="file" ref="input" :accept="accept" :multiple="multiple" @change="handleChange" />
            <span class="plus">+</span>
        </div>
    </div>
</template>

<script>
import noteApi from '@/api/note';

const toDataURL = blob => {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.onerror = function () {
            reject(false);
        };
        reader.readAsDataURL(blob);
    });
};

export default {
    name: 'NoteUpload',
    methods: {
        handleChange(e) {
            const self = this;
            const file = e.target.files[0];
            toDataURL(file).then(async function (content) {
                content = content.slice(content.indexOf(',') + 1);

                const config = await noteApi.getConfig();
                if (!config) {
                    this.$router.replace('/note/setting');
                    return;
                }

                try {
                    const res = await noteApi.upload(file.name, { message: 'upload image', content: content }, config);

                    if (res.status === 201) {
                        self.$swal('上传成功', '', 'success');
                        self.$emit('uploadSuccess');
                    }
                } catch (error) {
                    self.$swal('出错了', error.message, 'error');
                }
            });
        },
        handleUpload() {
            this.$refs.input.value = null;
            this.$refs.input.click();
        },
    },
    data() {
        return {
            accept: '.jpg, .jpeg, .png',
            multiple: false,
        };
    },
};
</script>
