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
const additionalEntries=[
 {brand:'Mitsubishi',model:'Xpander',zh:'三菱 Xpander',position:'0% 0%'},
 {brand:'Ford',model:'Ranger',zh:'福特 Ranger',position:'100% 0%'},
 {brand:'Hyundai',model:'Santa Fe',zh:'现代 Santa Fe',position:'0% 100%'},
 {brand:'Ford',model:'Territory',zh:'福特 Territory',position:'100% 100%'}
];
const existingVehicles=[
 ...entries.map(v=>({...v,vehicleImage:'/images/vehicles/scene-atlas.webp',vehicleImageSize:'300% 200%',sceneHeight:'84%',sceneTop:'0%'})),
 ...additionalEntries.map(v=>({...v,vehicleImage:'/images/vehicles/extra-scenes.webp',vehicleImageSize:'200% 200%',sceneHeight:'54%',sceneTop:'10%'}))
].map(v=>({...v,vehicleName:`${v.brand} ${v.model}`,localizedName:{zh:v.zh,vi:`${v.brand} ${v.model}`,en:`${v.brand} ${v.model}`},shockImage:'/images/vehicles/shock-placeholder.webp',href:`/products?q=${encodeURIComponent(v.model)}&search=1`,temporary:true}));

// Canonical customer-requested list; K3 / Cerato is one model family.
const requestedModels=[
 ['Toyota','Vios'],['Toyota','Innova'],['Mitsubishi','Xpander'],['Ford','Ranger'],['Toyota','Fortuner'],
 ['Hyundai','Grand i10'],['Kia','Morning'],['Hyundai','Accent'],['Honda','City'],['Toyota','Camry'],
 ['Mazda','CX-5'],['Honda','CR-V'],['Mazda','3'],['Hyundai','Tucson'],['Kia','K3 / Cerato'],
 ['Kia','Seltos'],['Toyota','Corolla Cross'],['Toyota','Yaris Cross'],['Suzuki','XL7'],['Honda','Civic']
];
export const popularVehicles=requestedModels.map(([brand,model],i)=>{
 const existing=existingVehicles.find(v=>v.brand===brand&&v.model===model);
 if(existing)return existing;
 const vehicleName=brand==='Mazda'&&model==='3'?'Mazda3':`${brand} ${model}`;
 return {brand,model,vehicleName,localizedName:{zh:vehicleName,vi:vehicleName,en:vehicleName},vehicleImage:'/images/vehicles/twenty-models.webp',vehicleImageSize:'500% 400%',position:`${(i%5)*25}% ${Math.floor(i/5)*100/3}%`,sceneHeight:'84%',sceneTop:'0%',shockImage:'/images/vehicles/shock-placeholder.webp',href:`/products?q=${encodeURIComponent(model==='K3 / Cerato'?'Cerato':model==='3'?'Mazda3':model)}&search=1`,temporary:true};
});
