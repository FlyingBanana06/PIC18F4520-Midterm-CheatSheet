// 1. 合併所有分類的題庫
const allProblems = [];
if (typeof problems_lab !== 'undefined') allProblems.push(...problems_lab);
if (typeof problems_A !== 'undefined') allProblems.push(...problems_A);
if (typeof problems_B !== 'undefined') allProblems.push(...problems_B);
if (typeof problems_C !== 'undefined') allProblems.push(...problems_C);
if (typeof problems_D !== 'undefined') allProblems.push(...problems_D);
if (typeof problems_E !== 'undefined') allProblems.push(...problems_E);
if (typeof problems_F !== 'undefined') allProblems.push(...problems_F);
if (typeof problems_G !== 'undefined') allProblems.push(...problems_G);

const problems = allProblems;

// 2. 取得 DOM 元素
const searchEl = document.getElementById('search');
const listEl   = document.getElementById('problem-list');
const contentEl = document.getElementById('content');
const countEl  = document.getElementById('count');

let activeId = null;

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlight(text, q) {
  if (!q) return escapeHtml(text);
  const safeText = escapeHtml(text);
  const safeQ = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safeText.replace(new RegExp('(' + safeQ + ')', 'gi'), '<mark>$1</mark>');
}

function matches(p, q) {
  if (!q) return true;
  const ql = q.toLowerCase();
  return (
    p.title.toLowerCase().includes(ql) ||
    p.category.toLowerCase().includes(ql) ||
    p.description.toLowerCase().includes(ql) ||
    p.tags.some(t => t.toLowerCase().includes(ql))
  );
}

function renderList() {
  const q = searchEl.value.trim();
  const filtered = problems.filter(p => matches(p, q));
  countEl.textContent = filtered.length;
  listEl.innerHTML = '';

  if (filtered.length === 0) {
    listEl.innerHTML = '<li style="cursor:default;color:#999;text-align:center;">找不到符合的題目</li>';
    return;
  }

  filtered.forEach(p => {
    const li = document.createElement('li');
    if (p.id === activeId) li.classList.add('active');
    li.innerHTML =
      '<div class="problem-title">' + highlight(p.title, q) + '</div>' +
      '<div class="problem-cat">' + escapeHtml(p.category) + '</div>';
    li.addEventListener('click', () => {
      activeId = p.id;
      renderList();
      renderDetail(p);
    });
    listEl.appendChild(li);
  });
}

function renderDetail(p) {
  const q = searchEl.value.trim();
  const tagsHtml = p.tags.map(t => '<span class="tag">' + highlight(t, q) + '</span>').join('');

  contentEl.innerHTML =
    '<div class="problem-detail">' +
      '<h2>' + highlight(p.title, q) + '</h2>' +
      '<div class="cat-badge">' + escapeHtml(p.category) + '</div>' +
      '<h3>📄 題目說明</h3>' +
      '<p>' + highlight(p.description, q) + '</p>' +
      '<h3>🧪 範例測試資料</h3>' +
      '<div class="testcase">' + escapeHtml(p.testcase) + '</div>' +
      '<h3>💻 完整程式碼</h3>' +
      '<div class="code-block">' +
        '<div class="code-header">' +
          '<span>' + escapeHtml(p.id) + '.asm</span>' +
          '<button id="copy-btn">📋 複製程式碼</button>' +
        '</div>' +
        '<pre id="code-area"></pre>' +
      '</div>' +
      '<h3>🏷️ 標籤</h3>' +
      '<div class="tags">' + tagsHtml + '</div>' +
    '</div>';

  document.getElementById('code-area').textContent = p.code;

  document.getElementById('copy-btn').addEventListener('click', function() {
    navigator.clipboard.writeText(p.code).then(() => {
      this.textContent = '✅ 已複製！';
      this.classList.add('copied');
      setTimeout(() => {
        this.textContent = '📋 複製程式碼';
        this.classList.remove('copied');
      }, 1500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = p.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.textContent = '✅ 已複製！';
      setTimeout(() => { this.textContent = '📋 複製程式碼'; }, 1500);
    });
  });
}

function resetContent() {
  contentEl.innerHTML = '<div class="empty">👈 請從左側選擇題目，或輸入關鍵字搜尋</div>';
}

searchEl.addEventListener('input', () => {
  renderList();
  const q = searchEl.value.trim();
  const current = problems.find(p => p.id === activeId);
  if (current && !matches(current, q)) {
    activeId = null;
    resetContent();
  }
});

renderList();