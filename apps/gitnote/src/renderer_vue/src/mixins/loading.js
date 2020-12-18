import Loading from '@/components/Loading.vue';

export const loadingMixin = {
  components: {
    Loading,
  },
  data() {
    return {
      isShowLoading: false,
    };
  },
};
