import { reactive } from 'vue';

const state = reactive({});

const EventBus = {
  $on(event, callback) {
    if (!state[event]) {
      state[event] = [];
    }
    state[event].push(callback);
  },
  $off(event, callback) {
    if (!state[event]) return;
    state[event] = state[event].filter(cb => cb !== callback);
  },
  $emit(event, ...args) {
    if (!state[event]) return;
    state[event].forEach(callback => callback(...args));
  }
};

export default EventBus;
