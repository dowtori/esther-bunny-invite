// ============================================================
// SIRIAI PM — App (3-column master-detail v2)
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
  money:     n => n ? (n / 10000).toFixed(0) + '만' : '—',
  moneyFull: n => n ? n.toLocaleString('ko-KR') + '원' : '—',
  date:      s => s ? s.slice(0, 10) : '—',
  pct:       n => n ? n + '%' : '—',
};

function dday(c) {
  if (c._dday === null || c._dday === undefined) return '';
  if (c._dday < 0)  return `D+${Math.abs(c._dday)}`;
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
  selectedClient:    null,    // null = 전체보기 | '거래처명'
  selectedCampaignId: null,
  campFilter:        'active', // 'active' | 'done' | 'all'
  search:            '',
  drawerSections:    {},
  financeMode:       false,
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
}

function renderNotifDropdown() {
  const alerts = computeAlerts();
  const groups = [
    { key: 'urgent', label: '🔴 D-2 이내 마감', items: alerts.urgent, dot: 'urgent', meta: c => dday(c) },
    { key: 'warn',   label: '🟡 D-7 이내 마감', items: alerts.warn,   dot: 'warn',   meta: c => dday(c) },
    { key: 'unpaid', label: '💸 미입금',         items: alerts.unpaid, dot: 'warn',   meta: c => fmt.money(c.revenue) + '원' },
    { key: 'qa',     label: '⚠ QA 이슈',         items: alerts.qa,    dot: 'urgent', meta: () => 'QA 이슈' },
    { key: 'issue',  label: '🔧 기타/이슈',       items: alerts.issue, dot: 'info',   meta: () => '확인 필요' },
  ];

  const html = groups.filter(g => g.items.length > 0).map(g => `
    <div class="alert-group">
      <div class="alert-group-title">${g.label} (${g.items.length})</div>
      ${g.items.map(c => `
        <div class="alert-item" onclick="App.selectCampaign('${c.id}');Notif.close()">
          <span class="alert-dot ${g.dot}"></span>
          <span class="alert-name">${escHtml(c.name)}</span>
          <span class="alert-meta">${escHtml(g.meta(c))}</span>
        </div>
      `).join('')}
    </div>
  `).join('') || '<div class="alert-empty">알림 없음 ✓</div>';

  const body = document.getElementById('notifBody');
  if (body) body.innerHTML = html;
}

const Notif = {
  open() {
    renderNotifDropdown();
    const dd = document.getElementById('notifDropdown');
    if (dd) dd.classList.add('open');
    document.addEventListener('click', Notif._outside, true);
  },
  close() {
    const dd = document.getElementById('notifDropdown');
    if (dd) dd.classList.remove('open');
    document.removeEventListener('click', Notif._outside, true);
  },
  toggle() {
    const dd = document.getElementById('notifDropdown');
    if (!dd) return;
    dd.classList.contains('open') ? Notif.close() : Notif.open();
  },
  _outside(e) {
    const wrap = document.getElementById('notifWrap');
    if (wrap && !wrap.contains(e.target)) Notif.close();
  },
};

// ── STATUS DROPDOWN ────────────────────────────────────────────
const StatusDD = {
  _campaignId: null,

  open(campaignId, anchorEl) {
    StatusDD._campaignId = campaignId;
    const el = document.getElementById('statusDropdown');
    const c = Store.getCampaignById(campaignId);
    el.innerHTML = STATUSES.map(s => `
      <div class="status-option${s === c?.status ? ' font-bold' : ''}"
           onclick="StatusDD.select('${s}')">
        ${statusBadge(s)}
      </div>
    `).join('');
    const rect = anchorEl.getBoundingClientRect();
    el.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    el.style.left = (rect.left  + window.scrollX) + 'px';
    el.classList.add('open');
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
          App.renderAll();
          toast('상태가 변경되었습니다', 'ok');
        },
      });
    } else {
      await Store.updateStatus(StatusDD._campaignId, newStatus);
      App.renderAll();
      toast('상태가 변경되었습니다', 'ok');
    }
  },

  _outside(e) {
    const dd = document.getElementById('statusDropdown');
    if (!dd.contains(e.target)) StatusDD.close();
  },
};

// ── INLINE EDIT ────────────────────────────────────────────────
const InlineEdit = {
  start(el, campaignId, key, type) {
    if (el.dataset.editing) return;
    const c = Store.getCampaignById(campaignId);
    if (!c) return;

    const rawVal = c[key] ?? '';
    el.dataset.editing = '1';
    el.textContent = '';

    let input;
    if (type.startsWith('select:')) {
      const opts = type.slice(7).split(',');
      input = document.createElement('select');
      input.className = 'inline-input';
      opts.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        if (String(o) === String(rawVal)) opt.selected = true;
        input.appendChild(opt);
      });
    } else if (type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'inline-input';
      input.rows = 3; input.style.width = '100%';
      input.value = rawVal;
    } else {
      input = document.createElement('input');
      input.className = 'inline-input';
      input.type = type === 'url' ? 'text' : type;
      input.style.width = '100%';
      input.value = rawVal;
    }

    let done = false;

    const commit = async () => {
      if (done) return;
      done = true;
      let val = input.value;
      if (type === 'number') val = parseInt(val) || 0;
      if (!val && (type === 'date' || type === 'url')) val = null;
      el.removeAttribute('data-editing');
      el.textContent = val || '—';
      try {
        await Store.updateCampaign(campaignId, { [key]: val });
        // Refresh campaign list row + detail panel (scroll-preserved)
        const panel = document.getElementById('detailPanel');
        const scrollTop = panel ? panel.scrollTop : 0;
        document.getElementById('campaignPanel').innerHTML = renderCampaignPanel();
        Detail.render(campaignId);
        if (panel) panel.scrollTop = scrollTop;
        toast('저장됨', 'ok');
      } catch(e) { toast('저장 실패', 'err'); }
    };

    const revert = () => {
      if (done) return;
      done = true;
      el.removeAttribute('data-editing');
      const fresh = Store.getCampaignById(campaignId);
      el.textContent = (fresh?.[key] ?? '') || '—';
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && type !== 'textarea') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); revert(); }
    });
    if (type.startsWith('select:')) {
      input.addEventListener('change', () => input.blur());
    }

    el.appendChild(input);
    requestAnimationFrame(() => input.focus());
  },
};

// ── MODAL ──────────────────────────────────────────────────────
const Modal = {
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

// ── DRAWER (repurposed as detail panel renderer) ───────────────
const Drawer = {

  toggleSection(key) {
    State.drawerSections[key] = !State.drawerSections[key];
    const body = document.getElementById(`ds-body-${key}`);
    const icon = document.getElementById(`ds-icon-${key}`);
    if (body) body.classList.toggle('collapsed', !State.drawerSections[key]);
    if (icon) icon.textContent = State.drawerSections[key] ? '▼' : '▶';
    if (key === 'log' && State.drawerSections.log) Drawer.loadLog();
  },

  renderQuickActions(c) {
    const links = [
      c.link_progress && linkBtn(c.link_progress, '진행시트', 'prog'),
      c.link_qa       && linkBtn(c.link_qa,       'QA시트',   'qa'),
      c.link_guide    && linkBtn(c.link_guide,     '가이드',   'guide'),
      c.link_recruit  && linkBtn(c.link_recruit,   '모집',     ''),
    ].filter(Boolean);
    if (!links.length) return '';
    return `<div class="drawer-quick-actions">${links.join('')}</div>`;
  },

  renderBody(c) {
    const field = (label, key, val, type = 'text', hint = '') => `
      <div class="drawer-row">
        <span class="drawer-row-label"${hint ? ` title="${escHtml(hint)}"` : ''}>${label}${hint ? ' <span class="hint-icon">ⓘ</span>' : ''}</span>
        <span class="drawer-row-val">
          <span class="editable-val" onclick="InlineEdit.start(this,'${c.id}','${key}','${type}')">${escHtml(val !== null && val !== undefined ? String(val) : '—')}</span>
        </span>
      </div>`;

    const dsec = (key, title, content) => {
      const open = !!State.drawerSections[key];
      return `
        <div class="drawer-section">
          <div class="drawer-section-title drawer-section-toggle" onclick="Drawer.toggleSection('${key}')">
            <span id="ds-icon-${key}" class="ds-arrow">${open ? '▼' : '▶'}</span> ${title}
          </div>
          <div id="ds-body-${key}" class="drawer-section-body${open ? '' : ' collapsed'}">${content}</div>
        </div>`;
    };

    const coreContent = `
      ${field('거래처', 'client_name', c.client_name)}
      ${field('담당 채널', 'entity', c.entity, 'text', 'SIRIAI 직접 운영 vs 타 대행사 구분')}
      <div class="drawer-row">
        <span class="drawer-row-label">기간</span>
        <span class="drawer-row-val" style="font-size:12px;color:var(--ink70)">${fmt.date(c.date_start)} → ${fmt.date(c.date_end)}</span>
      </div>
      ${field('납품 예정일', 'date_delivery', c.date_delivery, 'date')}
      ${field('국가', 'country', c.country, 'select:국내,해외')}
      ${field('캠페인 코드', 'uv', c.uv, 'text', '내부 관리용 고유 코드')}
      ${field('상세 내용', 'detail', c.detail, 'textarea')}
    `;

    const uploadContent = `
      ${field('제공 수', 'count_provide', c.count_provide, 'number', '브랜드 체험/선물 제공 가능 인원')}
      ${field('섭외 완료', 'count_select', c.count_select, 'number', '실제 섭외·컨펌된 인플루언서 수')}
      ${field('업로드 완료', 'count_upload', c.count_upload, 'number', '콘텐츠 업로드까지 완료 인원')}
      ${c.count_select ? `<div style="padding:6px 0">${progressBar(c.count_select, c.count_upload)}</div>` : ''}
    `;

    const qaContent = `
      <div class="drawer-row">
        <span class="drawer-row-label">검수 상태</span>
        <span class="drawer-row-val">
          <span class="editable-val" onclick="InlineEdit.start(this,'${c.id}','qa_status','select:검수전,검수중,완료,이슈')">${qaBadge(c.qa_status)}</span>
        </span>
      </div>
      <div class="drawer-row" style="align-items:flex-start">
        <span class="drawer-row-label" style="padding-top:4px">검수 메모</span>
        <span class="drawer-row-val">
          <textarea id="qaNoteInput" rows="3" style="width:100%;padding:7px 10px;border:1px solid var(--ink15);border-radius:6px;font-family:inherit;font-size:12px;resize:vertical;outline:none"
            placeholder="검수 내용, 이슈 사항…">${escHtml(c.qa_note || '')}</textarea>
          <button class="btn btn-sm btn-primary" style="margin-top:6px" onclick="Drawer.saveQANote('${c.id}')">메모 저장</button>
        </span>
      </div>
      ${c.link_qa || c.link_progress ? `
      <div class="drawer-row">
        <span class="drawer-row-label">링크</span>
        <span class="drawer-row-val"><div class="link-row">
          ${c.link_qa ? linkBtn(c.link_qa,'검수 시트','qa') : ''}
          ${c.link_progress ? linkBtn(c.link_progress,'진행 시트','prog') : ''}
        </div></span>
      </div>` : ''}
    `;

    const financeContent = `
      ${field('매출', 'revenue', c.revenue ? c.revenue.toLocaleString() + '원' : null, 'number')}
      ${field('원고료', 'fee', c.fee ? c.fee.toLocaleString() + '원' : null, 'number')}
      <div class="drawer-row">
        <span class="drawer-row-label">순이익</span>
        <span class="drawer-row-val ${c._profit > 0 ? 'money pos' : ''}">${fmt.moneyFull(c._profit)}${c._margin ? ` <span class="text-muted" style="font-size:11px">(${c._margin}%)</span>` : ''}</span>
      </div>
      <div class="drawer-row">
        <span class="drawer-row-label">입금 상태</span>
        <span class="drawer-row-val">
          <span class="editable-val${['미입금','부분입금'].includes(c.pay_status)?' unpaid-warn':''}"
                onclick="InlineEdit.start(this,'${c.id}','pay_status','select:미입금,입금완료,부분입금,분쟁,해당없음')">${payBadge(c.pay_status)}</span>
        </span>
      </div>
      ${field('견적서 발행일', 'date_quote', c.date_quote, 'date')}
      ${field('세금계산서 발행일', 'date_tax', c.date_tax, 'date')}
    `;

    const linksContent = `
      ${field('모집 링크', 'link_recruit', c.link_recruit, 'url')}
      ${field('진행 시트', 'link_progress', c.link_progress, 'url')}
      ${field('QA 시트', 'link_qa', c.link_qa, 'url')}
      ${field('캠페인 가이드', 'link_guide', c.link_guide, 'url')}
    `;

    return `
      <div class="drawer-section">
        <div class="drawer-section-title">핵심 정보</div>
        ${coreContent}
      </div>
      ${dsec('upload', '업로드 현황', uploadContent)}
      ${dsec('qa', 'QA 검수', qaContent)}
      ${dsec('finance', '재무', financeContent)}
      <div class="drawer-section">
        <div class="drawer-section-title">링크 모음</div>
        ${linksContent}
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">비고</div>
        ${field('비고', 'note', c.note, 'textarea')}
      </div>
      ${dsec('log', '변경 이력', '<div id="ds-log-content"><span class="text-muted text-sm" style="padding:4px 0;display:block">클릭해서 펼치면 로드됩니다</span></div>')}
    `;
  },

  async loadLog() {
    const logContent = document.getElementById('ds-log-content');
    if (!logContent || logContent.dataset.loaded) return;
    const c = Store.getCampaignById(State.selectedCampaignId);
    if (!c) return;
    logContent.innerHTML = '<div class="text-muted text-sm" style="padding:8px 0">로딩 중…</div>';
    const logs = await Store.getLogs(c.id, 40);
    logContent.dataset.loaded = '1';
    if (!logs.length) {
      logContent.innerHTML = '<div class="empty-state" style="padding:16px 0;font-size:12px">변경 이력 없음</div>';
      return;
    }
    logContent.innerHTML = `
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
      message: `"${c?.name}" 캠페인을 아카이브 하시겠습니까?`,
      onConfirm: async () => {
        await Store.archiveCampaign(id);
        State.selectedCampaignId = null;
        App.renderAll();
        toast('아카이브 완료', 'ok');
      },
    });
  },
};

// ── DETAIL PANEL ───────────────────────────────────────────────
const Detail = {
  render(id) {
    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    if (!id) {
      panel.innerHTML = '<div class="detail-empty">캠페인을 선택하세요</div>';
      return;
    }

    const c = Store.getCampaignById(id);
    if (!c) {
      panel.innerHTML = '<div class="detail-empty">캠페인을 찾을 수 없습니다</div>';
      return;
    }

    // Auto-expand sections based on campaign state (only on first open)
    if (!Object.keys(State.drawerSections).length) {
      State.drawerSections = {
        upload:  c.status === '4. 컨텐츠 업로드',
        qa:      !!(c.qa_status && c.qa_status !== '검수전'),
        finance: ['5. 캠페인 종료','6. 입금 확인'].includes(c.status) ||
                 ['미입금','부분입금'].includes(c.pay_status),
        log:     false,
      };
    }

    const ddText = dday(c);
    const ddC = ddayCls(c);
    const meta = STATUS_META[c.status] || { cls: 's1', label: c.status };

    panel.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${escHtml(c.name)}</div>
        <div class="detail-meta-bar">
          <span class="badge ${meta.cls}" style="cursor:pointer" onclick="StatusDD.open('${c.id}',this)">
            <span class="badge-dot"></span>${meta.label}
          </span>
          ${ddText ? `<span class="dday ${ddC}" style="font-size:11px;padding:3px 8px">${ddText}</span>` : ''}
          <button class="btn-ghost-danger" style="margin-left:auto" onclick="Drawer.archiveConfirm('${c.id}')">아카이브</button>
        </div>
        ${Drawer.renderQuickActions(c)}
      </div>
      <div class="detail-body">
        ${Drawer.renderBody(c)}
      </div>
    `;

    if (State.drawerSections.log) Drawer.loadLog();
  },
};

// ── CAMPAIGN FORM ──────────────────────────────────────────────
function showNewCampaignModal() {
  const clients = Store.getClients().map(c => c.name);
  const defaultClient = State.selectedClient || '';
  Modal.show(`
    <div class="form-grid">
      <div class="field form-full">
        <label>캠페인명 <span style="color:var(--red)">*</span></label>
        <input id="nf-name" type="text" placeholder="[캠페인] 브랜드명 26년 월 주차">
      </div>
      <div class="field">
        <label>거래처</label>
        <input id="nf-client" list="clientList" type="text" placeholder="거래처명" value="${escHtml(defaultClient)}">
        <datalist id="clientList">${clients.map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
      </div>
      <div class="field">
        <label>담당 채널</label>
        <input id="nf-entity" type="text" value="SIRIAI" placeholder="SIRIAI / 타 대행사명">
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
    // Navigate to the new campaign's client and select it
    State.financeMode = false;
    State.selectedClient = clientName || null;
    State.selectedCampaignId = created.id;
    State.drawerSections = {};
    State.campFilter = 'active';
    App.renderAll();
    toast('캠페인이 등록되었습니다', 'ok');
  } catch (e) {
    toast('등록 실패: ' + e.message, 'err');
  }
}

// ── FILTERING ─────────────────────────────────────────────────
function filterCampaigns() {
  let data = Store.getCampaigns().filter(c => !c.is_archived);

  if (State.selectedClient) {
    data = data.filter(c => c.client_name === State.selectedClient);
  }
  if (State.search) {
    const q = State.search.toLowerCase();
    data = data.filter(c =>
      (c.name        || '').toLowerCase().includes(q) ||
      (c.client_name || '').toLowerCase().includes(q) ||
      (c.detail      || '').toLowerCase().includes(q)
    );
  }
  return data;
}

function applyTabFilter(data) {
  if (State.campFilter === 'active') return data.filter(c => ACTIVE_STATUSES.includes(c.status));
  if (State.campFilter === 'done')   return data.filter(c => !ACTIVE_STATUSES.includes(c.status));
  return data;
}

// ── RENDER: CLIENT PANEL ──────────────────────────────────────
function renderClientPanel() {
  const campaigns = Store.getCampaigns().filter(c => !c.is_archived);
  const alerts = computeAlerts();
  const totalAlerts = alerts.urgent.length + alerts.warn.length + alerts.unpaid.length +
                      alerts.qa.length + alerts.issue.length;

  // Build client stats
  const clientMap = {};
  campaigns.forEach(c => {
    const name = c.client_name || '(거래처 없음)';
    if (!clientMap[name]) clientMap[name] = { active: 0, hasIssue: false };
    if (ACTIVE_STATUSES.includes(c.status)) clientMap[name].active++;
    if (['미입금','부분입금'].includes(c.pay_status) ||
        c.status === '기타/이슈' || c.qa_status === '이슈') {
      clientMap[name].hasIssue = true;
    }
  });

  const clients = Object.entries(clientMap)
    .sort((a, b) => b[1].active - a[1].active || a[0].localeCompare(b[0], 'ko'));

  const allActive = campaigns.filter(c => ACTIVE_STATUSES.includes(c.status)).length;
  const isAllSelected = State.selectedClient === null && !State.financeMode;

  const clientItems = clients.map(([name, stats]) => {
    const isSelected = State.selectedClient === name && !State.financeMode;
    return `
      <div class="client-item${isSelected ? ' selected' : ''}" onclick="App.selectClient('${escHtml(name)}')">
        <span class="client-dot${stats.active > 0 ? ' active' : ''}"></span>
        <span class="client-name">${escHtml(name)}</span>
        ${stats.hasIssue ? '<span class="client-warn">⚠</span>' : ''}
        ${stats.active > 0 ? `<span class="client-count">${stats.active}</span>` : ''}
      </div>`;
  }).join('') || '<div class="client-empty">거래처 없음</div>';

  return `
    <div class="client-panel-header">
      <div class="client-logo">
        <div class="client-logo-text">SIRIAI</div>
        <div class="client-logo-sub">PM</div>
      </div>
      <div class="notif-wrap" id="notifWrap" style="position:relative">
        <button class="notif-btn" onclick="Notif.toggle()" title="알림">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
          </svg>
          <span class="notif-count" id="notifCount" style="${totalAlerts > 0 ? '' : 'display:none'}">${totalAlerts}</span>
        </button>
        <div class="notif-dropdown" id="notifDropdown">
          <div class="notif-header">알림</div>
          <div id="notifBody"></div>
        </div>
      </div>
    </div>

    <div class="client-section">
      <div class="client-item${isAllSelected ? ' selected' : ''}" onclick="App.selectClient(null)">
        <span class="client-dot active"></span>
        <span class="client-name">전체보기</span>
        <span class="client-count">${allActive}</span>
      </div>
    </div>

    <div class="client-divider"></div>

    <div class="client-section client-list">
      <div class="client-section-label">거래처</div>
      ${clientItems}
    </div>

    <div style="flex:1;min-height:12px"></div>

    <div class="client-divider"></div>
    <div class="client-section">
      <div class="client-item${State.financeMode ? ' selected' : ''}" onclick="App.showFinance()">
        <span style="font-size:13px;flex-shrink:0">📊</span>
        <span class="client-name">정산</span>
      </div>
    </div>
  `;
}

// ── RENDER: CAMPAIGN PANEL ────────────────────────────────────
function renderCampaignPanel() {
  if (State.financeMode) {
    return `
      <div class="camp-finance-wrap">
        ${renderFinanceView()}
      </div>`;
  }

  const base = filterCampaigns();
  const displayed = applyTabFilter(base);

  const baseActive = base.filter(c => ACTIVE_STATUSES.includes(c.status)).length;
  const baseDone   = base.filter(c => !ACTIVE_STATUSES.includes(c.status)).length;
  const baseAll    = base.length;

  const title = State.selectedClient || '전체보기';

  let listHtml;
  if (State.selectedClient === null) {
    // Group by client
    const groups = {};
    displayed.forEach(c => {
      const key = c.client_name || '(거래처 없음)';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    const groupEntries = Object.entries(groups)
      .sort((a, b) => {
        const aA = a[1].filter(c => ACTIVE_STATUSES.includes(c.status)).length;
        const bA = b[1].filter(c => ACTIVE_STATUSES.includes(c.status)).length;
        return bA - aA || a[0].localeCompare(b[0], 'ko');
      });

    listHtml = groupEntries.map(([clientName, items]) => `
      <div class="camp-group">
        <div class="camp-group-header" onclick="App.selectClient('${escHtml(clientName)}')">
          <span class="camp-group-name">${escHtml(clientName)}</span>
          <span class="camp-group-count">${items.length}</span>
        </div>
        ${items.map(c => renderCampaignRow(c)).join('')}
      </div>
    `).join('') || '<div class="camp-empty">캠페인이 없습니다</div>';
  } else {
    listHtml = displayed.map(c => renderCampaignRow(c)).join('') ||
               '<div class="camp-empty">캠페인이 없습니다</div>';
  }

  return `
    <div class="camp-panel-header">
      <div class="camp-panel-title">${escHtml(title)}</div>
      <button class="btn btn-primary btn-sm" onclick="showNewCampaignModal()">+ 캠페인</button>
    </div>
    <div class="camp-panel-controls">
      <div class="camp-tabs">
        <button class="camp-tab${State.campFilter==='active'?' active':''}" onclick="App.setCampFilter('active')">
          진행중 <span class="camp-tab-count">${baseActive}</span>
        </button>
        <button class="camp-tab${State.campFilter==='done'?' active':''}" onclick="App.setCampFilter('done')">
          완료 <span class="camp-tab-count">${baseDone}</span>
        </button>
        <button class="camp-tab${State.campFilter==='all'?' active':''}" onclick="App.setCampFilter('all')">
          전체 <span class="camp-tab-count">${baseAll}</span>
        </button>
      </div>
      <div class="camp-search">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.5 1a5.5 5.5 0 1 0 3.594 9.714l3.596 3.596.707-.707-3.596-3.596A5.5 5.5 0 0 0 6.5 1zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/>
        </svg>
        <input type="text" class="camp-search-input" placeholder="검색…"
               value="${escHtml(State.search)}"
               oninput="App.setSearch(this.value)">
      </div>
    </div>
    <div class="camp-list">${listHtml}</div>
  `;
}

function renderCampaignRow(c) {
  const ddText = dday(c);
  const ddC = ddayCls(c);
  const isDone = !ACTIVE_STATUSES.includes(c.status);
  const isSelected = State.selectedCampaignId === c.id;
  const hasPay = ['미입금','부분입금'].includes(c.pay_status);
  const meta = STATUS_META[c.status] || { cls: 'sX', label: c.status };

  const uploadInfo = c.count_select
    ? `${c.count_upload || 0}/${c.count_select}`
    : '';

  const dateStr = c.date_end
    ? c.date_end.slice(5).replace('-', '/') + ' 마감'
    : '';

  const subParts = [meta.label, dateStr, hasPay ? '미입금' : ''].filter(Boolean);

  return `
    <div class="camp-row${isSelected ? ' selected' : ''}${isDone ? ' done' : ''}"
         onclick="App.selectCampaign('${c.id}')">
      <span class="camp-row-dot ${meta.cls}"></span>
      <div class="camp-row-main">
        <div class="camp-row-name">${escHtml(c.name)}</div>
        <div class="camp-row-sub">${escHtml(subParts.join(' · '))}</div>
      </div>
      <div class="camp-row-right">
        ${ddText ? `<span class="dday ${ddC}">${ddText}</span>` : ''}
        ${uploadInfo ? `<span class="camp-row-upload">${uploadInfo}</span>` : ''}
      </div>
    </div>`;
}

// ── VIEW: FINANCE ─────────────────────────────────────────────
function renderFinanceView() {
  const campaigns = Store.getCampaigns().filter(c => !c.is_archived && c.revenue > 0);
  const totalRev    = campaigns.reduce((s,c) => s+(c.revenue||0), 0);
  const totalProfit = campaigns.reduce((s,c) => s+(c._profit||0), 0);
  const unpaid = campaigns.filter(c => ['미입금','부분입금'].includes(c.pay_status));
  const unpaidTotal = unpaid.reduce((s,c) => s+(c.revenue||0), 0);

  const byMonth = {};
  campaigns.forEach(c => {
    const d   = c.date_end || c.date_start || '';
    const mon = d ? d.slice(0,7) : '미정';
    if (!byMonth[mon]) byMonth[mon] = [];
    byMonth[mon].push(c);
  });
  const months = Object.keys(byMonth).sort().reverse();

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
              <tr class="row-hover" onclick="App.selectCampaign('${c.id}')">
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
      </div>`;
  }).join('');

  return `
    <div class="page-header">
      <div class="page-title">📊 정산</div>
      <div style="margin-left:auto"><button class="btn btn-sm" onclick="exportCSV()">CSV 내보내기</button></div>
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
            <tr class="row-hover" onclick="App.selectCampaign('${c.id}')">
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
        <tbody>${clientRows}</tbody></table>
      </div>
    </div>

    ${monthBlocks}
  `;
}

// ── CSV EXPORT ────────────────────────────────────────────────
function exportCSV() {
  const data = Store.getCampaigns().filter(c => c.revenue > 0);
  const headers = ['UV','상태','캠페인명','거래처','진행사','매출','원고료','순이익','마진율','입금상태','견적서발행일','세금계산서발행일','마감일'];
  const rows = data.map(c => [
    c.uv||'', c.status, c.name, c.client_name||'', c.entity||'',
    c.revenue||0, c.fee||0, c._profit||0,
    c.revenue ? Math.round(c._profit/c.revenue*100)+'%' : '',
    c.pay_status||'', c.date_quote||'', c.date_tax||'', c.date_end||'',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `siriai-pm-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('CSV 다운로드 완료', 'ok');
}

// ── APP ────────────────────────────────────────────────────────
const App = {
  async init() {
    document.getElementById('clientPanel').innerHTML =
      '<div style="padding:20px;font-size:12px;color:var(--ink30)">로딩 중…</div>';

    try {
      await Store.init();
    } catch (e) {
      document.getElementById('campaignPanel').innerHTML = `
        <div class="camp-empty" style="padding:60px 20px">
          연결 실패<br><span style="font-size:11px">${escHtml(e.message)}</span>
        </div>`;
      return;
    }

    App.renderAll();
  },

  renderAll() {
    // Clear selected campaign if it's been archived/deleted
    if (State.selectedCampaignId) {
      const c = Store.getCampaignById(State.selectedCampaignId);
      if (!c || c.is_archived) State.selectedCampaignId = null;
    }

    document.getElementById('clientPanel').innerHTML = renderClientPanel();
    document.getElementById('campaignPanel').innerHTML = renderCampaignPanel();

    if (State.selectedCampaignId) {
      Detail.render(State.selectedCampaignId);
    } else {
      document.getElementById('detailPanel').innerHTML =
        '<div class="detail-empty">캠페인을 선택하세요</div>';
    }
  },

  // Called by store.js subscribeRealtime
  renderCurrentView() { App.renderAll(); },
  renderNotifications() { renderNotificationBadge(); },

  selectClient(name) {
    State.selectedClient = name;
    State.financeMode    = false;
    State.campFilter     = 'active';
    State.search         = '';
    App.renderAll();
  },

  selectCampaign(id) {
    State.selectedCampaignId = id;
    State.drawerSections = {};
    if (State.financeMode) {
      State.financeMode = false;
    }
    document.getElementById('campaignPanel').innerHTML = renderCampaignPanel();
    Detail.render(id);
  },

  // Legacy alias (called from finance rows, notifications, etc.)
  openDrawer(id) { App.selectCampaign(id); },

  setCampFilter(f) {
    State.campFilter = f;
    document.getElementById('campaignPanel').innerHTML = renderCampaignPanel();
  },

  setSearch(val) {
    State.search = val;
    document.getElementById('campaignPanel').innerHTML = renderCampaignPanel();
  },

  showFinance() {
    State.financeMode    = true;
    State.selectedClient = null;
    App.renderAll();
  },
};

// ── BOOT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
