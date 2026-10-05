// Temporary AI scene atlas; replace each vehicleImage independently with approved photography.
// shockImage is a generic visual placeholder, not a verified part-to-vehicle association.
const entries=[
 {brand:'Toyota',model:'Vios',zh:'丰田 威驰',position:'0% 0%'},
 {brand:'Toyota',model:'Camry',zh:'丰田 凯美瑞',position:'50% 0%'},
 {brand:'Toyota',model:'Corolla Altis',zh:'丰田 卡罗拉',position:'100% 0%'},
 {brand:'Toyota',model:'Fortuner',zh:'丰田 Fortuner',position:'0% 100%'},
 {brand:'Hyundai',model:'Grand i10',zh:'现代 Grand i10',position:'50% 100%'},
 {brand:'Kia',model:'Morning',zh:'起亚 Morning',position:'100% 100%'}
];
export const popularVehicles=entries.map(v=>({...v,vehicleName:`${v.brand} ${v.model}`,localizedName:{zh:v.zh,vi:`${v.brand} ${v.model}`,en:`${v.brand} ${v.model}`},vehicleImage:'/images/vehicles/scene-atlas.webp',vehicleImageSize:'300% 200%',shockImage:'/images/vehicles/shock-placeholder.webp',href:`/products?q=${encodeURIComponent(v.model)}&search=1`,temporary:true}));
