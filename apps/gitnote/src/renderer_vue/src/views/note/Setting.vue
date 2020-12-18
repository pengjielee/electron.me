<template>
    <div class="page page-setting">
        <div class="form-group">
            <div class="form-label"><span class="required">*</span><label>仓库名</label></div>
            <input
                class="form-input"
                type="text"
                v-model="config.repo"
                placeholder="格式：username/repo"
                name="repo"
                v-validate="'required'"
            />
            <div v-show="errors.has('repo')" class="form-error">
                {{ errors.first('repo') }}
            </div>
        </div>
        <div class="form-group">
            <div class="form-label"><span class="required">*</span><label>token</label></div>
            <input
                class="form-input"
                type="password"
                v-model="config.token"
                placeholder="token"
                name="token"
                v-validate="'required'"
            />
            <div v-show="errors.has('token')" class="form-error">
                {{ errors.first('token') }}
            </div>
        </div>
        <div class="form-group">
            <div class="form-label"><label>每页显示几条</label></div>
            <input class="form-input" type="number" v-model="config.size" name="size" v-validate="'required'" />
            <div v-show="errors.has('size')" class="form-error">
                {{ errors.first('size') }}
            </div>
        </div>
        <div class="form-group">
            <button class="fluid large ui primary button" @click="handleSave">保存</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Setting',
    created: function () {
        const self = this;
        window.localForage.getItem('config', function (err, value) {
            if (err) {
                return;
            }
            if (value) {
                self.$data.config = value;
            }
        });
    },
    methods: {
        handleSave() {
            const self = this;
            this.$validator.validate().then(async result => {
                if (!result) {
                    return false;
                }
                window.localForage.setItem('config', this.config, function (err) {
                    if (err) {
                        self.$swal('保存失败', '', 'error');
                    } else {
                        self.$swal('保存成功', '', 'success').then(function () {
                            self.$router.push('/note/list');
                        });
                    }
                });
            });
        },
    },
    data() {
        return {
            config: {
                repo: '',
                token: '',
                size: 30,
            },
        };
    },
};
</script>
