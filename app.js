const density={해운대해수욕장:['82% · 혼잡','청사포 · 19%'],광안리해수욕장:['76% · 혼잡','수영사적공원 · 22%'],서면:['51% · 보통','전포카페거리 · 29%'],흰여울문화마을:['24% · 여유','절영해안산책로 · 19%'],삼락생태공원:['18% · 여유','화명생태공원 · 16%']};
const cards=document.querySelector('#smallCards');
const realtimeNow=new Date();
const realtimeText=`${String(realtimeNow.getHours()).padStart(2,'0')}:${String(realtimeNow.getMinutes()).padStart(2,'0')} 갱신`;
document.querySelector('#syncTime').textContent=realtimeText;
document.querySelector('#updatedAt').textContent=`${realtimeText} · 데모 데이터`;
const pages=document.querySelectorAll('.page'),navs=document.querySelectorAll('.nav'),toast=document.querySelector('.toast');
function move(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));navs.forEach(n=>n.classList.toggle('active',n.dataset.go===id));document.querySelector('.app-shell').scrollTop=0;if(id==='map'&&crowdMap)setTimeout(()=>crowdMap.invalidateSize(),0);}
document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.go)));
document.querySelectorAll('.map-pin').forEach(pin=>pin.addEventListener('click',()=>{const [level,alt]=density[pin.dataset.place];document.querySelector('#placeTitle').textContent=pin.dataset.place;document.querySelector('#placeDensity').innerHTML=level.replace(' · ',' <em>')+'</em>';document.querySelector('#placeAlt').textContent=alt;}));
document.querySelectorAll('.filter-row button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter-row button').forEach(b=>b.classList.remove('active'));button.classList.add('active');renderRecommendations(button.dataset.filter);toast.textContent=`${button.textContent} 테마에 맞는 장소를 찾았어요`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}));
document.querySelectorAll('.course-switch button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.course-switch button').forEach(b=>b.classList.remove('active'));button.classList.add('active');}));
document.querySelector('.course-btn').addEventListener('click',()=>move('course'));

// 부산 실제 지도를 기준으로 선정한 32개 관광지를 표시합니다.
// 운영 환경에서는 /api/crowd가 통신사·교통·주차·날씨 데이터를 합산한
// { places: [{ id, crowd }] } 형식의 익명 집계 결과를 반환하도록 연결합니다.
const touristSpots=[
 ['용두산공원·부산타워','중구',35.1007,129.0329],['국제시장','중구',35.1022,129.0286],['송도해수욕장','서구',35.0771,129.0204],['암남공원','서구',35.0717,129.0169],['초량 이바구길','동구',35.1161,129.0351],['부산항 북항','동구',35.1178,129.0461],['흰여울문화마을','영도구',35.0782,129.0446],['태종대','영도구',35.0510,129.0872],['서면','부산진구',35.1579,129.0592],['전포카페거리','부산진구',35.1564,129.0655],['동래읍성','동래구',35.2053,129.0820],['온천천','동래구',35.2052,129.1035],['오륙도스카이워크','남구',35.0994,129.1206],['이기대 해안산책로','남구',35.1140,129.1191],['화명생태공원','북구',35.2248,129.0063],['구포시장','북구',35.2116,128.9995],['해운대해수욕장','해운대구',35.1587,129.1604],['청사포','해운대구',35.1602,129.1917],['감천문화마을','사하구',35.0975,129.0106],['다대포해수욕장','사하구',35.0463,128.9654],['범어사','금정구',35.2761,129.0682],['금정산성','금정구',35.2676,129.0922],['대저생태공원','강서구',35.2117,128.9713],['가덕도','강서구',35.0177,128.8310],['부산아시아드주경기장','연제구',35.1909,129.0665],['배산','연제구',35.1762,129.0976],['광안리해수욕장','수영구',35.1532,129.1186],['민락수변공원','수영구',35.1546,129.1269],['삼락생태공원','사상구',35.1684,128.9784],['사상근린공원','사상구',35.1590,128.9939],['해동용궁사','기장군',35.1880,129.2231],['오시리아 관광단지','기장군',35.1960,129.2142]
].map(([name,district,lat,lng],index)=>({id:`spot-${index}`,name,district,lat,lng,crowd:14+(index*17)%74}));
const spotThemes={
 '용두산공원·부산타워':'문화·전시','국제시장':'맛집·시장','송도해수욕장':'자연·산책','암남공원':'자연·산책','초량 이바구길':'문화·전시','부산항 북항':'문화·전시','흰여울문화마을':'문화·전시','태종대':'자연·산책','서면':'맛집·시장','전포카페거리':'맛집·시장','동래읍성':'문화·전시','온천천':'자연·산책','오륙도스카이워크':'자연·산책','이기대 해안산책로':'자연·산책','화명생태공원':'자연·산책','구포시장':'맛집·시장','해운대해수욕장':'자연·산책','청사포':'자연·산책','감천문화마을':'문화·전시','다대포해수욕장':'자연·산책','범어사':'문화·전시','금정산성':'문화·전시','대저생태공원':'자연·산책','가덕도':'자연·산책','부산아시아드주경기장':'문화·전시','배산':'자연·산책','광안리해수욕장':'자연·산책','민락수변공원':'맛집·시장','삼락생태공원':'자연·산책','사상근린공원':'자연·산책','해동용궁사':'문화·전시','오시리아 관광단지':'문화·전시'
};
const spotImages={
 '용두산공원·부산타워':'assets/yongdusan.jpg','국제시장':'assets/gukje.jpg','암남공원':'assets/amnam.jpg','초량 이바구길':'assets/choryang.jpg','부산항 북항':'assets/northport.jpg','흰여울문화마을':'assets/huinnyeoul.jpg','태종대':'assets/taejongdae.jpg','서면':'assets/seomyeon.jpg','전포카페거리':'assets/jeonpo.jpg','오륙도스카이워크':'assets/oryukdo.jpg','이기대 해안산책로':'assets/igidae.jpg','화명생태공원':'assets/hwamyeong.jpg','구포시장':'assets/gupo.jpg','해운대해수욕장':'assets/haeundae.jpg','청사포':'assets/cheongsapo.jpg','감천문화마을':'assets/gamcheon.jpg','범어사':'assets/beomeosa.jpg','부산아시아드주경기장':'assets/asiad.jpg','사상근린공원':'assets/sasang-park.jpg','광안리해수욕장':'assets/gwangalli.jpg','오시리아 관광단지':'assets/osiria.jpg','대저생태공원':'assets/daejeo.jpg'
};
touristSpots.forEach(spot=>spot.theme=spotThemes[spot.name]);
function renderRecommendations(filter='전체'){
 const visible=filter==='전체'?touristSpots:touristSpots.filter(spot=>spot.theme===filter);
 document.querySelector('#recommendTitle').textContent=filter==='전체'?`지금 가기 좋은 부산 명소 ${visible.length}곳`:`${filter} 명소 ${visible.length}곳`;
 cards.innerHTML=visible.map(spot=>{const image=spotImages[spot.name];const level=spot.crowd>=70?'high':spot.crowd>=40?'medium':'low';return `<article class="mini-card spot-card"><div class="mini-art ${level}">${image?`<img src="${image}" alt="${spot.name}">`:`<span>${spot.theme==='자연·산책'?'♧':spot.theme==='문화·전시'?'⌂':'✦'}</span>`}</div><div class="spot-meta"><b>${spot.name}</b><p>${spot.district} · 혼잡도 <strong class="${level}">${spot.crowd}%</strong></p><small>${spot.theme}</small></div></article>`;}).join('');
}
renderRecommendations();

let crowdMap, spotMarkers=[];
const crowdLevel=value=>value>=70?'high':value>=40?'medium':'low';
const crowdText=value=>value>=70?'혼잡':value>=40?'보통':'여유';
function updateMapPins(){spotMarkers.forEach(({spot,marker})=>{const level=crowdLevel(spot.crowd);marker.setIcon(L.divIcon({className:'',html:`<div class="crowd-marker ${level}">${spot.crowd}</div>`,iconSize:[34,34],iconAnchor:[17,17]}));marker.bindPopup(`<div class="map-popup"><b>${spot.name}</b><small>${spot.district} · 실시간 분석</small><strong>${spot.crowd}% · ${crowdText(spot.crowd)}</strong></div>`);});}
function openSpot(spot){document.querySelector('#placeTitle').textContent=spot.name;document.querySelector('#placeDensity').innerHTML=`${spot.crowd}% <em>${crowdText(spot.crowd)}</em>`;const alternative=touristSpots.filter(item=>item.district!==spot.district).sort((a,b)=>a.crowd-b.crowd)[0];document.querySelector('#placeAlt').textContent=`${alternative.name} · ${alternative.crowd}%`;}
function startBusanMap(){if(!window.L)return;crowdMap=L.map('busanMap',{zoomControl:false,attributionControl:true}).setView([35.165,129.065],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(crowdMap);L.control.zoom({position:'bottomright'}).addTo(crowdMap);spotMarkers=touristSpots.map(spot=>{const marker=L.marker([spot.lat,spot.lng]).addTo(crowdMap);marker.on('click',()=>openSpot(spot));return{spot,marker};});updateMapPins();}
async function refreshCrowdData(){try{const response=await fetch('/api/crowd');if(!response.ok)throw new Error('fallback');const payload=await response.json();const incoming=new Map(payload.places.map(item=>[item.id,item.crowd]));touristSpots.forEach(spot=>{if(incoming.has(spot.id))spot.crowd=incoming.get(spot.id);});}catch{ /* API 연결 전에는 데모 혼잡도 값을 유지합니다. */ }updateMapPins();const current=new Date();const label=`${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')} 갱신`;document.querySelector('#syncTime').textContent=label;}
startBusanMap();
setInterval(refreshCrowdData,600000);
