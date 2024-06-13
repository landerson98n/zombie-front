import { createStore } from 'vuex';

const store = createStore({
  state: {
    isFormOpen: false,
  },
  mutations: {
    toggleForm(state) {
      state.isFormOpen = !state.isFormOpen;
    },
    closeForm(state) {
      state.isFormOpen = false;
    },
  },
  actions: {
    toggleForm({ commit }) {
      commit('toggleForm');
    },
    closeForm({ commit }) {
      commit('closeForm');
    },
  },
  getters: {
    isFormOpen: (state) => state.isFormOpen,
  },
});

export default store;
