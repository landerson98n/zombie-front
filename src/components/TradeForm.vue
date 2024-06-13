<template>
  <div class="flex w-[80%]" >
    <InventoryForm class="w-1/2" :items="itemsSelected"/>

      <v-form  class="form bg-black">
        <v-text-field  v-model="waterSelected" oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantitySelected('Water')" label="Water" type="number" required></v-text-field>
        <v-text-field  v-model="foodSelected" oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantitySelected('Food')" label="Food" type="number" required></v-text-field>
        <v-text-field  v-model="pillSelected" oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantitySelected('Pill')" label="Pill" type="number" required></v-text-field>
        <v-text-field  v-model="loadSelected" oninput="if(Number(this.value) > Number(this.max)) this.value = this.max;" :max="getInventoryQuantitySelected('Load')" label="Load" type="number" required></v-text-field>
      </v-form>
      <div class="p-[2vw] bg-black"> 
        <h1 class="color-black">Selected Points: {{ selectedPoints }} | Trade Points: {{ tradePoints }}</h1>
        <div class="p-[2vw]">
          <v-btn class="bg-blue" @click="tradeItems" :disabled="selectedPoints !== tradePoints || selectedPoints == 0">Trocar</v-btn> 
        </div>
      </div>
      <v-form  class="form bg-black">
        <v-text-field  oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantityTrade('Water')" v-model="waterTrade" label="Water" type="number" required></v-text-field>
        <v-text-field  oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantityTrade('Food')" v-model="foodTrade" label="Food" type="number" required></v-text-field>
        <v-text-field  oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantityTrade('Pill')" v-model="pillTrade" label="Pill" type="number" required></v-text-field>
        <v-text-field  oninput="if(Number(this.value) > Number(this.max)) this.value = this.max" :max="getInventoryQuantityTrade('Load')" v-model="loadTrade"  label="Load" type="number" required></v-text-field>
      </v-form>

    <InventoryForm class="w-1/2" :items="itemsTrade"/>
    
  </div>
    
</template>
  
  <script>
  import InventoryForm from './InventoryForm.vue'
  import SurvivorForm from './SurvivorForm.vue';
  import EventBus from '../events/eventBus';
  import { updateItems } from '../api/server';
  
  export default {
    components:{
      InventoryForm,
      SurvivorForm
    },
    data() {
      return {
        waterTrade: 0,
        foodTrade: 0,
        pillTrade: 0,
        loadTrade: 0,
        waterSelected: 0,
        foodSelected: 0,
        pillSelected: 0,
        loadSelected: 0,
        itemsSelected: [
        { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain', quantity: 0  },
        { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain', quantity: 0  },
        { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain', quantity: 0  },
        { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain', quantity: 0  }
        ],
        itemsTrade: [
        { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain', quantity: 0 },
        { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain', quantity: 0  },
        { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain', quantity: 0  },
        { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain', quantity: 0  }
        ],
        defaultItems: [
          { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain' },
          { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain' },
          { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
          { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain' }],
          idSelected : 0,
          idTrade : 0
        }  
  },
  mounted(){
    EventBus.$on('select-survivor', (data) => {
      this.idSelected = data.id
      const defaultItems = [
      { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain' },
      { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain' },
      { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
      { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain' }]

      const items = defaultItems.map(defaultItem => {
        const itemFromDb = data.items.find(item => item.name.toLowerCase() === defaultItem.text.toLowerCase());
        return itemFromDb ? { ...defaultItem, quantity: itemFromDb.quantity} : defaultItem;
      });
     
      this.updateItemsSelected(items)
    });
    EventBus.$on('trade-survivor',(data) => {
      this.idTrade = data.id
      const defaultItems = [
      { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain' },
      { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain' },
      { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
      { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain' }]

      const items = defaultItems.map(defaultItem => {
        const itemFromDb = data.items.find(item => item.name.toLowerCase() === defaultItem.text.toLowerCase());
        return itemFromDb ? { ...defaultItem, quantity: itemFromDb.quantity} : defaultItem;
      });
      this.updateItemsTrade(items)
    })
  },
  computed: {
    selectedPoints() {
      return (
        this.waterSelected * 4 +
        this.foodSelected * 3 +
        this.pillSelected * 2 +
        this.loadSelected * 1
      );
    },
    tradePoints() {
      return (
        this.waterTrade * 4 +
        this.foodTrade * 3 +
        this.pillTrade * 2 +
        this.loadTrade * 1
      );
    }
  },
  
  methods:{
    tradeItems(){
      const dataSelected = [
      { name: "water", quantity: Number(this.itemsSelected[0].quantity) - Number(this.waterSelected) + Number(this.waterTrade) },
      { name: "food", quantity: Number(this.itemsSelected[1].quantity) - Number(this.foodSelected) + Number(this.foodTrade) },
      { name: "pill", quantity: Number(this.itemsSelected[2].quantity) - Number(this.pillSelected) + Number(this.pillTrade) },
      { name: "load", quantity: Number(this.itemsSelected[3].quantity) - Number(this.loadSelected) + Number(this.loadTrade) }
    ];

      console.log(dataSelected);
      const dataTrade = [
      { name: "water", quantity: Number(this.itemsTrade[0].quantity) - Number(this.waterTrade) + Number(this.waterSelected) },
      { name: "food", quantity: Number(this.itemsTrade[1].quantity) - Number(this.foodTrade) + Number(this.foodSelected) },
      { name: "pill", quantity: Number(this.itemsTrade[2].quantity) - Number(this.pillTrade) + Number(this.pillSelected) },
      { name: "load", quantity: Number(this.itemsTrade[3].quantity) - Number(this.loadTrade) + Number(this.loadSelected) }
    ];

      updateItems(dataSelected,dataTrade, this.idSelected, this.idTrade)
        
    },
   
    updateItemsTrade(items){
      this.itemsTrade = items
    },
    updateItemsSelected(items){
      this.itemsSelected = items
    },
    getInventoryQuantityTrade(itemName) {
      const item = this.itemsTrade.find(item => item.text.toLowerCase() === itemName.toLowerCase());
      return item ? item.quantity : 0;
    },
    getInventoryQuantitySelected(itemName) {
      const item = this.itemsSelected.find(item => item.text.toLowerCase() === itemName.toLowerCase());
      return item ? item.quantity : 0;
    },
  }
  };
  </script>
  
  <style>
  </style>
  