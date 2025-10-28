export const useTestStore = defineStore("test", {
  state: () => ({}),
  actions: {
    async test() {
      console.log("hello pinia");
    },
  },
});
