<template>
    <v-form @submit.prevent="submitForm" class="form bg-black">
      <v-text-field v-model="name" label="Name" required></v-text-field>
      <v-text-field v-model="age" label="Age" type="number" required></v-text-field>
      <v-select v-model="gender" :items="['Male', 'Female']" label="Gender" required></v-select>
      <v-text-field v-model="water" label="Water" type="number" required></v-text-field>
      <v-text-field v-model="food" label="Food" type="number" required></v-text-field>
      <v-text-field v-model="pill" label="Pill" type="number" required></v-text-field>
      <v-text-field v-model="load" label="Load" type="number" required></v-text-field>

      <div class="flex justify-between w-1/2">
        <v-btn type="submit">Add Survivor</v-btn>
      </div>
      
    </v-form>
  </template>
  
  <script>
  import { createSurvivor } from '../api/server';
  import EventBus from '../events/eventBus';

  export default {
    data() {
      return {
        name: '',
        age: 0,
        gender: '',
        location: {
          latitude: '',
          longitude: ''
        },
        water: 0,
        food:0,
        pill: 0,
        load: 0
      };
    },
    methods: {
      async submitForm() {
        const resp = await createSurvivor({
          name: this.name, 
          age: this.age, 
          sex: this.gender, 
          longitude: 0, 
          latitude: 0,
          items:[
            {name: 'water', quantity: this.water},
            {name: 'food', quantity: this.food},
            {name: 'pill', quantity: this.pill},
            {name: 'load', quantity: this.load}
          ]
        })
        
        EventBus.$emit('survivor-added', {items:[
            {text: 'Water', quantity: this.water, icon: 'mdi-water', color: 'primary', variant: 'plain'},
            {text: 'Food', quantity: this.food, icon: 'mdi-food', color: 'primary', variant: 'plain'},
            {text: 'Pill', quantity: this.pill, icon: 'mdi-pill', color: 'primary', variant: 'plain'},
            {text: 'Load', quantity: this.load, icon: 'mdi-pistol', color: 'primary', variant: 'plain'}
          ], id: resp.data.id });
        EventBus.$emit('toggle-form',{});
      }
    }
  };
  </script>

<style>
  .form{
    width: 40%;
  }
</style>
  