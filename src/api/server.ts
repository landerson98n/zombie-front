import axios from 'axios'
 type Item = {
   name: string
   quantity: number
 }
 type Survivor = {
    name: string,
    age: number,
    sex: "Male" | "Female",
    latitude: number,
    longitude: number
    items: Item[]
 }

 export async function createSurvivor(data: Survivor){
    console.log(data);
    const response = await axios.post("http://127.0.0.1:8000/api/survivors/", data)
    console.log(response);
    
    return response
}

export async function getSurvivors(){
   const response = await axios.get("http://127.0.0.1:8000/api/survivors/")
   return response
}

export async function updateItems(dataSelected: any, dataTrade: any, idSelected: any, idTrade: any){
   const updateSurvivorSelected = await axios.patch(`http://127.0.0.1:8000/api/survivors/${idSelected}/`, {'items':dataSelected})
   const updateSurvivorTrade = await axios.patch(`http://127.0.0.1:8000/api/survivors/${idTrade}/`, {'items': dataTrade})
   return {updateSurvivorSelected, updateSurvivorTrade}
}

export async function getStatistics(){
   try {
      const response = await axios.get("http://127.0.0.1:8000/api/survivors/infection_stats/")
      return response;
    } catch (error) {
      console.error('Error fetching infection stats:', error);
      throw error;
    }
}

export async function markInfected(id: any){
   const response = await axios.patch(`http://127.0.0.1:8000/api/survivors/${id}/`, {'is_infected': true})
   return response
}

export async function update_location(id: any, longitude: any, latitude: any){
   const response = await axios.patch(`http://127.0.0.1:8000/api/survivors/${id}/`, {latitude, longitude})
   return response
}
