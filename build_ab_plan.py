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

/* ── SMALL CARTOON THUMB (HOVER ZOOM) ── */
.cartoon-thumb { position: relative; margin-top: 16px; margin-bottom: 48px;  display: inline-block; cursor: default; }
.ct-btn { display: inline-flex; align-items: center; gap: 8px; font-family: 'Noto Sans KR', sans-serif; font-size: 12px; font-weight: 600; color: var(--ink); background: #fff; border: 1px solid var(--border); padding: 10px 20px; border-radius: 20px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.ct-btn:hover { color: var(--pink-deep); border-color: var(--pink); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.ct-popover { position: absolute; z-index: 100; top: 120%; left: 0; width: 450px; background: #fff; border: 1px solid var(--pink); border-radius: 8px; box-shadow: 0 12px 32px rgba(0,0,0,0.15); padding: 16px; opacity: 0; pointer-events: none; transform: translateY(10px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.cartoon-thumb:hover .ct-popover { opacity: 1; pointer-events: auto; transform: translateY(0); }
.ct-pop-img { width: 100%; height: auto; border-radius: 4px; border: 1px solid var(--border); }
.ct-kor-overlay { position: absolute; top: 10%; right: 5%; background: rgba(255,255,255,0.95); border: 2px solid var(--black); border-radius: 12px; padding: 10px 16px; font-family: 'Noto Sans KR', sans-serif; font-weight: 800; font-size: 13px; box-shadow: 2px 2px 0px var(--black); word-break:keep-all; }

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
CARTOON_A = "file:///C:/Users/WD/.gemini/antigravity/brain/e1a93622-2e8e-44e2-a09b-7dded7e390f9/marketoonist_presence_kr_1775556772803.png"
CARTOON_B = "file:///C:/Users/WD/.gemini/antigravity/brain/e1a93622-2e8e-44e2-a09b-7dded7e390f9/marketoonist_sales_kr_1775556788986.png"

def render_option(opt_id, badge_title, title_left, title_right, img1, meta1_label, meta1_name, img2, meta2_label, meta2_name, metrics, nodes, cartoon=None, c_text=None, single_person=False):
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
    if cartoon:
        res += f"""
    <div class="cartoon-thumb">
      <div class="ct-btn">🔍 시나리오 보기</div>
      <div class="ct-popover">
        <div class="ct-kor-overlay">{c_text}</div>
        <img src="{cartoon}" class="ct-pop-img" alt="cartoon">
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
    {'avatar': '🎬', 'action': '<strong>김고은</strong>님이 브랜드 아뜰리에 콘셉트와 공명하는 고급스러운 공간 투어 화보/피드를 업로드합니다.', 'f_icon': '💎', 'f_title': '프리미엄 공간 화보', 'f_desc': '가장 고급스러운 형태로 브랜드 인지도 수직 상승', 'f_tags': 'INSTAGRAM FEED', 'c_avatar': '👩🏻‍🎓', 'c_bubble': '와 스케일 대박. <span>여기가 요즘 제일 핫하다며?</span>', 'm_label': '예상 초기 도달', 'm_value': '250M+'},
    {'avatar': '🎵', 'action': '<strong>릴리</strong>가 현장 인증 챌린지를 진행하며 Z세대 팬덤을 확산의 중심 도구로 활용합니다.', 'f_icon': '🕺', 'f_title': '현장 인증 챌린지', 'f_desc': '무거운 브랜드 무드에 젊고 바이럴한 생동감 믹스', 'f_tags': 'REELS / SHORTS', 'c_avatar': '👱🏻‍♀️', 'c_bubble': '내 최애도 다녀갔네. <span>나도 이번 주말에 무조건 인증 찍는다!</span>', 'm_label': '2차 확산 화제성', 'm_value': 'Max'},
    {'avatar': '🔥', 'action': '<strong>김고은 × 릴리 팬덤</strong>과 일반고객의 폭발적인 교집합으로, 오프라인 방문 대기열이 극대화됩니다.', 'f_icon': '📍', 'f_title': '위치태그 인증 및 리뷰', 'f_desc': '팝업스토어 오프라인 방문폭주 및 굿즈 메인라인 완판', 'f_tags': 'UGC / OFFLINE', 'c_avatar': '📸', 'c_bubble': '웨이팅 3시간 실화냐 ㅠㅠ <span>그래도 들어왔으니 굿즈 싹다 털어간다.</span>', 'm_label': '오프라인 대기 및 결제', 'm_value': 'Tier 1'}
]

a_alt1_nodes = [
    {'avatar': '👗', 'action': '<strong>이시안 등(패션/라이프 인플루언서)</strong>이 라이프스타일 템플릿(OOTD) 기반 브이로그를 업로드합니다.', 'f_icon': '👜', 'f_title': 'OOTD 라이프스타일로그', 'f_desc': '브랜드 아이템을 일상 패션에 자연스럽게 녹여냄', 'f_tags': 'YOUTUBE / FEED', 'c_avatar': '👩🏻‍💼', 'c_bubble': '저 옷 코디 완전 내 스타일인데? <span>당장 손민수해야지.</span>', 'm_label': '관심 타겟 도달', 'm_value': '150M+'},
    {'avatar': '🎵', 'action': '<strong>릴리</strong>의 숏폼 챌린지 교차가 발생하며 팬덤 유입을 유도합니다.', 'f_icon': '✨', 'f_title': '크로스태그 챌린지', 'f_desc': '이종 관심사(패션+아이돌) 타겟간 믹스효과', 'f_tags': 'REELS', 'c_avatar': '🎧', 'c_bubble': '릴리한테 이 옷 완전 찰떡! 나도 입어보고 싶어지네.', 'm_label': '바이럴 확산율', 'm_value': '180% ➚'},
    {'avatar': '📈', 'action': '<strong>커뮤니티 파급력</strong>이 무신사, 지그재그 등 핵심 패션 고관여 플랫폼 유저층에 스며듭니다.', 'f_icon': '💬', 'f_title': '커뮤니티 자발적 바이럴', 'f_desc': '브랜드 제품의 트렌디 아이템화 (Brand Affinity)', 'f_tags': 'COMMUNITY / FORUM', 'c_avatar': '👕', 'c_bubble': '요즘 이거 입은 사람들 엄청 보이네. <span>완전 대세템 등극인듯.</span>', 'm_label': '호감도(Affinity) 상승', 'm_value': 'High'}
]

a_alt2_nodes = [
    {'avatar': '🎥', 'action': '<strong>강민경</strong>이 대형 유튜브 기획물에서 브랜드 아이템을 자연스럽게 노출하고, 감성적인 인스타그램 피드로 이중 공략합니다.', 'f_icon': '📺', 'f_title': '초대형 롱폼 예능', 'f_desc': '거대한 구독자층을 기반으로 시청자들을 몰입시키는 기획력', 'f_tags': 'YOUTUBE', 'c_avatar': '👨🏻‍💻', 'c_bubble': '오늘 영상 폼 미쳤다 ㅋㅋ <span>저기 나온 템 뭔지 찾아봐야지.</span>', 'm_label': '초기 조회 트래픽', 'm_value': '200M+'},
    {'avatar': '📸', 'action': '<strong>강민경</strong>의 인스타그램 피드와 숏폼이 연계되며, 유튜브 시청자를 비주얼 콘텐츠로 재유입시킵니다.', 'f_icon': '📱', 'f_title': 'SNS 크로스 플랫폼 연계', 'f_desc': '유튜브 팬과 인스타 팔로워를 하나의 퍼널로 통합', 'f_tags': 'INSTAGRAM / SHORTS', 'c_avatar': '🎮', 'c_bubble': '유튜브에서 봤는데 인스타에도 올라왔네. <span>완전 빠져들었다. 바로 들어가본다.</span>', 'm_label': '자사몰 인바운드 전송', 'm_value': 'Limit'},
    {'avatar': '📦', 'action': '<strong>단독 캠페인 집중 효과</strong>로 예산 분산 없이 강민경 채널의 폭발력이 자사몰 트래픽을 일시 마비시킵니다.', 'f_icon': '💸', 'f_title': '트래픽 집중 폭발 및 매진', 'f_desc': '메인 콜라보 라인업 최단시간 솔드아웃 파이프라인', 'f_tags': 'E-COMMERCE', 'c_avatar': '🛒', 'c_bubble': '장바구니 담아뒀는데 <span>그새 품절됨... 재입고 알림 신청했다 ㅠ</span>', 'm_label': '결제액 집중 및 Sold Out', 'm_value': 'Sold Out'}
]

# ────────── PLAN B DATA ──────────
b_best_nodes = [
    {'avatar': '🎵', 'action': '<strong>릴리</strong>가 쇼츠와 릴스를 통해 대중의 이목과 신제품에 대한 호기심을 이끕니다.', 'f_icon': '🕺', 'f_title': '숏폼 호기심 티징', 'f_desc': '광범위한 타겟에게 브랜드 신규 콜라보레이션 티징', 'f_tags': 'REELS / SHORTS', 'c_avatar': '🎧', 'c_bubble': '새 노래 뜨는 거 보니까 <span>본편 리뷰 영상도 곧 올라오겠네.</span>', 'm_label': '고관여 인지 트래픽', 'm_value': '2.0M+'},
    {'avatar': '💻', 'action': '<strong>매니아급 유튜버(TBD)</strong>가 프로모션 코드가 포함된 딥-다이브 리뷰 영상을 게재하여 구매욕을 자극합니다.', 'f_icon': '📺', 'f_title': '제품 리뷰 & 프로모션', 'f_desc': '설득력 있는 리뷰와 한정 할인 코드로 강한 전환 유도', 'f_tags': 'YOUTUBE / SALES', 'c_avatar': '🛒', 'c_bubble': '코드 1시간 남았다고? <span>이건 못참지. 당장 세트로 결제한다.</span>', 'm_label': '할인코드 결제 전환율', 'm_value': '4.1%'},
    {'avatar': '🤳', 'action': '<strong>선순환 UGC 생성</strong> 시청자의 즉각적인 결제가 결국 자발적 2차 언박싱 숏폼으로 이어집니다.', 'f_icon': '📦', 'f_title': '자발적 언박싱 및 리뷰', 'f_desc': '결제자들이 직접 만드는 구매 후기 숏폼 확산 트리거', 'f_tags': 'TIKTOK / SHORTS UGC', 'c_avatar': '🥰', 'c_bubble': '무사히 특템 성공! <span>배송 오자마자 바로 언박싱 영상 올려야지~</span>', 'm_label': 'UGC 2차 확산 비율', 'm_value': '250% ➚'}
]

b_alt1_nodes = [
    {'avatar': '🎵', 'action': '<strong>릴리</strong>가 메인 캠페인 앵커 형태의 숏폼을 우선 발행하여 알고리즘 기준점을 세웁니다.', 'f_icon': '🎯', 'f_title': '메인 앵커 숏폼', 'f_desc': '공식 해시태그와 음원을 알리는 신호탄 역할', 'f_tags': 'INSTAGRAM REELS', 'c_avatar': '📱', 'c_bubble': '이 브금(BGM) 완전 좋네. 요즘 다 이 필터로 찍던데?', 'm_label': '관심 시작점 형성', 'm_value': 'Base'},
    {'avatar': '🧑‍🤝‍🧑', 'action': '<strong>미드티어 인플루언서 30명</strong>이 약속된 해시태그와 함께 릴스를 융단 폭격하여 노출을 극대화합니다.', 'f_icon': '💥', 'f_title': '릴스 물량 융단폭격', 'f_desc': '다수의 미드급 채널을 동시 다발적으로 가동하여 알고리즘 해킹', 'f_tags': 'REELS (x30)', 'c_avatar': '👀', 'c_bubble': '요즘 인스타 켤 때마다 <span>이거 무조건 한 번씩은 보이네. 대세긴 대세네.</span>', 'm_label': '동시다발적 점유율', 'm_value': '60M+'},
    {'avatar': '🌐', 'action': '<strong>탐색 탭(Explore) 지배</strong> 특정 주말 동안 인스타그램 탐색 탭을 압도적으로 지배하며 트렌드를 창조합니다.', 'f_icon': '📈', 'f_title': '대세감 알고리즘 형성', 'f_desc': '누구나 한 번쯤 보게 되는 파괴적인 대세감과 뇌리 주입', 'f_tags': 'EXPLORE TAB / TREND', 'c_avatar': '🔥', 'c_bubble': '내 친구들도 다 이거 얘기하더라. <span>결국 호기심에 한 번 사본다.</span>', 'm_label': '최종 대세감 점유율', 'm_value': 'Dominant'}
]


metrics_a_best = {'followers':'850', 'fandom':'460', 'reach':'130', 'views':'160', 'likes':'15', 'comments':'700', 'er':'1.45', 'er_bar':87, 'er_note':'메가급 배우의 대중성과 K-POP 코어 팬덤의 압도적 반응률', 'core':'54.1%'}
metrics_a_alt1 = {'followers':'610', 'fandom':'340', 'reach':'110', 'views':'130', 'likes':'11', 'comments':'550', 'er':'1.80', 'er_bar':92, 'er_note':'패션 고관여 층 밀집으로 클릭 구매 및 전환에 극대화된 임팩트', 'core':'55.7%'}
metrics_a_alt2 = {'followers':'1,100', 'fandom':'550', 'reach':'200', 'views':'250', 'likes':'20', 'comments':'1,500', 'er':'1.25', 'er_bar':75, 'er_note':'무차별적 글로벌 트래픽의 발생으로 거시적 관점의 파급력 보장', 'core':'50.0%'}

metrics_b_best = {'followers':'690', 'fandom':'400', 'reach':'120', 'views':'250', 'likes':'11', 'comments':'완판', 'er':'3.20', 'er_bar':92, 'er_note':'상세 리뷰 영상을 통한 프로모션 직결로 세일즈 전환율 극대화', 'core':'82.1%'}
metrics_b_alt1 = {'followers':'350 (Total)','fandom':'210', 'reach':'80', 'views':'180', 'likes':'8', 'comments':'400', 'er':'2.10', 'er_bar':85, 'er_note':'30개 채널 동시다발 분산을 통한 락인 방어 및 노출 빈도 확대', 'core':'60.0%'}


html += '<!-- ───────────── PLAN A ───────────── -->\n<div id="plan-a">'
html += '<div class="plan-level-header"><div class="plan-level-budget">Budget Increase: 35,000,000 KRW</div><div class="plan-level-title">하이엔드 영향력과<br>프리미엄 확산의 극대화</div></div>'

html += render_option("opt1", "Plan A 최적안", "김고은", "릴리", 
    "images/김고은.webp", "A-LIST ACTOR", "김고은", 
    "images/앤믹스 릴리.webp", "NMIXX PORTRAIT", "릴리", 
    metrics_a_best, a_best_nodes, CARTOON_A, "웨이팅 길어도 남겨야지📸")

html += render_option("opt1-alt1", "Plan A 대안 1", "이시안 외", "릴리", 
    "images/이시안.webp", "FASHION INFLUENCER", "이시안", 
    "images/앤믹스 릴리.webp", "NMIXX PORTRAIT", "릴리", 
    metrics_a_alt1, a_alt1_nodes)

html += render_option("opt1-alt2", "Plan A 대안 2", "강민경", "", 
    "images/강민경.webp", "S-TIER YOUTUBER", "강민경", 
    "", "", "", 
    metrics_a_alt2, a_alt2_nodes, single_person=True)
html += '</div>'

html += '<!-- ───────────── PLAN B ───────────── -->\n<div id="plan-b">'
html += '<div class="plan-level-header"><div class="plan-level-budget">Current Budget: 25,000,000 KRW</div><div class="plan-level-title">타겟 지향적 매출 전환과<br>콘텐츠 융단 폭격</div></div>'

html += render_option("opt2", "Plan B 최적안", "릴리", "매니아급 유튜버", 
    "images/앤믹스 릴리.webp", "NMIXX PORTRAIT", "릴리", 
    "images/송이송이.jpg", "NICHE YOUTUBER", "송이송이", 
    metrics_b_best, b_best_nodes, CARTOON_B, "할인 시간 1시간 남음! 결제간다💸")

html += render_option("opt2-alt1", "Plan B 대안 1", "릴리", "미드티어 그룹", 
    "images/앤믹스 릴리.webp", "NMIXX PORTRAIT", "릴리", 
    "images/라잇썸.webp", "MID-TIER CREATORS (x30)", "GROUP 30", 
    metrics_b_alt1, b_alt1_nodes)
html += '</div></body></html>'

with open('teumgyul-combo-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
