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
    start().then(home);
  }, true);
})();
