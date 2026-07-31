const pages=document.querySelectorAll('.app-page'),tabs=document.querySelectorAll('.tab');
function updateGreeting(){const user=window.currentSeaPointUser||'Guest';document.querySelector('#greeting').textContent=`${user} 님! 안녕하세요`;}
function showPage(name){pages.forEach(page=>page.classList.toggle('active',page.dataset.page===name));tabs.forEach(tab=>tab.classList.toggle('active',tab.dataset.target===name));if(name==='map'){setTimeout(()=>map.invalidateSize(),30);}updateGreeting();}
tabs.forEach(tab=>tab.addEventListener('click',()=>showPage(tab.dataset.target)));updateGreeting();
