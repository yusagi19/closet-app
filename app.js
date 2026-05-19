'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────

const OWNERS = [
  { id: 'self',    label: '母', color: '#D4607A', bg: '#FFF0F3' },
  { id: 'husband', label: '父', color: '#2E78AE', bg: '#EEF4FB' },
  { id: 'son',     label: '子', color: '#27AE60', bg: '#EEF9F2' },
];

const CATEGORIES = [
  { id: 'tops',        label: 'トップス',           icon: '👕' },
  { id: 'bottoms',     label: 'ボトムス',           icon: '👖' },
  { id: 'outer',       label: 'アウター',           icon: '🧥' },
  { id: 'dress',       label: 'ワンピース',           icon: '👗' },
  { id: 'shoes',       label: '靴',                icon: '👟' },
  { id: 'bags',        label: 'バッグ',             icon: '👜' },
  { id: 'accessories', label: 'アクセサリー',        icon: '💍' },
  { id: 'underwear',   label: '下着・ソックス',      icon: '🧦' },
  { id: 'sports',      label: 'スポーツウェア',      icon: '🏃' },
  { id: 'skincare',    label: 'スキンケア',          icon: '🧴' },
  { id: 'cosmetics',   label: 'コスメ',             icon: '💄' },
  { id: 'other',       label: 'その他',             icon: '📦' },
];

const COLORS = [
  { id: 'white',    label: 'ホワイト',   hex: '#F5F5F5' },
  { id: 'ivory',    label: 'アイボリー', hex: '#FFFFF0' },
  { id: 'beige',    label: 'ベージュ',   hex: '#D4B896' },
  { id: 'gray',     label: 'グレー',     hex: '#8E8E93' },
  { id: 'black',    label: 'ブラック',   hex: '#1C1C1E' },
  { id: 'navy',     label: 'ネイビー',   hex: '#1B3A6B' },
  { id: 'blue',     label: 'ブルー',     hex: '#2C7BE5' },
  { id: 'green',    label: 'グリーン',   hex: '#34C759' },
  { id: 'khaki',    label: 'カーキ',     hex: '#6B7C45' },
  { id: 'red',      label: 'レッド',     hex: '#FF3B30' },
  { id: 'pink',     label: 'ピンク',     hex: '#FF69B4' },
  { id: 'lavender', label: 'ラベンダー', hex: '#B57BDB' },
  { id: 'yellow',   label: 'イエロー',   hex: '#FFCC00' },
  { id: 'orange',   label: 'オレンジ',   hex: '#FF9500' },
  { id: 'brown',    label: 'ブラウン',   hex: '#A0522D' },
  { id: 'gold',     label: 'ゴールド',   hex: '#C9A84C' },
  { id: 'silver',   label: 'シルバー',   hex: '#A8A9AD' },
  { id: 'multi',    label: 'マルチ',     hex: '#FF6B6B' },
  { id: 'other',    label: 'その他',     hex: '#C7C7CC' },
];

// ── State ─────────────────────────────────────────────────────────────────────

const navStack = [];

const state = {
  view:       'home',
  viewParams: {},
  tab:        'home',
  items:      [],
  filter:     { owner: 'all', category: 'all' },
  search:     { query: '', owner: 'all', category: 'all', color: 'all' },
  photoData:  null,
};

// ── Utils ─────────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function fmtDate(s) {
  if (!s) return '―';
  const d = new Date(s + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function fmtPrice(n) {
  if (n == null || n === '') return '―';
  return `¥${Number(n).toLocaleString('ja-JP')}`;
}

function ownerOf(id)    { return OWNERS.find(o => o.id === id); }
function categoryOf(id) { return CATEGORIES.find(c => c.id === id); }
function colorOf(id)    { return COLORS.find(c => c.id === id); }

async function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const s = Math.min(MAX / w, MAX / h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });
}

// ── Filtering ─────────────────────────────────────────────────────────────────

function applyFilter(items, { owner, category }) {
  return items.filter(item => {
    if (owner    !== 'all' && item.owner    !== owner)    return false;
    if (category !== 'all' && item.category !== category) return false;
    return true;
  });
}

function applySearch(items, { query, owner, category, color }) {
  const q = query.trim().toLowerCase();
  return items.filter(item => {
    if (owner    !== 'all' && item.owner    !== owner)    return false;
    if (category !== 'all' && item.category !== category) return false;
    if (color    !== 'all' && item.color    !== color)    return false;
    if (q) {
      const hay = [item.name, item.brand, item.notes].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ── Navigation ────────────────────────────────────────────────────────────────

function navigate(view, params = {}) {
  navStack.push({ view: state.view, params: state.viewParams });
  state.view = view;
  state.viewParams = params;
  render();
}

function goBack() {
  if (navStack.length > 0) {
    const prev = navStack.pop();
    state.view = prev.view;
    state.viewParams = prev.params;
    render();
  }
}

function switchTab(tab) {
  navStack.length = 0;
  state.tab = tab;
  state.view = tab;
  state.viewParams = {};
  render();
}

// ── Render ────────────────────────────────────────────────────────────────────

const $root = () => document.getElementById('root');

const VIEW_MAP = {
  home:   renderHome,
  search: renderSearch,
  stats:  renderStats,
  add:    renderForm,
  edit:   renderForm,
  detail: renderDetail,
};

function render() {
  $root().innerHTML = (VIEW_MAP[state.view] || renderHome)();
  window.scrollTo(0, 0);
}

// ── Home ──────────────────────────────────────────────────────────────────────

function renderHome() {
  const filtered = applyFilter(state.items, state.filter);

  return `
    <div class="screen">
      <div class="app-header">
        <h1 class="app-title">アイテム管理</h1>
      </div>

      <div class="owner-tabs">
        ${ownerTab('all', '全員')}
        ${OWNERS.map(o => ownerTab(o.id, o.label)).join('')}
      </div>

      <div class="category-scroll">
        <div class="category-chips">
          ${catChip('all', '全て')}
          ${CATEGORIES.map(c => catChip(c.id, `${c.icon} ${c.label}`)).join('')}
        </div>
      </div>

      <div class="scroll-body">
        <div class="item-count">${filtered.length}件</div>
        ${filtered.length > 0
          ? `<div class="item-grid">${filtered.map(itemCard).join('')}</div>`
          : `<div class="empty-state">
               <div class="empty-icon">👗</div>
               <p class="empty-title">アイテムがありません</p>
               <p class="empty-sub">右下の＋から追加しましょう</p>
             </div>`
        }
      </div>

      <button class="fab" data-action="add">＋</button>
      ${bottomNav()}
    </div>`;
}

function ownerTab(id, label) {
  const active = state.filter.owner === id;
  const o = ownerOf(id);
  const style = active && o ? `style="color:${o.color};border-color:${o.color}"` : '';
  return `<button class="owner-tab${active ? ' active' : ''}" data-action="filterOwner" data-value="${id}" ${style}>${label}</button>`;
}

function catChip(id, label) {
  const active = state.filter.category === id;
  return `<button class="cat-chip${active ? ' active' : ''}" data-action="filterCat" data-value="${id}">${label}</button>`;
}

function itemCard(item) {
  const o   = ownerOf(item.owner);
  const cat = categoryOf(item.category);
  return `
    <div class="item-card" data-action="detail" data-id="${item.id}">
      <div class="item-card-photo">
        ${item.photo
          ? `<img src="${item.photo}" alt="${escHtml(item.name)}" loading="lazy">`
          : `<div class="item-card-no-photo">${cat ? cat.icon : '📦'}</div>`}
        ${o ? `<div class="item-card-owner-dot" style="background:${o.color}"></div>` : ''}
      </div>
      <div class="item-card-info">
        ${cat ? `<span class="item-cat-badge">${cat.icon} ${cat.label}</span>` : ''}
        ${item.brand ? `<p class="item-brand">${escHtml(item.brand)}</p>` : ''}
        <p class="item-name">${escHtml(item.name) || '名称未設定'}</p>
        ${item.price != null && item.price !== '' ? `<p class="item-price">${fmtPrice(item.price)}</p>` : ''}
      </div>
    </div>`;
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Search ────────────────────────────────────────────────────────────────────

function renderSearch() {
  const results = applySearch(state.items, state.search);

  return `
    <div class="screen">
      <div class="app-header">
        <h1 class="app-title">検索</h1>
      </div>

      <div class="search-box-wrap">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input id="search-input" type="text" class="search-input"
            placeholder="ブランド・アイテム名で検索"
            value="${escHtml(state.search.query)}">
        </div>
      </div>

      <div class="filter-section">
        <p class="filter-label">所有者</p>
        <div class="filter-chips">
          ${searchChip('owner','all','全員')}
          ${OWNERS.map(o => searchChip('owner', o.id, o.label)).join('')}
        </div>

        <p class="filter-label">カテゴリ</p>
        <div class="filter-chips">
          ${searchChip('category','all','全て')}
          ${CATEGORIES.map(c => searchChip('category', c.id, `${c.icon} ${c.label}`)).join('')}
        </div>

        <p class="filter-label">カラー</p>
        <div class="filter-chips">
          ${searchChip('color','all','全て')}
          ${COLORS.map(c => `
            <button class="filter-chip${state.search.color === c.id ? ' active' : ''}"
              data-action="searchFilter" data-type="color" data-value="${c.id}">
              <span class="color-dot" style="background:${c.hex}"></span>${c.label}
            </button>`).join('')}
        </div>
      </div>

      <div class="scroll-body">
        <div class="item-count">${results.length}件</div>
        ${results.length > 0
          ? `<div class="item-grid">${results.map(itemCard).join('')}</div>`
          : `<div class="empty-state">
               <div class="empty-icon">🔍</div>
               <p class="empty-title">見つかりません</p>
             </div>`}
      </div>

      ${bottomNav()}
    </div>`;
}

function searchChip(type, value, label) {
  const active = state.search[type] === value;
  return `<button class="filter-chip${active ? ' active' : ''}"
    data-action="searchFilter" data-type="${type}" data-value="${value}">${label}</button>`;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function renderStats() {
  const items      = state.items;
  const total      = items.length;
  const totalPrice = items.reduce((s, i) => s + (Number(i.price) || 0), 0);

  return `
    <div class="screen">
      <div class="app-header">
        <h1 class="app-title">統計</h1>
      </div>

      <div class="scroll-body">
        <div class="stats-summary">
          <div class="stat-card">
            <p class="stat-num">${total}</p>
            <p class="stat-label">合計アイテム</p>
          </div>
          <div class="stat-card">
            <p class="stat-num" style="font-size:${totalPrice >= 1000000 ? '18px' : '24px'}">${fmtPrice(totalPrice)}</p>
            <p class="stat-label">合計金額</p>
          </div>
        </div>

        <div class="stats-section">
          <h3 class="stats-heading">家族別</h3>
          ${OWNERS.map(o => {
            const own = items.filter(i => i.owner === o.id);
            const amt = own.reduce((s, i) => s + (Number(i.price) || 0), 0);
            return `
              <div class="stats-row">
                <div class="stats-row-label">
                  <span class="stats-dot" style="background:${o.color}"></span>${o.label}
                </div>
                <div class="stats-row-values">
                  <span class="stats-count">${own.length}点</span>
                  <span class="stats-amount">${fmtPrice(amt)}</span>
                </div>
              </div>`;
          }).join('')}
        </div>

        <div class="stats-section">
          <h3 class="stats-heading">カテゴリ別</h3>
          ${CATEGORIES.map(cat => {
            const ci = items.filter(i => i.category === cat.id);
            if (!ci.length) return '';
            const amt = ci.reduce((s, i) => s + (Number(i.price) || 0), 0);
            return `
              <div class="stats-row">
                <div class="stats-row-label">${cat.icon} ${cat.label}</div>
                <div class="stats-row-values">
                  <span class="stats-count">${ci.length}点</span>
                  <span class="stats-amount">${fmtPrice(amt)}</span>
                </div>
              </div>`;
          }).join('')}
          ${items.length === 0 ? '<div class="stats-row"><div class="stats-row-label" style="color:var(--text-3)">データなし</div></div>' : ''}
        </div>

        <div class="stats-section">
          <h3 class="stats-heading">データ管理</h3>
          <div class="backup-body">
            <p class="backup-desc">アイテムデータをJSONファイルに保存・復元できます。ホーム画面からアプリを削除する前にバックアップしておくと安心です。</p>
            <button class="btn-backup" data-action="exportData">📤 バックアップを保存</button>
            <button class="btn-backup btn-backup-import" data-action="importData">📥 バックアップから復元</button>
            <input type="file" id="import-input" accept=".json" style="display:none">
          </div>
        </div>
      </div>

      ${bottomNav()}
    </div>`;
}

// ── Add / Edit Form ───────────────────────────────────────────────────────────

function renderForm() {
  const isEdit = state.view === 'edit';
  const src    = isEdit ? state.viewParams.item : null;
  const photo  = state.photoData;

  function val(field) {
    return escHtml(src ? (src[field] ?? '') : '');
  }
  function sel(field, id) {
    return (src && src[field] === id) ? 'selected' : '';
  }
  function checked(id) {
    return (src && src.owner === id) ? 'checked' : '';
  }
  function radioActive(id) {
    return (src && src.owner === id);
  }
  function radioStyle(o) {
    return radioActive(o.id) ? `style="border-color:${o.color};background:${o.bg};color:${o.color}"` : '';
  }

  return `
    <div class="screen screen-form">
      <div class="form-header">
        <button class="btn-text" data-action="back">キャンセル</button>
        <span class="form-title">${isEdit ? 'アイテムを編集' : 'アイテムを追加'}</span>
        <button class="btn-text btn-primary" data-action="save">保存</button>
      </div>

      <div class="form-scroll" id="form-scroll">

        <div class="photo-picker" data-action="pickPhoto">
          ${photo
            ? `<img src="${photo}" class="photo-preview" alt="写真">
               <div class="photo-change-overlay">タップして変更</div>`
            : `<div class="photo-placeholder">
                 <span class="photo-icon">📷</span>
                 <p>写真を追加</p>
               </div>`}
        </div>
        <input type="file" id="photo-input" accept="image/*" style="display:none">

        <div class="form-group">
          <label class="form-label">所有者 <span class="required">*</span></label>
          <div class="radio-group">
            ${OWNERS.map(o => `
              <label class="radio-option${radioActive(o.id) ? ' active' : ''}" ${radioStyle(o)}>
                <input type="radio" name="owner" value="${o.id}" ${checked(o.id)} style="display:none">
                ${o.label}
              </label>`).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">カテゴリ <span class="required">*</span></label>
          <select class="form-select" id="f-category">
            <option value="">選択してください</option>
            ${CATEGORIES.map(c => `<option value="${c.id}" ${sel('category', c.id)}>${c.icon} ${c.label}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">アイテム名</label>
          <input type="text" class="form-input" id="f-name"
            placeholder="例：白Tシャツ" value="${val('name')}">
        </div>

        <div class="form-group">
          <label class="form-label">ブランド</label>
          <input type="text" class="form-input" id="f-brand"
            placeholder="例：UNIQLO" value="${val('brand')}">
        </div>

        <div class="form-group">
          <label class="form-label">カラー</label>
          <select class="form-select" id="f-color">
            <option value="">選択してください</option>
            ${COLORS.map(c => `<option value="${c.id}" ${sel('color', c.id)}>${c.label}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">サイズ</label>
          <input type="text" class="form-input" id="f-size"
            placeholder="例：M、38、25cm" value="${val('size')}">
        </div>

        <div class="form-group">
          <label class="form-label">購入日</label>
          <input type="date" class="form-input" id="f-date" value="${val('purchaseDate')}">
        </div>

        <div class="form-group">
          <label class="form-label">購入価格</label>
          <div class="input-prefix">
            <span class="prefix">¥</span>
            <input type="number" class="form-input" id="f-price"
              placeholder="0" min="0" value="${src && src.price != null ? src.price : ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">メモ</label>
          <textarea class="form-input form-textarea" id="f-notes"
            placeholder="素材、購入場所、コーデメモなど">${src ? escHtml(src.notes || '') : ''}</textarea>
        </div>

        ${isEdit ? `<button class="btn-delete" data-action="delete" data-id="${src.id}">このアイテムを削除</button>` : ''}
      </div>
    </div>`;
}

// ── Detail ────────────────────────────────────────────────────────────────────

function renderDetail() {
  const item = state.items.find(i => i.id === state.viewParams.id);
  if (!item) return `<div class="screen"><div class="empty-state"><p>アイテムが見つかりません</p></div></div>`;

  const o   = ownerOf(item.owner);
  const cat = categoryOf(item.category);
  const col = colorOf(item.color);

  return `
    <div class="screen screen-detail">
      <div class="detail-header">
        <button class="btn-back" data-action="back">‹ 戻る</button>
        <div class="detail-header-actions">
          <button class="btn-icon" data-action="edit" data-id="${item.id}" title="編集">✎</button>
          <button class="btn-icon btn-danger" data-action="delete" data-id="${item.id}" title="削除">🗑</button>
        </div>
      </div>

      <div class="detail-scroll">
        ${item.photo
          ? `<img src="${item.photo}" class="detail-photo" alt="${escHtml(item.name)}">`
          : `<div class="detail-no-photo">${cat ? cat.icon : '📦'}</div>`}

        <div class="detail-body">
          <div class="detail-badges">
            ${o   ? `<span class="badge" style="color:${o.color};background:${o.bg}">${o.label}</span>` : ''}
            ${cat ? `<span class="badge badge-cat">${cat.icon} ${cat.label}</span>` : ''}
          </div>

          ${item.brand ? `<p class="detail-brand">${escHtml(item.brand)}</p>` : ''}
          <h2 class="detail-name">${escHtml(item.name) || '名称未設定'}</h2>

          <div class="detail-table">
            ${item.purchaseDate ? `
              <div class="detail-row">
                <span class="detail-key">購入日</span>
                <span class="detail-val">${fmtDate(item.purchaseDate)}</span>
              </div>` : ''}
            ${item.price != null && item.price !== '' ? `
              <div class="detail-row">
                <span class="detail-key">購入価格</span>
                <span class="detail-val price">${fmtPrice(item.price)}</span>
              </div>` : ''}
            ${col ? `
              <div class="detail-row">
                <span class="detail-key">色</span>
                <span class="detail-val">
                  <span class="color-dot" style="background:${col.hex}"></span>${col.label}
                </span>
              </div>` : ''}
            ${item.size ? `
              <div class="detail-row">
                <span class="detail-key">サイズ</span>
                <span class="detail-val">${escHtml(item.size)}</span>
              </div>` : ''}
          </div>

          ${item.notes ? `
            <div class="detail-notes">
              <p class="detail-notes-label">メモ</p>
              <p class="detail-notes-text">${escHtml(item.notes)}</p>
            </div>` : ''}
        </div>
      </div>
    </div>`;
}

// ── Shared components ─────────────────────────────────────────────────────────

function bottomNav() {
  const tabs = [
    { id: 'home',   icon: '🏠', label: 'ホーム' },
    { id: 'search', icon: '🔍', label: '検索' },
    { id: 'stats',  icon: '📊', label: '統計' },
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map(t => `
        <button class="nav-item${state.tab === t.id ? ' active' : ''}"
          data-action="tab" data-tab="${t.id}">
          <span class="nav-icon">${t.icon}</span>
          <span class="nav-label">${t.label}</span>
        </button>`).join('')}
    </nav>`;
}

// ── Event Handling ────────────────────────────────────────────────────────────

let searchTimer = null;

function handleClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, value, type, tab, id } = el.dataset;

  switch (action) {
    case 'add':
      state.photoData = null;
      navigate('add', {});
      break;

    case 'back':
      goBack();
      break;

    case 'tab':
      switchTab(tab);
      break;

    case 'filterOwner':
      state.filter.owner = value;
      render();
      break;

    case 'filterCat':
      state.filter.category = value;
      render();
      break;

    case 'searchFilter':
      state.search[type] = value;
      render();
      // Restore focus to search input
      const si = document.getElementById('search-input');
      if (si) { si.focus(); si.setSelectionRange(si.value.length, si.value.length); }
      break;

    case 'detail':
      navigate('detail', { id });
      break;

    case 'edit': {
      const item = state.items.find(i => i.id === id);
      if (item) {
        state.photoData = item.photo || null;
        navigate('edit', { item });
      }
      break;
    }

    case 'delete':
      deleteItem(id);
      break;

    case 'pickPhoto':
      document.getElementById('photo-input')?.click();
      break;

    case 'save':
      saveItem();
      break;

    case 'exportData':
      exportData();
      break;

    case 'importData':
      document.getElementById('import-input')?.click();
      break;
  }
}

function handleChange(e) {
  // Import JSON
  if (e.target.id === 'import-input') {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = '';
    return;
  }

  // Photo picked
  if (e.target.id === 'photo-input') {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file).then(data => {
      state.photoData = data;
      const picker = document.querySelector('.photo-picker');
      if (picker) {
        picker.innerHTML = `
          <img src="${data}" class="photo-preview" alt="写真">
          <div class="photo-change-overlay">タップして変更</div>`;
      }
    });
    return;
  }

  // Owner radio
  if (e.target.name === 'owner') {
    document.querySelectorAll('.radio-option').forEach(el => {
      el.classList.remove('active');
      el.style.cssText = '';
    });
    const o = ownerOf(e.target.value);
    const label = e.target.closest('.radio-option');
    if (label && o) {
      label.classList.add('active');
      label.style.borderColor = o.color;
      label.style.background  = o.bg;
      label.style.color       = o.color;
    }
  }
}

function handleInput(e) {
  if (e.target.id === 'search-input') {
    state.search.query = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const si = document.getElementById('search-input');
      const pos = si?.selectionStart;
      render();
      const restored = document.getElementById('search-input');
      if (restored) { restored.focus(); restored.setSelectionRange(pos, pos); }
    }, 200);
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function getFormValues() {
  return {
    owner:        (document.querySelector('input[name="owner"]:checked') || {}).value || '',
    category:     (document.getElementById('f-category') || {}).value || '',
    name:         (document.getElementById('f-name')     || {}).value || '',
    brand:        (document.getElementById('f-brand')    || {}).value || '',
    color:        (document.getElementById('f-color')    || {}).value || '',
    size:         (document.getElementById('f-size')     || {}).value || '',
    purchaseDate: (document.getElementById('f-date')     || {}).value || '',
    price:        (document.getElementById('f-price')    || {}).value,
    notes:        (document.getElementById('f-notes')    || {}).value || '',
  };
}

async function saveItem() {
  const f = getFormValues();
  if (!f.owner)    { alert('所有者を選択してください'); return; }
  if (!f.category) { alert('カテゴリを選択してください'); return; }

  const isEdit = state.view === 'edit';
  const item = {
    id:           isEdit ? state.viewParams.item.id : uid(),
    owner:        f.owner,
    category:     f.category,
    name:         f.name,
    brand:        f.brand,
    color:        f.color,
    size:         f.size,
    purchaseDate: f.purchaseDate,
    price:        f.price !== '' ? Number(f.price) : null,
    notes:        f.notes,
    photo:        state.photoData,
    createdAt:    isEdit ? state.viewParams.item.createdAt : new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };

  try {
    if (isEdit) {
      await db.put(item);
      const idx = state.items.findIndex(i => i.id === item.id);
      if (idx !== -1) state.items[idx] = item;
    } else {
      await db.add(item);
      state.items.unshift(item);
    }
    state.photoData = null;
    goBack();
    // If we came from detail, refresh it
    if (state.view === 'detail') render();
  } catch (err) {
    console.error(err);
    alert('保存に失敗しました');
  }
}

async function deleteItem(id) {
  if (!confirm('このアイテムを削除しますか？')) return;
  try {
    await db.remove(id);
    state.items = state.items.filter(i => i.id !== id);
    navStack.length = 0;
    state.view = 'home';
    state.tab  = 'home';
    state.viewParams = {};
    render();
  } catch (err) {
    console.error(err);
    alert('削除に失敗しました');
  }
}

// ── Backup / Restore ─────────────────────────────────────────────────────────

function exportData() {
  if (state.items.length === 0) {
    alert('エクスポートするアイテムがありません');
    return;
  }
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: state.items,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `closet-backup-${date}.json`;

  // iOSはWeb Share APIでファイル共有
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/json' })] })) {
    const file = new File([blob], filename, { type: 'application/json' });
    navigator.share({ files: [file], title: 'クローゼット バックアップ' })
      .catch(err => { if (err.name !== 'AbortError') alert('保存に失敗しました'); });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

async function importData(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incoming = Array.isArray(parsed) ? parsed : (parsed.items || []);

    if (!incoming.length) { alert('有効なデータが見つかりませんでした'); return; }

    const existingIds = new Set(state.items.map(i => i.id));
    const newItems = incoming.filter(i => !existingIds.has(i.id));

    if (!confirm(`${incoming.length}件のデータが見つかりました。\n新規追加: ${newItems.length}件\n\n復元しますか？`)) return;

    for (const item of newItems) {
      await db.add(item);
      state.items.push(item);
    }
    state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    alert(`${newItems.length}件を復元しました！`);
    switchTab('home');
  } catch (err) {
    console.error(err);
    alert('ファイルの読み込みに失敗しました。正しいバックアップファイルか確認してください。');
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  // Persistent event listeners
  document.body.addEventListener('click',  handleClick);
  document.body.addEventListener('change', handleChange);
  document.body.addEventListener('input',  handleInput);

  try {
    await db.open();
    state.items = await db.getAll();
    state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('DB error:', err);
  }

  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }
}

init();
