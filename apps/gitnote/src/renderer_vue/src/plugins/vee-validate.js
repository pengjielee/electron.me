import Vue from 'vue';
import VeeValidate, { Validator } from 'vee-validate';
import zh_CN from 'vee-validate/dist/locale/zh_CN';

const dictionary = {
  cn: {
    messages: {
      required: field => '请填写' + field,
    },
    attributes: {
      title: '标题',
      repo: '仓库名',
      token: 'token',
      size: '条数',
    },
  },
};

Vue.use(VeeValidate, { fieldsBagName: 'vee-fields' });
Validator.localize('cn', zh_CN);
Validator.localize(dictionary);

Validator.extend('mobile', {
  getMessage: () => '请输入正确的手机号',
  validate: value => {
    const reg = /^1\d{10}$/;
    return reg.test(value);
  },
});

Validator.extend('name_en', {
  getMessage: () => '只能输入英文字符',
  validate: value => {
    const reg = /^[a-zA-Z\s]+$/;
    return reg.test(value);
  },
});

Validator.extend('name_cn', {
  getMessage: () => '只能输入中文字符',
  validate: value => {
    const reg = /^[\u4E00-\u9FA5|\u9FA6-\u9FEF|\u3400-\u4DB5]+$/;
    return reg.test(value);
  },
});

Validator.extend('number_int', {
  getMessage: () => '必须是数字',
  validate: value => {
    const reg = /^[1-9]\d*$/;
    return reg.test(value);
  },
});

Validator.extend('address', {
  getMessage: () => '请填写正确现居住地(4-100个字符)',
  validate: value => {
    let result = true;
    value = value.replace(/\s+/g, '');
    result = value.length < 4 || value.length > 100 ? false : true;
    return result;
  },
});
