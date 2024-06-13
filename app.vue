<template>
  
    <NuxtLayout>
      
    <v-app class="p-[2vw] bg-green">

      <div class="flex justify-between pr-[2vw]">
      
        <div v-if="isStatisticOpen" class="w-[35vw] py-[2vw] flex justify-center">
          <StatisticView class="w-full" :items="statistic"/>
          <v-btn class="w-[1.5vw] bg-red" @click="openStatistics">x</v-btn>
        </div>

        <div class="w-[25vw] py-[2vw] absolute flex ml-[65vw] mt-[5vw]">
          <SurvivorActions/>
        </div>
    
      </div>
      
      <div v-if="isFormOpen" class="absolute w-full flex justify-center py-[2vw]">
        <SurvivorForm class="w-[30vw]" />
        <v-btn class="w-[1.5vw] bg-red" @click="openForm">x</v-btn>
      </div>

      <div  v-show="isTradeOpen" class="mt-[20vw] absolute w-full px-[13vw] z-1" >
        <TradeForm class="w-full" />
        <v-btn class="w-[1.5vw] bg-red" @click="openTrade">x</v-btn>
      </div>
      
      <div class="w-1/2 h-1/2" v-if="!isTradeOpen">
        <div class="w-[25vw] py-[2vw] absolute mt-[5vw] z-0">
          <div class="flex">
            <Button @click="openForm"/>
            <div class="px-[2vw]">
              <v-btn v-show="local" class="w-[1.5vw]  bg-blue" @click="updateLocal">local</v-btn>
            </div>
          </div>
          <InventoryForm :items="items" class="mt-[2vw]"/>
        </div>
      </div>
      <Survivor/> 
      
    </v-app>
  </NuxtLayout>
</template>

<script>
import SurvivorForm from '@/src/components/SurvivorForm.vue';
import Button from '@/src/components/Button.vue'
import InventoryForm from '@/src/components/InventoryForm.vue'
import StatisticView from '@/src/components/StatisticsView.vue'
import SurvivorActions from '@/src/components/SurvivorActions.vue'
import Survivor from '@/src/components/Survivor.vue'
import { TresCanvas } from '@tresjs/core'
import EventBus from './src/events/eventBus';
import { getSurvivors } from './src/api/server';
import TradeForm from './src/components/TradeForm.vue';

const isFormOpen = ref(false);
export default {
  components: {
    InventoryForm,
    Button,
    SurvivorForm,
    TresCanvas,
    Survivor,
    StatisticView,
    SurvivorActions,
    TradeForm
  },
  data() {
    return {
      items: [],
      statistic: [],
      isFormOpen: false, 
      isStatisticOpen: false,
      isTradeOpen: false,
      isActionOpen: false,
      itemsSelected: [],
      local: false
    };
  },
  mounted(){
    
    EventBus.$on('toggle-form', this.openForm);
    this.getUserData()
    EventBus.$on('survivor-added', (data) => {
      this.setItems(data)
    })
    EventBus.$on('survivor-clicked', (data) => this.openAction());
    EventBus.$on('statistics', (data) => this.setData(data));
    EventBus.$on('statistics', (data) => this.openStatistics());
    EventBus.$on('trade-survivor',(data) => this.openTrade())
    EventBus.$on('select-survivor', (data) => {
      const defaultItems = [
      { text: 'Water', icon: 'mdi-water', color: 'primary', variant: 'plain' },
      { text: 'Food', icon: 'mdi-food', color: 'primary', variant: 'plain' },
      { text: 'Pill', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
      { text: 'Load', icon: 'mdi-pistol', color: 'primary', variant: 'plain' }]

      const items = defaultItems.map(defaultItem => {
        const itemFromDb = data.items.find(item => item.name.toLowerCase() === defaultItem.text.toLowerCase());
        return itemFromDb ? { ...defaultItem, quantity: itemFromDb.quantity} : defaultItem;
      });

      this.updateItems(items)
    });
  },
  methods:{
    openForm(){
      this.isFormOpen = !this.isFormOpen; 
    },
    openStatistics(){
      this.isStatisticOpen = !this.isStatisticOpen 
    },
    openTrade(){
      this.isTradeOpen = !this.isTradeOpen
    },
    openAction(){
      this.isActionOpen = !this.isActionOpen
    },
    updateLocal(){
      EventBus.$emit('update-local', {})
    },
    async getUserData() {
      try {
        const rep = await getSurvivors();
        EventBus.$emit('data-survivors', rep.data);
      } catch (error) {
        console.error('Error fetching survivor data:', error);
      }
    },
   
    setData(data){ 
        const {infected_percentage, non_infected_percentage} =  data.data
        this.statistic = [
          { text: '% Infectados', icon: 'mdi-water', color: 'primary', variant: 'plain', quantity: infected_percentage },
          { text: '% Não infectados', icon: 'mdi-pill', color: 'secondary', variant: 'plain', quantity: non_infected_percentage },
        ]
    },
    setItems(data){
      this.items = data.items
    },
    updateItems(items){
      this.items = items
      this.local = true
    }
  },
  
};
</script>