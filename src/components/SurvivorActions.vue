<template>
    <v-card v-if="isFormOpen" class="absolute w-full flex justify-center py-[2vw]">
      <v-list>
        <v-list-subheader>Actions</v-list-subheader>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :value="item"
          :class="{ 'primary--text': item.color === 'primary' }"
          :variant="item.variant"
          @click="item.text === 'Selecionar' ? setSelectedData() : item.text === 'Fechar' ? openForm(null) : item.text === 'Trocar' ? openTradeForm() : item.text === 'Infectado' ? marcarInfectado() : null"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
  
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </template>
  
  <script>
  import EventBus from '../events/eventBus';
  import { markInfected } from '../api/server';

  export default {
    data: () => ({
      items: [
        { text: 'Trocar', icon: 'mdi-water', color: 'primary', variant: 'plain' },
        { text: 'Infectado', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
        { text: 'Selecionar', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
        { text: 'Fechar', icon: 'mdi-pill', color: 'secondary', variant: 'plain' },
      ],
      isFormOpen: false, 
      dataClicked: null,
      survivors : [],
      infected: false,
      selected: null
    }),
    mounted(){
        EventBus.$on('survivor-clicked', (data) => this.openForm(data));
        EventBus.$on('data-survivors', (data) => this.survivors = data);
    },
    methods:{
        openForm(data){
            if(data && data?.is_infected || this.selected?.is_infected){
              this.items = [
              { text: 'Selecionar', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
              { text: 'Fechar', icon: 'mdi-pill', color: 'secondary', variant: 'plain' },
              ]
            }else{
              this.items = [
                { text: 'Trocar', icon: 'mdi-water', color: 'primary', variant: 'plain' },
                { text: 'Infectado', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
                { text: 'Selecionar', icon: 'mdi-pill', color: 'primary', variant: 'plain' },
                { text: 'Fechar', icon: 'mdi-pill', color: 'secondary', variant: 'plain' },
              ]
            }
            this.isFormOpen = !this.isFormOpen; 
            this.dataClicked = data
        },
        setSelectedData(){
          this.selected = this.dataClicked
          EventBus.$emit('select-survivor', this.dataClicked)
        },
        openTradeForm(){
          this.isFormOpen = !this.isFormOpen; 
          EventBus.$emit('trade-survivor', this.dataClicked)
        },
        marcarInfectado(){
          markInfected(this.dataClicked.id)
          EventBus.$emit('zombie-transformer', this.dataClicked)
        }
       
    },
  };
  </script>
  
  