(() => {
  const page = document.querySelector('[data-page="community"]');
  const tab = document.querySelector('.tab[data-target="community"]');
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => new Date(value).toLocaleDateString('ko-KR');
  let posts = [];
  let started = false;

  function list(type) {
    const items = posts.filter(post => post.type === type);
    return items.length ? items.map(post => `<button class="community-row" data-post="${post.id}"><b>${esc(post.title)}</b><small>${esc(post.user_id)} · ${date(post.created_at)}</small></button>`).join('') : '<p>등록된 글이 없습니다.</p>';
  }

  function home() {
    page.innerHTML = `<h2>커뮤니티</h2><section><h3>게시글</h3>${list('post')}</section><section><h3>청소 모집 방</h3>${list('recruit')}</section><button id="communityNew" type="button">새 글 쓰기</button>`;
    page.querySelector('#communityNew').onclick = form;
  }

  function form() {
    page.innerHTML = `<button id="communityBack" type="button">←</button><h2>새 글 쓰기</h2><select id="communityType"><option value="post">게시글</option><option value="recruit">청소 모집 방</option></select><input id="communityTitle" placeholder="제목"><textarea id="communityContent" placeholder="내용"></textarea><input id="communityCapacity" type="number" min="1" placeholder="모집 인원"><p id="communityMessage"></p><button id="communitySave" type="button">등록</button>`;
    page.querySelector('#communityBack').onclick = home;
    page.querySelector('#communitySave').onclick = save;
  }

  async function save() {
    const auth = await window.firebaseAuth();
    const account = auth.auth.currentUser;
    const title = page.querySelector('#communityTitle').value.trim();
    const type = page.querySelector('#communityType').value;
    const capacity = Number(page.querySelector('#communityCapacity').value) || 0;
    const message = page.querySelector('#communityMessage');
    if (!account) { message.textContent = '로그인 후 등록할 수 있습니다.'; return; }
    if (!title || (type === 'recruit' && !capacity)) { message.textContent = '제목과 모집 인원을 확인해 주세요.'; return; }
    const [{getApp}, {getFirestore, collection, addDoc}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);
    await addDoc(collection(getFirestore(getApp('seapoint-auth')), 'community_posts'), {
      user_id: account.email.replace('@seapoint.local', ''), title,
      content: page.querySelector('#communityContent').value.trim(), type, capacity,
      members: [], created_at: new Date().toISOString()
    });
    home();
  }

  async function start() {
    if (started) return;
    started = true;
    const [{getApp}, {getFirestore, collection, query, orderBy, onSnapshot}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);
    const db = getFirestore(getApp('seapoint-auth'));
    onSnapshot(query(collection(db, 'community_posts'), orderBy('created_at', 'desc')), snapshot => {
      posts = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      home();
    });
  }

  tab.addEventListener('click', event => {
    event.stopImmediatePropagation();
    document.querySelectorAll('.app-page').forEach(item => item.classList.toggle('active', item === page));
    document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
    home();
    start().catch(() => {});
  }, true);
})();
