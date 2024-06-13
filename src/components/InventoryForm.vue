<template>
  <v-card>
    <v-list>
      <v-list-subheader>Inventory</v-list-subheader>

      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :value="item"
        :class="{ 'primary--text': item.color === 'primary' }"
        :variant="item.variant"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>

        <v-list-item-title v-text="item.text"></v-list-item-title>
        <v-list-item-title v-text="item.quantity"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      default:[
      { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain', quantity: 0 },
      { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain', quantity: 0 },
      { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain', quantity: 0 },
      { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain', quantity: 0 }]
    },
  },
};
</script>

<style>
/* Add custom styles as needed */
</style>
