// ============================================================
// SIRIAI PM — App (router, views, components)
// ============================================================

/* globals Store, CONFIG */

// ── CONSTANTS ────────────────────────────────────────────────
const STATUSES = [
  '1. 브랜드 소통',
  '2. 모집중',
  '3. 컨펌 단계',
  '4. 컨텐츠 업로드',
  '5. 캠페인 종료',
  '6. 입금 확인',
  '7. 상시 진행',
  '기타/이슈',
];

const STATUS_META = {
  '1. 브랜드 소통':   { cls: 's1', label: '브랜드 소통' },
  '2. 모집중':        { cls: 's2', label: '모집중' },
  '3. 컨펌 단계':     { cls: 's3', label: '컨펌 단계' },
  '4. 컨텐츠 업로드': { cls: 's4', label: '업로드' },
  '5. 캠페인 종료':   { cls: 's5', label: '캠페인 종료' },
  '6. 입금 확인':     { cls: 's6', label: '입금 확인' },
  '7. 상시 진행':     { cls: 's7', label: '상시 진행' },
  '기타/이슈':        { cls: 'sX', label: '이슈' },
};

const ACTIVE_STATUSES = ['1. 브랜드 소통','2. 모집중','3. 컨펌 단계','4. 컨텐츠 업로드','7. 상시 진행'];

const PAY_META = {
  '입금완료': { cls: 'pay-done',    label: '입금완료' },
  '미입금':   { cls: 'pay-unpaid',  label: '미입금' },
  '부분입금': { cls: 'pay-partial', label: '부분입금' },
  '분쟁':     { cls: 'pay-dispute', label: '분쟁' },
  '해당없음': { cls: 'pay-na',      label: '해당없음' },
};

const QA_META = {
  '검수전': { cls: 'qa-검수전', label: '검수전' },
  '검수중': { cls: 'qa-검수중', label: '검수중' },
  '완료':   { cls: 'qa-완료',   label: '완료' },
  '이슈':   { cls: 'qa-이슈',   label: '이슈' },
};

// ── UTILS ─────────────────────────────────────────────────────
const fmt = {
  money: n => n ? (n / 10000).toFixed(0) + '만' : '—',
  moneyFull: n => n ? n.toLocaleString('ko-KR') + '원' : '—',
  date: s => s ? s.slice(0, 10) : '—',
  pct: n => n ? n + '%' : '—',
};

function dday(c) {
  if (c._dday === null || c._dday === undefined) return '';
  if (c._dday < 0) return `D+${Math.abs(c._dday)}`;
  if (c._dday === 0) return 'D-DAY';
  return `D-${c._dday}`;
}

function ddayCls(c) {
  const done = ['5. 캠페인 종료','6. 입금 확인'].includes(c.status);
  if (done || c._dday === null) return 'past';
  if (c._dday < 0) return 'past';
  if (c._dday <= 2) return 'urgent';
  if (c._dday <= 7) return 'near';
  return 'ok';
}

function statusBadge(status, clickable = false) {
  const m = STATUS_META[status] || { cls: 's1', label: status };
  return `<span class="badge ${m.cls}"${clickable ? ' data-status-btn' : ''}><span class="badge-dot"></span>${m.label}</span>`;
}

function payBadge(pay) {
  if (!pay) return '—';
  const m = PAY_META[pay] || { cls: 'pay-na', label: pay };
  return `<span class="${m.cls}">${m.label}</span>`;
}

function qaBadge(qa) {
  if (!qa) return `<span class="qa-검수전">검수전</span>`;
  const m = QA_META[qa] || { cls: 'qa-검수전', label: qa };
  return `<span class="${m.cls}">${m.label}</span>`;
}

function progressBar(sel, up) {
  if (!sel) return '<span class="text-muted text-sm">—</span>';
  const pct = Math.round((up / sel) * 100);
  const cls = pct >= 100 ? 'full' : pct > 0 ? 'partial' : 'zero';
  return `<div class="progress-cell">
    <div class="progress-nums"><strong>${up}</strong>/${sel} <span class="text-xs">(${pct}%)</span></div>
    <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
  </div>`;
}

function linkBtn(href, label, cls = '') {
  if (!href) return '';
  return `<a href="${href}" target="_blank" rel="noopener" class="link-btn ${cls}">${label} ↗</a>`;
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── STATE ──────────────────────────────────────────────────────
const State = {
  view: 'dashboard',
  drawerCampaignId: null,
  drawerTab: 'info',
  filters: { tab: 'all', search: '', entity: '', country: '', client: '', status: '' },
  sort: { col: null, dir: 1 },
  financeMonth: null,
};

// ── TOAST ──────────────────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ── NOTIFICATIONS ──────────────────────────────────────────────
function computeAlerts() {
  const campaigns = Store.getCampaigns().filter(c => !c.is_archived);
  const alerts = { urgent: [], warn: [], unpaid: [], qa: [], issue: [] };
  const today = new Date(); today.setHours(0,0,0,0);

  campaigns.forEach(c => {
    if (ACTIVE_STATUSES.includes(c.status)) {
      if (c._dday !== null && c._dday >= 0 && c._dday <= 2) alerts.urgent.push(c);
      else if (c._dday !== null && c._dday > 2 && c._dday <= 7) alerts.warn.push(c);
    }
    if (['미입금','부분입금'].includes(c.pay_status) && c.revenue > 0) alerts.unpaid.push(c);
    if (c.qa_status === '이슈') alerts.qa.push(c);
    if (c.status === '기타/이슈') alerts.issue.push(c);
  });

  return alerts;
}

function renderNotificationBadge() {
  const alerts = computeAlerts();
  const total = alerts.urgent.length + alerts.warn.length + alerts.unpaid.length +
                alerts.qa.length + alerts.issue.length;
  const badge = document.getElementById('notifCount');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? '' : 'none';
  }
  // sidebar badges
  const dashBadge = document.getElementById('dashBadge');
  if (dashBadge) {
    const urgent = alerts.urgent.length + alerts.issue.length;
    dashBadge.textContent = urgent;
    dashBadge.style.display = urgent > 0 ? '' : 'none';
  }
}

function renderNotifDropdown() {
  const alerts = computeAlerts();
  const groups = [
    { key: 'urgent', label: '🔴 D-2 이내 마감', items: alerts.urgent, dot: 'urgent',
      meta: c => dday(c) },
    { key: 'warn',   label: '🟡 D-7 이내 마감', items: alerts.warn,   dot: 'warn',
      meta: c => dday(c) },
    { key: 'unpaid', label: '💸 미입금',          items: alerts.unpaid, dot: 'warn',
      meta: c => fmt.money(c.revenue) + '원' },
    { key: 'qa',     label: '⚠ QA 이슈',          items: alerts.qa,    dot: 'urgent',
      meta: () => 'QA 이슈' },
    { key: 'issue',  label: '🔧 기타/이슈',        items: alerts.issue, dot: 'info',
      meta: () => '확인 필요' },
  ];

  const html = groups.filter(g => g.items.length > 0).map(g => `
    <div class="alert-group">
      <div class="alert-group-title">${g.label} (${g.items.length})</div>
      ${g.items.map(c => `
        <div class="alert-item" onclick="App.openDrawer('${c.id}');Notif.close()">
          <span class="alert-dot ${g.dot}"></span>
          <span class="alert-name">${escHtml(c.name)}</span>
          <span class="alert-meta">${escHtml(g.meta(c))}</span>
        </div>
      `).join('')}
    </div>
  `).join('') || '<div class="alert-empty">알림 없음 ✓</div>';

  document.getElementById('notifBody').innerHTML = html;
}

const Notif = {
  open() {
    renderNotifDropdown();
    document.getElementById('notifDropdown').classList.add('open');
    document.addEventListener('click', Notif._outside, true);
  },
  close() {
    document.getElementById('notifDropdown').classList.remove('open');
    document.removeEventListener('click', Notif._outside, true);
  },
  toggle() {
    const open = document.getElementById('notifDropdown').classList.contains('open');
    open ? Notif.close() : Notif.open();
  },
  _outside(e) {
    const wrap = document.getElementById('notifWrap');
    if (!wrap.contains(e.target)) Notif.close();
  },
};

// ── STATUS DROPDOWN ────────────────────────────────────────────
const StatusDD = {
  _campaignId: null,
  _el: null,

  open(campaignId, anchorEl) {
    StatusDD._campaignId = campaignId;
    StatusDD._el = document.getElementById('statusDropdown');
    const c = Store.getCampaignById(campaignId);
    StatusDD._el.innerHTML = STATUSES.map(s => `
      <div class="status-option${s === c?.status ? ' font-bold' : ''}"
           onclick="StatusDD.select('${s}')">
        ${statusBadge(s)}
      </div>
    `).join('');
    // position near anchor
    const rect = anchorEl.getBoundingClientRect();
    StatusDD._el.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    StatusDD._el.style.left = (rect.left  + window.scrollX)      + 'px';
    StatusDD._el.classList.add('open');
    document.addEventListener('click', StatusDD._outside, true);
  },

  close() {
    document.getElementById('statusDropdown').classList.remove('open');
    document.removeEventListener('click', StatusDD._outside, true);
  },

  async select(newStatus) {
    const c = Store.getCampaignById(StatusDD._campaignId);
    StatusDD.close();
    if (!c || c.status === newStatus) return;

    const FORWARD = STATUSES.indexOf(newStatus) > STATUSES.indexOf(c.status);
    const SPECIAL_BACK = !FORWARD && newStatus !== '기타/이슈' && newStatus !== '7. 상시 진행';
    if (SPECIAL_BACK) {
      Modal.prompt({
        title: '상태 역방향 전환',
        label: `${c.status} → ${newStatus} 사유를 입력하세요`,
        placeholder: '예: 제품 배송 지연으로 재모집',
        onConfirm: async (reason) => {
          await Store.updateStatus(StatusDD._campaignId, newStatus, reason);
          App.renderCurrentView();
          toast('상태가 변경되었습니다', 'ok');
        },
      });
    } else {
      await Store.updateStatus(StatusDD._campaignId, newStatus);
      App.renderCurrentView();
      toast('상태가 변경되었습니다', 'ok');
    }
  },

  _outside(e) {
    const dd = document.getElementById('statusDropdown');
    if (!dd.contains(e.target)) StatusDD.close();
  },
};

// ── MODAL ──────────────────────────────────────────────────────
const Modal = {
  _stack: [],

  show(html, opts = {}) {
    document.getElementById('modalTitle').textContent = opts.title || '';
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  hide() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.getElementById('modalBody').innerHTML = '';
  },

  prompt({ title, label, placeholder, onConfirm }) {
    Modal.show(`
      <div class="field">
        <label>${escHtml(label)}</label>
        <textarea id="promptInput" rows="3" placeholder="${escHtml(placeholder)}"></textarea>
      </div>
    `, { title });
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="Modal.hide()">취소</button>
      <button class="btn btn-primary" onclick="Modal._confirmPrompt()">확인</button>
    `;
    Modal._onConfirm = onConfirm;
    setTimeout(() => document.getElementById('promptInput')?.focus(), 50);
  },

  async _confirmPrompt() {
    const val = document.getElementById('promptInput').value.trim();
    if (!val) { toast('사유를 입력해주세요', 'warn'); return; }
    Modal.hide();
    await Modal._onConfirm(val);
  },

  confirm({ title, message, danger, onConfirm }) {
    Modal.show(`<p style="font-size:13px;color:var(--ink70);line-height:1.6">${escHtml(message)}</p>`, { title });
    document.getElementById('modalFooter').innerHTML = `
      <button class="btn" onclick="Modal.hide()">취소</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" onclick="Modal._confirmAction()">확인</button>
    `;
    Modal._onConfirm = onConfirm;
  },

  async _confirmAction() {
    Modal.hide();
    await Modal._onConfirm();
  },
};

// ── DRAWER ─────────────────────────────────────────────────────
const Drawer = {
  open(campaignId) {
    State.drawerCampaignId = campaignId;
    State.drawerTab = 'info';
    Drawer.render();
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
  },

  close() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
    State.drawerCampaignId = null;
  },

  switchTab(tab) {
    State.drawerTab = tab;
    Drawer.render();
  },

  async render() {
    const c = Store.getCampaignById(State.drawerCampaignId);
    if (!c) return;

    document.getElementById('drawerTitle').textContent = c.name;

    // tabs
    const tabs = [
      { key: 'info',    label: '기본 정보' },
      { key: 'finance', label: '재무' },
      { key: 'qa',      label: 'QA' },
      { key: 'log',     label: '변경 이력' },
    ];
    document.getElementById('drawerTabs').innerHTML = tabs.map(t =>
      `<div class="drawer-tab${t.key === State.drawerTab ? ' active' : ''}"
            onclick="Drawer.switchTab('${t.key}')">${t.label}</div>`
    ).join('');

    // body
    switch (State.drawerTab) {
      case 'info':    Drawer.renderInfo(c);    break;
      case 'finance': Drawer.renderFinance(c); break;
      case 'qa':      Drawer.renderQA(c);      break;
      case 'log':     await Drawer.renderLog(c); break;
    }
  },

  renderInfo(c) {
    const field = (label, key, val, type = 'text') => `
      <div class="drawer-row">
        <span class="drawer-row-label">${label}</span>
        <span class="drawer-row-val">
          <span class="editable-val" onclick="Drawer.editField('${c.id}','${key}','${type}')">${escHtml(val || '—')}</span>
        </span>
      </div>`;

    document.getElementById('drawerBody').innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">상태 & 분류</div>
        <div class="drawer-row">
          <span class="drawer-row-label">상태</span>
          <span class="drawer-row-val">
            <span class="badge ${STATUS_META[c.status]?.cls || 's1'}" style="cursor:pointer"
                  onclick="StatusDD.open('${c.id}', this)">
              <span class="badge-dot"></span>${STATUS_META[c.status]?.label || c.status}
            </span>
          </span>
        </div>
        ${field('진행사', 'entity', c.entity)}
        ${field('거래처', 'client_name', c.client_name)}
        ${field('국가', 'country', c.country)}
        ${field('UV', 'uv', c.uv)}
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">캠페인 정보</div>
        ${field('캠페인명', 'name', c.name)}
        ${field('상세 내용', 'detail', c.detail)}
        ${field('시작일', 'date_start', c.date_start, 'date')}
        ${field('마감일', 'date_end', c.date_end, 'date')}
        ${field('납품예정일', 'date_delivery', c.date_delivery, 'date')}
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">수량</div>
        ${field('제공 수', 'count_provide', c.count_provide, 'number')}
        ${field('선정 수', 'count_select', c.count_select, 'number')}
        ${field('업로드 수', 'count_upload', c.count_upload, 'number')}
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">링크</div>
        ${field('모집 링크', 'link_recruit', c.link_recruit, 'url')}
        ${field('가이드 링크', 'link_guide', c.link_guide, 'url')}
        ${field('진행 시트', 'link_progress', c.link_progress, 'url')}
        ${field('QA 시트', 'link_qa', c.link_qa, 'url')}
        ${c.link_progress ? `<div style="margin-top:8px"><div class="link-row">
          ${linkBtn(c.link_progress,'진행 시트','prog')}
          ${linkBtn(c.link_qa,'QA 시트','qa')}
          ${linkBtn(c.link_guide,'가이드','guide')}
          ${linkBtn(c.link_recruit,'모집','')}
        </div></div>` : ''}
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title">비고</div>
        ${field('비고', 'note', c.note, 'textarea')}
      </div>
    `;
    document.getElementById('drawerFooter').innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="Drawer.archiveConfirm('${c.id}')">아카이브</button>
    `;
  },

  renderFinance(c) {
    const field = (label, key, val, type = 'number') => `
      <div class="drawer-row">
        <span class="drawer-row-label">${label}</span>
        <span class="drawer-row-val">
          <span class="editable-val" onclick="Drawer.editField('${c.id}','${key}','${type}')">${escHtml(val || '—')}</span>
        </span>
      </div>`;

    document.getElementById('drawerBody').innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">재무</div>
        ${field('매출', 'revenue', c.revenue ? c.revenue.toLocaleString() + '원' : null)}
        ${field('원고료', 'fee', c.fee ? c.fee.toLocaleString() + '원' : null)}
        <div class="drawer-row">
          <span class="drawer-row-label">순이익</span>
          <span class="drawer-row-val ${c._profit > 0 ? 'money pos' : ''}">${fmt.moneyFull(c._profit)}</span>
        </div>
        <div class="drawer-row">
          <span class="drawer-row-label">마진율</span>
          <span class="drawer-row-val">${fmt.pct(c._margin)}</span>
        </div>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">정산</div>
        <div class="drawer-row">
          <span class="drawer-row-label">입금 상태</span>
          <span class="drawer-row-val">
            <span class="editable-val" onclick="Drawer.editField('${c.id}','pay_status','select:미입금,입금완료,부분입금,분쟁,해당없음')">${payBadge(c.pay_status)}</span>
          </span>
        </div>
        ${field('견적서 발행일', 'date_quote', c.date_quote, 'date')}
        ${field('세금계산서 발행일', 'date_tax', c.date_tax, 'date')}
      </div>
    `;
    document.getElementById('drawerFooter').innerHTML = '';
  },

  renderQA(c) {
    document.getElementById('drawerBody').innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">QA 상태</div>
        <div class="drawer-row">
          <span class="drawer-row-label">검수 상태</span>
          <span class="drawer-row-val">
            <span class="editable-val" onclick="Drawer.editField('${c.id}','qa_status','select:검수전,검수중,완료,이슈')">${qaBadge(c.qa_status)}</span>
          </span>
        </div>
        <div class="drawer-row" style="align-items:flex-start">
          <span class="drawer-row-label" style="padding-top:4px">검수 메모</span>
          <span class="drawer-row-val">
            <textarea id="qaNoteInput" rows="4" style="width:100%;padding:7px 10px;border:1px solid var(--ink15);border-radius:6px;font-family:inherit;font-size:12px;resize:vertical;outline:none"
              placeholder="검수 내용, 이슈 사항 등…">${escHtml(c.qa_note || '')}</textarea>
          </span>
        </div>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">링크</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${c.link_qa ? linkBtn(c.link_qa, '콘텐츠 검수 시트', 'qa') : '<span class="text-muted text-sm">QA 시트 링크 없음</span>'}
          ${c.link_progress ? linkBtn(c.link_progress, '캠페인 진행 시트', 'prog') : ''}
        </div>
      </div>
      <div class="drawer-section" style="margin-bottom:0">
        <div class="drawer-section-title">업로드 현황</div>
        ${progressBar(c.count_select, c.count_upload)}
      </div>
    `;
    document.getElementById('drawerFooter').innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="Drawer.saveQANote('${c.id}')">메모 저장</button>
    `;
  },

  async renderLog(c) {
    document.getElementById('drawerBody').innerHTML = '<div class="text-muted text-sm" style="padding:8px 0">로딩 중…</div>';
    const logs = await Store.getLogs(c.id, 40);
    if (!logs.length) {
      document.getElementById('drawerBody').innerHTML = '<div class="empty-state">변경 이력이 없습니다</div>';
      return;
    }
    document.getElementById('drawerBody').innerHTML = `
      <div class="log-list">
        ${logs.map(l => `
          <div class="log-item">
            <span class="log-time">${new Date(l.changed_at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            <span class="log-msg">
              <strong>${escHtml(l.field)}</strong>
              ${l.old_value ? `<span class="text-muted"> ${escHtml(l.old_value)} →</span>` : ''}
              ${escHtml(l.new_value || '')}
            </span>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('drawerFooter').innerHTML = '';
  },

  async editField(campaignId, key, type) {
    const c = Store.getCampaignById(campaignId);
    if (!c) return;

    if (type.startsWith('select:')) {
      const opts = type.slice(7).split(',');
      const cur  = c[key] || '';
      Modal.show(`
        <div class="field">
          <label>${escHtml(key)}</label>
          <select id="editSelect">
            ${opts.map(o => `<option value="${o}"${o===cur?' selected':''}>${o}</option>`).join('')}
          </select>
        </div>
      `, { title: '값 변경' });
      document.getElementById('modalFooter').innerHTML = `
        <button class="btn" onclick="Modal.hide()">취소</button>
        <button class="btn btn-primary" onclick="Drawer._saveSelect('${campaignId}','${key}')">저장</button>
      `;
    } else {
      const cur = c[key] || '';
      const inputTag = type === 'textarea'
        ? `<textarea id="editInput" rows="4">${escHtml(cur)}</textarea>`
        : `<input id="editInput" type="${type === 'url' ? 'text' : type}" value="${escHtml(cur)}">`;
      Modal.show(`
        <div class="field"><label>${escHtml(key)}</label>${inputTag}</div>
      `, { title: '값 변경' });
      document.getElementById('modalFooter').innerHTML = `
        <button class="btn" onclick="Modal.hide()">취소</button>
        <button class="btn btn-primary" onclick="Drawer._saveInput('${campaignId}','${key}','${type}')">저장</button>
      `;
      setTimeout(() => document.getElementById('editInput')?.focus(), 50);
    }
  },

  async _saveInput(id, key, type) {
    let val = document.getElementById('editInput').value;
    if (type === 'number') val = parseInt(val) || 0;
    Modal.hide();
    await Store.updateCampaign(id, { [key]: val });
    await Drawer.render();
    App.renderCurrentView();
    toast('저장됨', 'ok');
  },

  async _saveSelect(id, key) {
    const val = document.getElementById('editSelect').value;
    Modal.hide();
    await Store.updateCampaign(id, { [key]: val });
    await Drawer.render();
    App.renderCurrentView();
    toast('저장됨', 'ok');
  },

  async saveQANote(id) {
    const note = document.getElementById('qaNoteInput').value;
    await Store.updateCampaign(id, { qa_note: note, qa_updated_at: new Date().toISOString() });
    toast('QA 메모 저장됨', 'ok');
  },

  archiveConfirm(id) {
    const c = Store.getCampaignById(id);
    Modal.confirm({
      title: '아카이브',
      message: `"${c?.name}" 캠페인을 아카이브 하시겠습니까? 완료 탭에서 복원 가능합니다.`,
      onConfirm: async () => {
        await Store.archiveCampaign(id);
        Drawer.close();
        App.renderCurrentView();
        toast('아카이브 완료', 'ok');
      },
    });
  },
};

// ── CAMPAIGN FORM (새 캠페인) ────────────────────────────────
function showNewCampaignModal() {
  const clients = Store.getClients().map(c => c.name);
  Modal.show(`
    <div class="form-grid">
      <div class="field form-full">
        <label>캠페인명 <span style="color:var(--red)">*</span></label>
        <input id="nf-name" type="text" placeholder="[캠페인] 브랜드명 26년 월 주차">
      </div>
      <div class="field">
        <label>거래처</label>
        <input id="nf-client" list="clientList" type="text" placeholder="거래처명">
        <datalist id="clientList">${clients.map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
      </div>
      <div class="field">
        <label>진행사</label>
        <input id="nf-entity" type="text" value="SIRIAI" placeholder="SIRIAI / 노이즈앤피치 대행 등">
      </div>
      <div class="field">
        <label>국가</label>
        <select id="nf-country">
          <option value="국내" selected>국내</option>
          <option value="해외">해외</option>
        </select>
      </div>
      <div class="field">
        <label>상태</label>
        <select id="nf-status">
          ${STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>시작일</label>
        <input id="nf-start" type="date">
      </div>
      <div class="field">
        <label>마감일</label>
        <input id="nf-end" type="date">
      </div>
      <div class="field">
        <label>납품예정일</label>
        <input id="nf-delivery" type="date">
      </div>
      <div class="field">
        <label>제공 수</label>
        <input id="nf-provide" type="number" min="0" value="0">
      </div>
      <div class="field form-full">
        <label>제품 상세</label>
        <textarea id="nf-detail" rows="2" placeholder="제품명, 규격, 특이사항 등"></textarea>
      </div>
      <div class="field form-full">
        <label>진행시트 URL</label>
        <input id="nf-progress" type="text" placeholder="https://docs.google.com/…">
      </div>
      <div class="field form-full">
        <label>QA 시트 URL</label>
        <input id="nf-qa" type="text" placeholder="https://docs.google.com/…">
      </div>
      <div class="field form-full">
        <label>가이드 URL</label>
        <input id="nf-guide" type="text" placeholder="https://notion.so/…">
      </div>
      <div class="field form-full">
        <label>비고</label>
        <textarea id="nf-note" rows="2"></textarea>
      </div>
    </div>
  `, { title: '새 캠페인 등록' });
  document.getElementById('modalFooter').innerHTML = `
    <button class="btn" onclick="Modal.hide()">취소</button>
    <button class="btn btn-primary" onclick="submitNewCampaign()">등록</button>
  `;
  setTimeout(() => document.getElementById('nf-name')?.focus(), 50);
}

async function submitNewCampaign() {
  const name = document.getElementById('nf-name').value.trim();
  if (!name) { toast('캠페인명을 입력하세요', 'warn'); return; }

  const clientName = document.getElementById('nf-client').value.trim();
  const client = clientName ? await Store.ensureClient(clientName) : null;

  const data = {
    name,
    client_name: clientName || null,
    client_id:   client?.id || null,
    entity:      document.getElementById('nf-entity').value.trim() || 'SIRIAI',
    country:     document.getElementById('nf-country').value,
    status:      document.getElementById('nf-status').value,
    date_start:  document.getElementById('nf-start').value   || null,
    date_end:    document.getElementById('nf-end').value     || null,
    date_delivery: document.getElementById('nf-delivery').value || null,
    count_provide: parseInt(document.getElementById('nf-provide').value) || 0,
    detail:      document.getElementById('nf-detail').value.trim()   || null,
    link_progress: document.getElementById('nf-progress').value.trim() || null,
    link_qa:     document.getElementById('nf-qa').value.trim()       || null,
    link_guide:  document.getElementById('nf-guide').value.trim()    || null,
    note:        document.getElementById('nf-note').value.trim()     || null,
  };

  Modal.hide();
  try {
    const created = await Store.createCampaign(data);
    App.renderCurrentView();
    toast('캠페인이 등록되었습니다', 'ok');
    setTimeout(() => Drawer.open(created.id), 300);
  } catch (e) {
    toast('등록 실패: ' + e.message, 'err');
  }
}

// ── FILTERS ───────────────────────────────────────────────────
function applyFilters(campaigns) {
  let data = campaigns.filter(c => {
    if (State.filters.tab === 'active') return ACTIVE_STATUSES.includes(c.status) && !c.is_archived;
    if (State.filters.tab === 'qa')     return c.status === '4. 컨텐츠 업로드' && !c.is_archived;
    if (State.filters.tab === 'finance')return c.revenue > 0 && !c.is_archived;
    if (State.filters.tab === 'done')   return c.is_archived;
    return !c.is_archived;
  });
  if (State.filters.search) {
    const q = State.filters.search.toLowerCase();
    data = data.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.client_name || '').toLowerCase().includes(q) ||
      (c.detail || '').toLowerCase().includes(q) ||
      (c.note || '').toLowerCase().includes(q)
    );
  }
  if (State.filters.entity)  data = data.filter(c => (c.entity || '').includes(State.filters.entity));
  if (State.filters.country) data = data.filter(c => c.country === State.filters.country);
  if (State.filters.client)  data = data.filter(c => c.client_name === State.filters.client);
  if (State.filters.status)  data = data.filter(c => c.status === State.filters.status);

  if (State.sort.col) {
    data.sort((a, b) => {
      let av = a[State.sort.col], bv = b[State.sort.col];
      if (typeof av === 'number') return (av - bv) * State.sort.dir;
      return String(av||'').localeCompare(String(bv||''), 'ko') * State.sort.dir;
    });
  }
  return data;
}

// ── VIEW: DASHBOARD ───────────────────────────────────────────
function renderDashboard() {
  const all = Store.getCampaigns().filter(c => !c.is_archived);
  const active = all.filter(c => ACTIVE_STATUSES.includes(c.status));
  const totalRev = all.reduce((s,c) => s + (c.revenue||0), 0);
  const totalProfit = all.reduce((s,c) => s + (c._profit||0), 0);
  const alerts = computeAlerts();
  const urgentCount = alerts.urgent.length + alerts.issue.length;
  const unpaidTotal = Store.getCampaigns()
    .filter(c => ['미입금','부분입금'].includes(c.pay_status) && c.revenue > 0)
    .reduce((s,c) => s + (c.revenue||0), 0);

  return `
    <div class="page-header">
      <div>
        <div class="page-title">대시보드</div>
        <div class="page-sub">${new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</div>
      </div>
    </div>

    <div class="summary-grid">
      <div class="stat-card">
        <div class="stat-card-label">전체 캠페인</div>
        <div class="stat-card-val">${all.length}</div>
        <div class="stat-card-sub">진행중 ${active.length}건</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-card-label">누적 매출</div>
        <div class="stat-card-val">${fmt.money(totalRev)}원</div>
        <div class="stat-card-sub">순이익 ${fmt.money(totalProfit)}원</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-card-label">미입금</div>
        <div class="stat-card-val">${fmt.money(unpaidTotal)}원</div>
        <div class="stat-card-sub">${alerts.unpaid.length}건</div>
      </div>
      <div class="stat-card ${urgentCount > 0 ? 'accent-red' : ''}">
        <div class="stat-card-label">즉시 확인 필요</div>
        <div class="stat-card-val">${urgentCount}</div>
        <div class="stat-card-sub">D-2 마감 ${alerts.urgent.length} · 이슈 ${alerts.issue.length}</div>
      </div>
    </div>

    ${renderAlertPanel(alerts)}

    <div style="margin-top:20px">
      <div class="page-header" style="margin-bottom:12px">
        <div class="page-title" style="font-size:13px">진행중 캠페인</div>
      </div>
      ${renderCampaignTable(active.slice(0,15), { compact: true })}
    </div>
  `;
}

function renderAlertPanel(alerts) {
  const groups = [
    { label: 'D-2 이내 마감', items: alerts.urgent, dot: 'urgent', meta: c => dday(c) },
    { label: '미입금',         items: alerts.unpaid, dot: 'warn',   meta: c => fmt.money(c.revenue) + '원' },
    { label: 'QA 이슈',        items: alerts.qa,     dot: 'urgent', meta: () => 'QA 이슈' },
    { label: '기타/이슈',      items: alerts.issue,  dot: 'info',   meta: () => '확인 필요' },
    { label: 'D-7 이내 마감',  items: alerts.warn,   dot: 'warn',   meta: c => dday(c) },
  ].filter(g => g.items.length);

  if (!groups.length) return `<div class="alert-panel"><div class="alert-empty" style="padding:24px">알림 없음 ✓</div></div>`;

  return `
    <div class="alert-panel">
      <div class="alert-panel-header">운영 알림 (${groups.reduce((s,g)=>s+g.items.length,0)})</div>
      ${groups.map(g => `
        <div class="alert-group">
          <div class="alert-group-title">${g.label} (${g.items.length})</div>
          ${g.items.map(c => `
            <div class="alert-item" onclick="App.openDrawer('${c.id}')">
              <span class="alert-dot ${g.dot}"></span>
              <span class="alert-name">${escHtml(c.name)}</span>
              <span class="alert-meta">${escHtml(g.meta(c))}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

// ── VIEW: CAMPAIGNS TABLE ─────────────────────────────────────
function renderCampaignTable(data, opts = {}) {
  if (!data.length) return '<div class="table-wrap"><div class="empty-state">조건에 맞는 캠페인이 없습니다<p>새 캠페인을 등록하거나 필터를 변경해 보세요</p></div></div>';

  const cols = opts.compact ? [
    { key: 'status',    label: '상태',     cls: 'sortable' },
    { key: 'name',      label: '캠페인명',  cls: 'sortable' },
    { key: 'n_up',      label: '업로드',   cls: '' },
    { key: 'd_end',     label: 'D-day',    cls: 'sortable' },
    { key: 'links',     label: '링크',     cls: 'hide-mobile' },
  ] : [
    { key: 'status',    label: '상태',     cls: 'sortable' },
    { key: 'name',      label: '캠페인명',  cls: 'sortable' },
    { key: 'entity',    label: '진행사',   cls: 'sortable hide-mobile' },
    { key: 'n_up',      label: '업로드',   cls: '' },
    { key: 'd_end',     label: 'D-day',    cls: 'sortable' },
    { key: 'qa_status', label: 'QA',       cls: 'hide-mobile' },
    { key: 'revenue',   label: '매출',     cls: 'sortable hide-mobile' },
    { key: 'pay_status',label: '입금',     cls: 'hide-mobile' },
    { key: 'links',     label: '링크',     cls: 'hide-mobile' },
  ];

  const head = cols.map(col => {
    const sortCls = State.sort.col === col.key
      ? (State.sort.dir === 1 ? ' sort-asc' : ' sort-desc') : '';
    return `<th class="${col.cls}${sortCls}" data-col="${col.key}">${col.label}</th>`;
  }).join('');

  const rows = data.map(c => {
    const cells = cols.map(col => {
      switch (col.key) {
        case 'status':
          return `<td>${statusBadge(c.status, true)
            .replace('data-status-btn', `onclick="StatusDD.open('${c.id}',this);event.stopPropagation()"`)}</td>`;
        case 'name':
          return `<td class="name-cell">
            <div class="name-main">${escHtml(c.name)}</div>
            ${c.detail ? `<div class="name-detail">${escHtml(c.detail)}</div>` : ''}
            <div class="name-client">${escHtml(c.client_name || '')}${c.country==='해외'?' · 해외':''}</div>
          </td>`;
        case 'entity':
          return `<td><span class="text-sm ${c.entity==='SIRIAI'?'text-muted':''}">${escHtml(c.entity||'')}</span></td>`;
        case 'n_up':
          return `<td>${progressBar(c.count_select, c.count_upload)}</td>`;
        case 'd_end':
          return `<td>
            ${dday(c) ? `<div class="dday ${ddayCls(c)}">${dday(c)}</div>` : ''}
            <div class="dday-date">${c.date_end || '—'}</div>
          </td>`;
        case 'qa_status':
          return `<td>${qaBadge(c.qa_status)}</td>`;
        case 'revenue':
          return `<td><span class="money ${c.revenue>0?'pos':'zero'}">${fmt.money(c.revenue)}${c.revenue?'원':''}</span></td>`;
        case 'pay_status':
          return `<td>${payBadge(c.pay_status)}</td>`;
        case 'links':
          return `<td><div class="link-row">
            ${linkBtn(c.link_progress,'시트','prog')}
            ${linkBtn(c.link_qa,'QA','qa')}
            ${linkBtn(c.link_guide,'가이드','guide')}
          </div></td>`;
        default:
          return `<td>${escHtml(String(c[col.key]||''))}</td>`;
      }
    }).join('');
    return `<tr class="row-hover" onclick="App.openDrawer('${c.id}')">${cells}</tr>`;
  }).join('');

  return `
    <div class="table-wrap">
      <div class="table-scroll">
        <table id="campTable">
          <thead><tr>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCampaignsView() {
  const data = applyFilters(Store.getCampaigns());
  const clients = [...new Set(Store.getCampaigns().filter(c=>!c.is_archived).map(c=>c.client_name).filter(Boolean))].sort();

  return `
    <div class="page-header">
      <div class="page-title">캠페인</div>
      <div style="margin-left:auto">
        <button class="btn btn-primary" onclick="showNewCampaignModal()">+ 새 캠페인</button>
      </div>
    </div>

    <div class="controls-bar">
      <div class="tabs" id="campTabs">
        ${[
          ['all','전체'],['active','진행중'],['qa','업로드 중'],['finance','정산'],['done','완료'],
        ].map(([k,l]) =>
          `<button class="tab${State.filters.tab===k?' active':''}" onclick="App.setTab('${k}')">${l}</button>`
        ).join('')}
      </div>
      <div class="search-wrap">
        <svg class="ico" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.5 1a5.5 5.5 0 1 0 3.594 9.714l3.596 3.596.707-.707-3.596-3.596A5.5 5.5 0 0 0 6.5 1zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/>
        </svg>
        <input class="search" id="searchInput" type="text" placeholder="캠페인명, 거래처 검색…"
               value="${escHtml(State.filters.search)}"
               oninput="App.setSearch(this.value)">
      </div>
      <select class="filter-select" onchange="App.setFilter('entity',this.value)">
        <option value="">진행사 전체</option>
        <option value="SIRIAI" ${State.filters.entity==='SIRIAI'?'selected':''}>SIRIAI</option>
        <option value="타대행" ${State.filters.entity==='타대행'?'selected':''}>타대행</option>
      </select>
      <select class="filter-select" onchange="App.setFilter('country',this.value)">
        <option value="">국내/해외</option>
        <option value="국내" ${State.filters.country==='국내'?'selected':''}>국내</option>
        <option value="해외" ${State.filters.country==='해외'?'selected':''}>해외</option>
      </select>
      <select class="filter-select" onchange="App.setFilter('client',this.value)">
        <option value="">거래처 전체</option>
        ${clients.map(c => `<option value="${escHtml(c)}"${State.filters.client===c?' selected':''}>${escHtml(c)}</option>`).join('')}
      </select>
      <div class="controls-right">
        <span class="count-label" id="countLabel">${data.length}건</span>
      </div>
    </div>

    ${renderCampaignTable(data)}
  `;
}

// ── VIEW: QA ──────────────────────────────────────────────────
function renderQAView() {
  const campaigns = Store.getCampaigns().filter(c => !c.is_archived);
  const qaMap = { '검수전':0, '검수중':0, '완료':0, '이슈':0 };
  campaigns.forEach(c => { if (qaMap[c.qa_status] !== undefined) qaMap[c.qa_status]++; });
  const active4 = campaigns.filter(c => c.status === '4. 컨텐츠 업로드');

  return `
    <div class="page-header">
      <div class="page-title">QA 검수</div>
    </div>
    <div class="summary-grid">
      <div class="stat-card"><div class="stat-card-label">검수 전</div><div class="stat-card-val">${qaMap['검수전']}</div></div>
      <div class="stat-card accent-blue"><div class="stat-card-label">검수 중</div><div class="stat-card-val">${qaMap['검수중']}</div></div>
      <div class="stat-card accent-green"><div class="stat-card-label">완료</div><div class="stat-card-val">${qaMap['완료']}</div></div>
      <div class="stat-card accent-red"><div class="stat-card-label">이슈</div><div class="stat-card-val">${qaMap['이슈']}</div></div>
    </div>

    <div style="margin-bottom:8px">
      <div class="page-title" style="font-size:12px;color:var(--ink50);margin-bottom:8px">업로드 단계 캠페인 (${active4.length}건)</div>
      <div class="table-wrap">
        <table><thead><tr>
          <th>캠페인명</th><th>업로드 현황</th><th>QA 상태</th><th>QA 시트</th><th>비고</th>
        </tr></thead><tbody>
          ${active4.map(c => `
            <tr class="row-hover" onclick="App.openDrawer('${c.id}')">
              <td class="name-cell"><div class="name-main">${escHtml(c.name)}</div><div class="name-client">${escHtml(c.client_name||'')}</div></td>
              <td>${progressBar(c.count_select, c.count_upload)}</td>
              <td>${qaBadge(c.qa_status)}</td>
              <td>${c.link_qa ? linkBtn(c.link_qa,'시트 열기','qa') : '<span class="text-muted text-sm">없음</span>'}</td>
              <td><span class="text-sm text-muted truncate" style="max-width:160px;display:block">${escHtml(c.qa_note||'—')}</span></td>
            </tr>
          `).join('')}
          ${!active4.length ? '<tr><td colspan="5" class="empty-state">해당 캠페인 없음</td></tr>' : ''}
        </tbody></table>
      </div>
    </div>
  `;
}

// ── VIEW: FINANCE ─────────────────────────────────────────────
function renderFinanceView() {
  const campaigns = Store.getCampaigns().filter(c => !c.is_archived && c.revenue > 0);
  const totalRev    = campaigns.reduce((s,c) => s+(c.revenue||0), 0);
  const totalProfit = campaigns.reduce((s,c) => s+(c._profit||0), 0);
  const unpaid = campaigns.filter(c => ['미입금','부분입금'].includes(c.pay_status));
  const unpaidTotal = unpaid.reduce((s,c) => s+(c.revenue||0), 0);

  // group by month (date_end or date_start)
  const byMonth = {};
  campaigns.forEach(c => {
    const d = c.date_end || c.date_start || '';
    const mon = d ? d.slice(0,7) : '미정';
    if (!byMonth[mon]) byMonth[mon] = [];
    byMonth[mon].push(c);
  });
  const months = Object.keys(byMonth).sort().reverse();

  // client breakdown
  const byClient = {};
  campaigns.forEach(c => {
    const k = c.client_name || '미분류';
    if (!byClient[k]) byClient[k] = { rev:0, profit:0, count:0 };
    byClient[k].rev    += c.revenue||0;
    byClient[k].profit += c._profit||0;
    byClient[k].count  += 1;
  });
  const clientRows = Object.entries(byClient)
    .sort((a,b) => b[1].rev - a[1].rev)
    .map(([name, v]) => `
      <tr>
        <td>${escHtml(name)}</td>
        <td class="nowrap">${v.count}건</td>
        <td class="nowrap"><span class="money pos">${fmt.money(v.rev)}원</span></td>
        <td class="nowrap"><span class="money ${v.profit>0?'pos':'zero'}">${fmt.money(v.profit)}원</span></td>
        <td class="nowrap">${v.rev ? Math.round(v.profit/v.rev*100)+'%' : '—'}</td>
      </tr>`
    ).join('');

  const monthBlocks = months.map(mon => {
    const rows = byMonth[mon];
    const mRev    = rows.reduce((s,c) => s+(c.revenue||0), 0);
    const mProfit = rows.reduce((s,c) => s+(c._profit||0), 0);
    return `
      <div class="finance-month">
        <div class="finance-month-header">
          <span class="finance-month-title">${mon}</span>
          <span class="finance-month-stat">매출 <strong>${fmt.money(mRev)}원</strong></span>
          <span class="finance-month-stat">순이익 <strong>${fmt.money(mProfit)}원</strong></span>
          <span class="finance-month-stat">${rows.length}건</span>
        </div>
        <div class="table-wrap">
          <table><thead><tr>
            <th>캠페인명</th><th>거래처</th><th>매출</th><th>원고료</th><th>순이익</th><th>마진</th><th>입금</th>
          </tr></thead><tbody>
            ${rows.map(c => `
              <tr class="row-hover" onclick="App.openDrawer('${c.id}')">
                <td><div class="name-main text-sm">${escHtml(c.name)}</div></td>
                <td class="text-sm text-muted">${escHtml(c.client_name||'')}</td>
                <td class="nowrap"><span class="money pos">${fmt.money(c.revenue)}원</span></td>
                <td class="nowrap text-muted">${fmt.money(c.fee)}원</td>
                <td class="nowrap"><span class="money ${c._profit>0?'pos':'zero'}">${fmt.money(c._profit)}원</span></td>
                <td class="text-sm">${c._margin}%</td>
                <td>${payBadge(c.pay_status)}</td>
              </tr>
            `).join('')}
          </tbody></table>
        </div>
      </div>
    `;
  }).join('');

  const csvBtn = `<button class="btn btn-sm" onclick="exportCSV()">CSV 내보내기</button>`;

  return `
    <div class="page-header">
      <div class="page-title">정산</div>
      <div style="margin-left:auto">${csvBtn}</div>
    </div>
    <div class="summary-grid">
      <div class="stat-card accent-green"><div class="stat-card-label">총 매출</div><div class="stat-card-val">${fmt.money(totalRev)}원</div></div>
      <div class="stat-card accent-green"><div class="stat-card-label">총 순이익</div><div class="stat-card-val">${fmt.money(totalProfit)}원</div><div class="stat-card-sub">마진 ${totalRev?Math.round(totalProfit/totalRev*100):0}%</div></div>
      <div class="stat-card accent-red"><div class="stat-card-label">미입금 합계</div><div class="stat-card-val">${fmt.money(unpaidTotal)}원</div><div class="stat-card-sub">${unpaid.length}건</div></div>
      <div class="stat-card"><div class="stat-card-label">집계 캠페인</div><div class="stat-card-val">${campaigns.length}</div></div>
    </div>

    ${unpaid.length ? `
      <div style="margin-bottom:20px">
        <div class="page-title" style="font-size:12px;color:var(--red);margin-bottom:8px">미입금 (${unpaid.length}건)</div>
        <div class="table-wrap">
          <table><thead><tr><th>캠페인명</th><th>거래처</th><th>매출</th><th>세금계산서</th><th>상태</th></tr></thead>
          <tbody>${unpaid.map(c => `
            <tr class="row-hover" onclick="App.openDrawer('${c.id}')">
              <td>${escHtml(c.name)}</td>
              <td class="text-muted text-sm">${escHtml(c.client_name||'')}</td>
              <td><span class="money pos">${fmt.money(c.revenue)}원</span></td>
              <td class="text-sm">${c.date_tax || '미발행'}</td>
              <td>${payBadge(c.pay_status)}</td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>` : ''}

    <div style="margin-bottom:20px">
      <div class="page-title" style="font-size:12px;color:var(--ink50);margin-bottom:8px">거래처별 집계</div>
      <div class="table-wrap">
        <table><thead><tr><th>거래처</th><th>건수</th><th>매출</th><th>순이익</th><th>마진율</th></tr></thead>
        <tbody>${clientRows}</tbody>
        </table>
      </div>
    </div>

    ${monthBlocks}
  `;
}

// ── CSV EXPORT ────────────────────────────────────────────────
function exportCSV() {
  const data = applyFilters(Store.getCampaigns().filter(c => c.revenue > 0));
  const headers = ['UV','상태','캠페인명','거래처','진행사','매출','원고료','순이익','마진율','입금상태','견적서발행일','세금계산서발행일','마감일'];
  const rows = data.map(c => [
    c.uv||'', c.status, c.name, c.client_name||'', c.entity||'',
    c.revenue||0, c.fee||0, c._profit||0,
    c.revenue ? Math.round(c._profit/c.revenue*100)+'%' : '',
    c.pay_status||'', c.date_quote||'', c.date_tax||'', c.date_end||'',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `siriai-pm-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('CSV 다운로드 완료', 'ok');
}

// ── APP ────────────────────────────────────────────────────────
const App = {
  async init() {
    // topbar date
    document.getElementById('topDate').textContent =
      new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric'});

    // loading
    document.getElementById('mainContent').innerHTML =
      '<div class="empty-state">데이터 로딩 중…</div>';

    try {
      await Store.init();
    } catch (e) {
      document.getElementById('mainContent').innerHTML = `
        <div class="empty-state">
          연결 실패<p>${e.message}</p>
          <p style="margin-top:8px;font-size:11px">config.js의 SUPABASE_URL과 SUPABASE_KEY를 확인하세요</p>
        </div>`;
      return;
    }

    App.renderCurrentView();
    App.renderNotifications();

    // table sort
    document.addEventListener('click', e => {
      const th = e.target.closest('th[data-col]');
      if (!th) return;
      const col = th.dataset.col;
      if (!th.classList.contains('sortable')) return;
      if (State.sort.col === col) State.sort.dir = -State.sort.dir;
      else { State.sort.col = col; State.sort.dir = 1; }
      App.renderCurrentView();
    });
  },

  renderCurrentView() {
    let html = '';
    switch (State.view) {
      case 'dashboard': html = renderDashboard();      break;
      case 'campaigns': html = renderCampaignsView();  break;
      case 'qa':        html = renderQAView();          break;
      case 'finance':   html = renderFinanceView();     break;
      default:          html = renderDashboard();
    }
    document.getElementById('mainContent').innerHTML = html;
    App.renderNotifications();

    // update nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === State.view);
    });
  },

  renderNotifications() {
    renderNotificationBadge();
  },

  navigate(view) {
    State.view = view;
    // reset filters when switching main views
    if (view !== 'campaigns') State.filters.tab = 'all';
    App.renderCurrentView();
  },

  openDrawer(id) {
    Drawer.open(id);
  },

  setTab(tab) {
    State.filters.tab = tab;
    App.renderCurrentView();
  },

  setSearch(val) {
    State.filters.search = val;
    App.renderCurrentView();
  },

  setFilter(key, val) {
    State.filters[key] = val;
    App.renderCurrentView();
  },
};

// ── BOOT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
