import os

def load_template():
    with open('mega-pitch.html', 'r', encoding='utf-8') as f:
        html = f.read()
    head_end = html.find('</style>')
    return html[:head_end]

custom_css = """
/* ── PLAN HIERARCHY CSS ── */
.plan-level-header { padding: 120px 80px 60px; background: var(--black); color: var(--off-white); position: relative; overflow: hidden; }
.plan-level-header::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: linear-gradient(90deg, var(--pink-deep), var(--pink)); }
.plan-level-budget { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 4px; color: var(--pink); margin-bottom: 16px; display: inline-flex; align-items: center; border: 1px solid var(--pink); padding: 6px 14px; border-radius: 20px; text-transform: uppercase; }
.plan-level-title { font-family: 'Noto Sans KR', sans-serif; font-size: 56px; font-weight: 300; letter-spacing: -2px; line-height: 1.2; }

.hero-option-wrap { padding: 80px; background: var(--off-white); }
.ho-badge { display: inline-block; font-family: 'Noto Sans KR', sans-serif; font-size: 12px; font-weight: 800; background: var(--pink-deep); color: #fff; padding: 6px 12px; letter-spacing: 2px; margin-bottom: 16px; border-radius: 4px; }
.ho-title { font-family: 'Cormorant Garamond', serif; font-size: 80px; line-height: 1; letter-spacing: -2px; color: var(--ink); margin-bottom: 48px; }
.ho-subtitle { margin-left: 16px; font-style: italic; color: var(--muted); font-size: 40px; }

/* OPTION WRAPPER FOR FULL BLOCK */
.full-option-block { padding: 80px; border-bottom: 1px solid var(--border); }
.full-option-block:nth-child(even) { background: #FAF9F7; }
.full-option-block:nth-child(odd) { background: #FFFFFF; }


/* ── ORIGINAL METRICS & PHOTO DUAL ── */
.opt-body-info { display: flex; gap: 48px; align-items: start; margin-bottom: 56px; }
.photo-stack { display: flex; gap: 16px; flex-shrink:0; }
.brand-photo-wrap { display: flex; flex-direction: column; width: 280px; flex-shrink: 0; }
.brand-photo-item { width: 280px; height: 360px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); position: relative; }
.brand-photo-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(15%); transition: filter 0.3s; }
.brand-photo-item:hover .brand-photo-img { filter: grayscale(0%); }
.brand-photo-meta { padding: 12px 4px 0; }
.bpm-label { font-family: 'DM Sans', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px; }
.bpm-tag { display: inline-block; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; font-weight: 600; color: var(--pink-deep); background: var(--pink-light); padding: 4px 16px; border-radius: 20px; letter-spacing: 0.5px; }

.metrics-grid-wrap { display: flex; flex-direction: column; gap: 12px; flex:1; }
.o1-header { font-family:'DM Sans',sans-serif; font-size:10px; font-weight:500; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:12px; }
.metrics-top { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); background: var(--off-white); border-radius: 4px; overflow: hidden; }
.metric-box { padding: 24px 20px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: #fff; }
.metric-box:nth-child(3n) { border-right: none; }
.metric-box:nth-child(n+4) { border-bottom: none; }
.metric-box-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.metric-box-value { font-family: 'DM Sans', sans-serif; font-size: 26px; font-weight: 500; color: var(--ink); line-height: 1; }
.metric-box-unit { font-size: 12px; color: var(--muted); margin-left: 2px; }
.metric-box-value-plus { display: block; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--pink-deep); margin-top: 5px; letter-spacing: -0.3px; }
.metric-er-row { background: var(--ink); border-radius: 4px; padding: 24px; display: flex; align-items: center; gap: 24px; }
.er-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #fff; margin-bottom: 6px; }
.er-value { font-family: 'Cormorant Garamond', serif; font-size: 36px; color: var(--pink); line-height: 1; }
.er-plus { font-family: 'DM Sans', sans-serif; font-size: 18px; color: var(--pink); vertical-align: super; margin-left: 2px; }
.er-bar-wrap { flex: 1; }
.er-bar-bg { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 8px; }
.er-bar-fill { height: 100%; background: var(--pink); }
.er-bar-note { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #fff; opacity: 0.95; }
.followers-visual { background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 24px; }
.fv-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.fv-main { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: var(--ink); line-height: 1; margin-bottom: 16px; }
.fv-effective { display: flex; align-items: center; gap: 12px; }
.fv-eff-bar { flex: 1; height: 3px; background: var(--cement); border-radius: 2px; overflow: hidden; }
.fv-eff-fill { height: 100%; background: var(--pink); border-radius: 2px; }



/* ── SYNERGY JOURNEY ── */
.synergy-journey-section { padding-top: 64px; border-top: 1px solid var(--border); margin-top: 48px; }
.sj-title { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--pink-deep); margin-bottom: 48px; }
.sj-node { display: flex; gap: 40px; margin-bottom: 40px; position: relative; align-items: stretch; }
.sj-node:not(:last-child)::after { content: ''; position: absolute; top: 60px; bottom: -40px; left: 20px; width: 2px; background: repeating-linear-gradient(to bottom, var(--pink-deep) 0, var(--pink-deep) 6px, transparent 6px, transparent 12px); z-index: 1; opacity: 0.5; }
.sj-phase-col { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; z-index: 2; }
.sj-phase-dot { width: 40px; height: 40px; background: var(--pink-deep); border-radius: 50%; border: 4px solid var(--off-white); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.sj-content-col { flex: 1.5; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 24px; }
.inf-action { font-family: 'Noto Sans KR', sans-serif; font-size: 15px; font-weight: 400; line-height: 1.6; color: var(--ink); display: flex; gap: 16px; align-items: flex-start; }
.inf-avatar { background: #fafafa; border: 1px solid #ddd; border-radius: 50%; width: 44px; height: 44px; font-size: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.content-format-card { display: flex; gap: 16px; background: var(--stone); border-radius: 8px; padding: 20px; align-items: center; border: 1px solid var(--border); }
.cfc-icon { font-size: 28px; flex-shrink: 0; }
.cfc-body { display: flex; flex-direction: column; }
.cfc-title { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 700; color: var(--black); margin-bottom: 4px; }
.cfc-desc { font-size: 12px; color: var(--muted); font-weight: 400; margin-bottom: 8px; line-height: 1.5; }
.cfc-tags { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 1px; color: var(--pink-deep); text-transform: uppercase; }
.sj-reaction-col { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 24px; }
.sj-chat-box { display: flex; gap: 12px; }
.sj-chat-avatar { width: 36px; height: 36px; border-radius: 12px; background: #e8e8e8; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; border: 1px solid #ddd; }
.sj-chat-bubble { background: #fdfdfd; padding: 14px 16px; border-radius: 16px; border-top-left-radius: 4px; font-size: 13px; color: var(--ink); line-height: 1.5; border: 1px solid #eee; word-break:keep-all; }
.sj-chat-bubble span { font-weight: 700; box-shadow: inset 0 -8px 0 rgba(232,164,174,0.3); }
.sj-metric { display: flex; align-items: baseline; gap: 12px; background: var(--ink); color: #fff; padding: 20px 24px; border-radius: 8px; }
.sjm-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.7); }
.sjm-value { font-family: 'DM Sans', sans-serif; font-size: 26px; font-weight: 700; color: var(--pink); }

@media(max-width:900px) { .plan-level-header { padding: 80px 28px; } .hero-option-wrap, .full-option-block { padding: 48px 28px; } .sj-node { flex-direction: column; gap: 24px; } .sj-node:not(:last-child)::after { display: none; } .sj-phase-col { display: none; } .opt-body-info { flex-direction: column; } .photo-stack { width: 100%; flex-direction: column; } .brand-photo-item { width: 100%; height: 300px; } }
"""

html = load_template()
html += "\n" + custom_css + "\n</style>\n</head>\n<body>\n"

html += """
<nav class="sticky-nav" style="background:var(--black); padding: 16px 80px; position:sticky; top:0; z-index:200; display:flex; justify-content:space-between;">
  <span style="color:#fff; font-size:12px; font-weight:bold; letter-spacing:2px;">TEUMGYUL PITCH</span>
  <div style="display:flex; gap:24px;">
    <a href="#plan-a" style="color:var(--pink); text-decoration:none; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Plan A (High End)</a>
    <a href="#plan-b" style="color:rgba(255,255,255,0.5); text-decoration:none; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Plan B (Targeted)</a>
  </div>
</nav>
"""

DUMMY_IMG = "file:///C:/Users/WD/.gemini/antigravity/brain/e1a93622-2e8e-44e2-a09b-7dded7e390f9/dummy_influencer_1775558232037.png"

def render_option(opt_id, badge_title, title_left, title_right, img1, meta1_label, meta1_name, img2, meta2_label, meta2_name, metrics, nodes, single_person=False):
    # Build photos block
    photo1 = f"""
        <div class="brand-photo-wrap">
          <div class="brand-photo-item">
            <img src="{img1}" alt="{meta1_name}" class="brand-photo-img">
          </div>
          <div class="brand-photo-meta">
            <span class="bpm-label">{meta1_label}</span>
            <span class="bpm-tag">{meta1_name}</span>
          </div>
        </div>"""
    photo2 = "" if single_person else f"""
        <div class="brand-photo-wrap">
          <div class="brand-photo-item">
            <img src="{img2}" alt="{meta2_name}" class="brand-photo-img">
          </div>
          <div class="brand-photo-meta">
            <span class="bpm-label">{meta2_label}</span>
            <span class="bpm-tag">{meta2_name}</span>
          </div>
        </div>"""
    title_part = title_left if single_person else f"{title_left} <span class=\"ho-subtitle\">× {title_right}</span>"
    res = f"""
  <div class="full-option-block" id="{opt_id}">
    <div class="ho-badge">{badge_title}</div>
    <div class="ho-title">{title_part}</div>
    <div class="opt-body-info">
      <div class="photo-stack">{photo1}{photo2}
      </div>
      <div class="metrics-grid-wrap">
        <div class="o1-header">합산 지표 예측</div>
        <div class="metrics-top">
          <div class="metric-box"><div class="metric-box-label">총 팔로워</div><div class="metric-box-value">{metrics['followers']}</div></div>
          <div class="metric-box"><div class="metric-box-label">유효 팬덤</div><div class="metric-box-value">{metrics['fandom']}</div></div>
          <div class="metric-box"><div class="metric-box-label">평균 도달</div><div class="metric-box-value">{metrics['reach']}</div></div>
          <div class="metric-box"><div class="metric-box-label">영상 조회수</div><div class="metric-box-value">{metrics['views']}</div></div>
          <div class="metric-box"><div class="metric-box-label">평균 좋아요</div><div class="metric-box-value">{metrics['likes']}</div></div>
          <div class="metric-box"><div class="metric-box-label">반응 댓글</div><div class="metric-box-value">{metrics['comments']}</div></div>
        </div>
        <div class="metric-er-row">
          <div class="er-left"><div class="er-label">예상 참여율 ER</div><div class="er-value">{metrics['er']}<span class="er-plus">+</span></div></div>
          <div class="er-bar-wrap">
            <div class="er-bar-bg"><div class="er-bar-fill" style="width:{metrics['er_bar']}%"></div></div>
            <div class="er-bar-note">{metrics['er_note']}</div>
          </div>
        </div>
        <div class="followers-visual">
          <div class="fv-label">코어 시너지 지수 ({metrics['core']})</div>
          <div class="fv-main">{metrics['fandom']}&nbsp;&nbsp;&nbsp;</div>
          <div class="fv-effective"><div class="fv-eff-bar"><div class="fv-eff-fill" style="width:{metrics['core']}"></div></div></div>
        </div>
      </div>
    </div>
"""

    res += """
    <div class="synergy-journey-section">
      <div class="sj-title">Consumer Synergy Journey</div>
"""
    for i, node in enumerate(nodes):
        res += f"""
      <div class="sj-node">
        <div class="sj-phase-col"><div class="sj-phase-dot">{i+1}</div></div>
        <div class="sj-content-col">
          <div class="inf-action">
            <div class="inf-avatar">{node['avatar']}</div>
            <div>{node['action']}</div>
          </div>
          <div class="content-format-card">
            <div class="cfc-icon">{node['f_icon']}</div>
            <div class="cfc-body">
              <div class="cfc-title">{node['f_title']}</div>
              <div class="cfc-desc">{node['f_desc']}</div>
              <div class="cfc-tags">{node['f_tags']}</div>
            </div>
          </div>
        </div>
        <div class="sj-reaction-col">
          <div class="sj-chat-box">
            <div class="sj-chat-avatar">{node['c_avatar']}</div>
            <div class="sj-chat-bubble">{node['c_bubble']}</div>
          </div>
          <div class="sj-metric">
            <span class="sjm-label">{node['m_label']}</span><span class="sjm-value">{node['m_value']}</span>
          </div>
        </div>
      </div>
"""
    res += "    </div>\n  </div>"
    return res

# ────────── PLAN A DATA ──────────
a_best_nodes = [
    {'avatar': '📽️', 'action': '<strong>김고은</strong>: 브랜드 \'아뜰리에\'의 예술적 서사를 담아낸 하이패션 시네마틱 피드로 선망성의 임계치를 돌파합니다.', 'f_icon': '📜', 'f_title': '예술적 서사 아카이빙', 'f_desc': '브랜드 철학을 고도화된 비주얼 라이브러리로 제안', 'f_tags': 'INSTAGRAM ARTISTIC FEED', 'c_avatar': '👱🏻‍♀️', 'c_bubble': '와 이건 그냥 화보네... <span>이번 팝업 무조건 가야 할 이유가 생김.</span>', 'm_label': '브랜드 인지도 도달', 'm_value': '250M+'},
    {'avatar': '🎵', 'action': '<strong>릴리</strong>: 라이브러리에 리드미컬한 생동감을 부여하는 챌린지와 현장 인증으로 Z세대의 결속을 유도합니다.', 'f_icon': '🚀', 'f_title': '디지털 임팩트 숏폼', 'f_desc': '하이엔드 무드에 영(Young)한 바이럴 동력 주입', 'f_tags': 'SHORT-FORM VIRAL', 'c_avatar': '👩🏻‍🎓', 'c_bubble': '내 최애도 다녀갔네 ㅠㅠ <span>이번 주말 인증샷 성지는 여기다!</span>', 'm_label': '숏폼 확산 지수', 'm_value': 'Limit+'},
    {'avatar': '🔥', 'action': '<strong>팬덤 시너지</strong>: 최정상급 배우와 글로벌 팬덤의 교집합이 오프라인 방문 대기열과 굿즈 조기 완판의 기폭제가 됩니다.', 'f_icon': '📍', 'f_title': '자발적 UGC 확산', 'f_desc': '팝업스토어 현장 대기열 폭발 및 프리미엄 라인업 매진', 'f_tags': 'UGC / OFFLINE EXPLOSION', 'c_avatar': '🛒', 'c_bubble': '3시간 기다려서 겨우 들어옴... <span>그래도 에스더버니 굿즈 싹다 털어간다!</span>', 'm_label': '오프라인 실구매 전환', 'm_value': 'Top-Tier'}
]

a_alt1_nodes = [
    {'avatar': '🧥', 'action': '<strong>이시안</strong>: 라이프스타일 템플릿(OOTD)에 브랜드 아이템을 자연스럽게 큐레이션하여 타겟의 소유욕을 자극합니다.', 'f_icon': '👗', 'f_title': '하이엔드 OOTD 큐레이션', 'f_desc': '브랜드 제품을 일상 속 트렌디 아이템으로 재정의', 'f_tags': 'INSTAGRAM CORE FEED', 'c_avatar': '🧥', 'c_bubble': '이 코디 그대로 사고 싶다... <span>어디꺼인지 바로 들어가봐야지!</span>', 'm_label': '관심 타겟 정밀 도달', 'm_value': '150M+'},
    {'avatar': '🎵', 'action': '<strong>릴리</strong>: 패션 중심 피드에 아이돌 팬덤의 결속력을 더해 타겟 확장을 시도하는 크로스 플랫폼 캠페인을 전개합니다.', 'f_icon': '✨', 'f_title': '크로스-팬덤 인터페이스', 'f_desc': '패션 고관여층과 팬덤 타겟의 전략적 믹싱 숏폼', 'f_tags': 'MULTI-PLATFORM VIRAL', 'c_avatar': '🎧', 'c_bubble': '릴리한테 이 룩 너무 잘 어울림! <span>나도 이번 룩은 손민수 예약.</span>', 'm_label': '교차 유입 시너지', 'm_value': '185% ➚'},
    {'avatar': '💬', 'action': '<strong>커뮤니티 파급력</strong>: 무신사, 지그재그 등 핵심 플랫폼 유저층에 스며들어 자발적 아이템 추천과 검색량 폭증을 유도합니다.', 'f_icon': '📊', 'f_title': '자발적 디지털 바이럴', 'f_desc': '브랜드 제품의 \'머스트-해브\' 디지털 대세감 형성', 'f_tags': 'DIGITAL COMMUNITY DOMINANCE', 'c_avatar': '📈', 'c_bubble': '요즘 커뮤니티에 이거 엄청 올라오네. <span>이거 입은 사람들 길거리에서도 자주 보임.</span>', 'm_label': '브랜드 애피니티(Affinity)', 'm_value': 'Significant'}
]

a_alt2_nodes = [
    {'avatar': '📹', 'action': '<strong>강민경</strong>: 압도적인 트래픽과 기획력을 보유한 롱폼 콘텐츠를 통해 브랜드의 감성을 독점적인 시각으로 조명합니다.', 'f_icon': '📺', 'f_title': '메가 브랜디드 필름', 'f_desc': '단독 영상만으로 전국적 인지도와 트래픽 마동력을 확보', 'f_tags': 'MEGA YOUTUBE STRATEGY', 'c_avatar': '🍿', 'c_bubble': '오늘 영상 퀄리티 미쳤네 ㅋㅋㅋ <span>영상에 나온 템들 다 내 스타일이야.</span>', 'm_label': '초동 조회 임팩트', 'm_value': '200M+'},
    {'avatar': '📸', 'action': '<strong>강민경</strong>의 인스타그램과 숏폼 클립 연계를 통해 유튜브의 폭발력을 비주얼 퍼널로 락인(Lock-in)시킵니다.', 'f_icon': '📱', 'f_title': '크로스 플랫폼 퍼널', 'f_desc': '유튜브 시청자를 인스타그램 비주얼 아카이브로 유도', 'f_tags': 'SNS LOCK-IN STRATEGY', 'c_avatar': '📷', 'c_bubble': '방금 유튜브 보고 바로 인스타 팔로우함. <span>룩북 정보 다 담고 싶음!</span>', 'm_label': '퍼널 전환 효율', 'm_value': 'Maximized'},
    {'avatar': '🏢', 'action': '<strong>트래픽 마비 효과</strong>: 강민경 단독 캠페인이 유발하는 압도적인 화력을 통해 자사몰 서버 마비와 조기 솔드아웃을 달성합니다.', 'f_icon': '💸', 'f_title': '서버 폭주 및 집중 결제', 'f_desc': '가장 빠르고 강력한 제품 솔드아웃 파이프라인 구축', 'f_tags': 'TRAFFIC TO SALES', 'c_avatar': '🛒', 'c_bubble': '아 장바구니 담는 와중에 품절 ㅠㅠ <span>제발 재입고 일정 좀 알려주세요!</span>', 'm_label': '결제 전환액', 'm_value': 'Sold Out'}
]

# ────────── PLAN B DATA ──────────
b_best_nodes = [
    {'avatar': '📱', 'action': '<strong>릴리</strong>: 고감도 숏폼 티징을 통해 브랜드 콜라보레이션에 대한 고관여 타겟의 원초적인 호기심을 극대화합니다.', 'f_icon': '🎭', 'f_title': '전략적 호기심 티징', 'f_desc': '짧고 강렬한 이미지 잔상으로 본편 리뷰 기대감 증폭', 'f_tags': 'TEASING SHORTS', 'c_avatar': '🎧', 'c_bubble': '에스더버니 콜라보 실화? <span>빨리 릴리 리뷰 영상 정주행하고 싶음.</span>', 'm_label': '인지 정밀 트래픽', 'm_value': '2.0M+'},
    {'avatar': '💻', 'action': '<strong>송이송이</strong>: 전문가급 딥-다이브 리뷰와 독점 프로모션 혜택을 연계하여 실질적인 구매 전환을 관통합니다.', 'f_icon': '🛒', 'f_title': '딥-다이브 리뷰 & 커머스', 'f_desc': '설득력 있는 리뷰와 한정 할인 코드로 구매 장벽 제거', 'f_tags': 'REVIEW TO CONVERSION', 'c_avatar': '💳', 'c_bubble': '송이송이 코드로 할인 엄청 되네? <span>마감 전에 무조건 세트로 지른다.</span>', 'm_label': '할인코드 전환율', 'm_value': '4.15%'},
    {'avatar': '📦', 'action': '<strong>자생적 공유(UGC)</strong>: 구매 타겟의 만족감이 자발적인 언박싱 및 팬덤 챌린지로 이어지며 유기적 확산을 완성합니다.', 'f_icon': '📸', 'f_title': '유기적 2차 확산 트리거', 'f_desc': '실구매자의 자발적 숏폼 언박싱과 선순환 알고리즘', 'f_tags': 'ORGANIC UGC VIRAL', 'c_avatar': '💝', 'c_bubble': '배송 오자마자 언박싱 영상 올림! <span>실물이 오조오억 배 예뻐요 ㅠㅠ</span>', 'm_label': 'UGC 자생 비율', 'm_value': '250% ➚'}
]

b_alt1_nodes = [
    {'avatar': '🎯', 'action': '<strong>릴리</strong>: 캠페인의 기준점이 되는 앵커 숏폼을 선발행하여 알고리즘의 중심축과 대세감을 형성합니다.', 'f_icon': '⚓', 'f_title': '알고리즘 앵커 숏폼', 'f_desc': '공식 음원 및 필터 바이럴의 가이드라인 제시', 'f_tags': 'MAIN CAMPAIGN ANCHOR', 'c_avatar': '📱', 'c_bubble': '요즘 릴스 넘기면 이 브금은 무조건 나옴 ㅋㅋ <span>완전 대세인 듯!</span>', 'm_label': '인지 시작점 형성', 'm_value': 'Critical'},
    {'avatar': '🏘️', 'action': '<strong>미드티어 30인</strong>: 약속된 주간 내 30개의 채널에서 융단폭격을 가해 인스타그램 알고리즘 탭을 점유합니다.', 'f_icon': '💣', 'f_title': '디지털 점유 융단폭격', 'f_desc': '다각적 채널 운용을 통한 압도적인 노출 빈도 확보', 'f_tags': 'REELS MASSIVE CAMPAIGN', 'c_avatar': '👀', 'c_bubble': '오늘만 이 피드 세 번 봄. <span>이정도면 나도 안 사면 손해인 느낌?</span>', 'm_label': '노출 점유 효율', 'm_value': '65M+'},
    {'avatar': '🌍', 'action': '<strong>탐색 탭(Explore) 장악</strong>: 주말 골든타임 탐색 탭을 압도적으로 지배하며 트렌드 창조자(Target Hero)로 등급을 강화합니다.', 'f_icon': '📊', 'f_title': '알고리즘 대세감 고착화', 'f_desc': '단기간 내 집중 노출로 뇌리에 브랜드를 각인시키는 전략', 'f_tags': 'TREND DOMINANCE', 'c_avatar': '🔥', 'c_bubble': '말해 뭐해, 이번 주말 인스타는 이게 다 함. <span>결국 홀린 듯 구매 완료함.</span>', 'm_label': '대세감 점유율', 'm_value': 'Dominant'}
]


metrics_a_best = {'followers':'850', 'fandom':'460', 'reach':'130', 'views':'160', 'likes':'15', 'comments':'700', 'er':'1.45', 'er_bar':87, 'er_note': '글로벌 아이콘의 대중적 파급력과 K-POP 코어 팬덤의 열광적 충성도 결합', 'core':'54.1%'}
metrics_a_alt1 = {'followers':'610', 'fandom':'340', 'reach':'110', 'views':'130', 'likes':'11', 'comments':'550', 'er':'1.80', 'er_bar':92, 'er_note': '패션 고관여 페르소나형 타겟에 대한 정밀한 접근과 세분화된 구매 전환 유도', 'core':'55.7%'}
metrics_a_alt2 = {'followers':'1,100', 'fandom':'550', 'reach':'200', 'views':'250', 'likes':'20', 'comments':'1,500', 'er':'1.25', 'er_bar':75, 'er_note': '압도적인 디지털 도달 범위와 검색어 지배력을 통한 거시적 브랜드 파급력 확보', 'core':'50.0%'}

metrics_b_best = {'followers':'690', 'fandom':'400', 'reach':'120', 'views':'250', 'likes':'11', 'comments':'완판', 'er':'3.20', 'er_bar':92, 'er_note': '심층 리뷰를 통한 고관여 타겟 설득과 프로모션 코드 연계로 즉각적 ROI 창출', 'core':'82.1%'}
metrics_b_alt1 = {'followers':'350 (Total)','fandom':'210', 'reach':'80', 'views':'180', 'likes':'8', 'comments':'400', 'er':'2.10', 'er_bar':85, 'er_note': '30개 채널 동시다발 분산을 통한 노출 빈도 극대화 및 알고리즘 해킹 전략', 'core':'60.0%'}

html += '<!-- ───────────── PLAN A ───────────── -->\n<div id="plan-a">'
html += '<div class="plan-level-header"><div class="plan-level-budget">Strategy Increase: 35,000,000 KRW</div><div class="plan-level-title">하이엔드 임팩트: 브랜드 아카이브의<br>예술적 확장과 선망성 극대화</div></div>'

html += render_option("opt1", "Plan A 최적안", "김고은", "릴리", 
    "images/김고은.webp", "A-LIST ARTOR ARCHIVE", "김고은", 
    "images/앤믹스 릴리.webp", "GLOBAL ICON PORTRAIT", "릴리", 
    metrics_a_best, a_best_nodes)

html += render_option("opt1-alt1", "Plan A 대안 1", "이시안 외", "릴리", 
    "images/이시안.webp", "FASHION TREND-SETTER", "이시안", 
    "images/앤믹스 릴리.webp", "GLOBAL ICON PORTRAIT", "릴리", 
    metrics_a_alt1, a_alt1_nodes)

html += render_option("opt1-alt2", "Plan A 대안 2", "강민경", "", 
    "images/강민경.webp", "MEGA CREATOR SYNERGY", "강민경", 
    "", "", "", 
    metrics_a_alt2, a_alt2_nodes, single_person=True)
html += '</div>'

html += '<!-- ───────────── PLAN B ───────────── -->\n<div id="plan-b">'
html += '<div class="plan-level-header"><div class="plan-level-budget">Efficiency Plan: 25,000,000 KRW</div><div class="plan-level-title">퍼포먼스 집약: 고관여 타겟 점유를 통한<br>실질적 전환과 디지털 대세감 점유</div></div>'

html += render_option("opt2", "Plan B 최적안", "릴리", "송이송이", 
    "images/앤믹스 릴리.webp", "GLOBAL ICON PORTRAIT", "릴리", 
    "images/송이송이.jpg", "NICHE EXPERT REVIEWER", "송이송이", 
    metrics_b_best, b_best_nodes)

html += render_option("opt2-alt1", "Plan B 대안 1", "릴리", "미드티어 그룹", 
    "images/앤믹스 릴리.webp", "GLOBAL ICON PORTRAIT", "릴리", 
    "images/라잇썸.webp", "MASSIVE MID-TIER CREATORS (x30)", "GROUP 30", 
    metrics_b_alt1, b_alt1_nodes)
html += '</div></body></html>'

with open('teumgyul-combo-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
