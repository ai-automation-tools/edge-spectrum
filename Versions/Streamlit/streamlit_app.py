"""THE EDGE SPECTRUM — Streamlit port of V19 (Dark-Sidebar-Theme).

Run locally:   streamlit run streamlit_app.py
Deploy:        push to GitHub, connect at https://share.streamlit.io/
"""

from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from data import (
    ALL_CATS, CC, HZ, HZ_LBL, HZ_DAYS, I_Y, DCA_AMT,
    AR_DEFAULT, AR_CLR, AR_LBL, RAW,
)

st.set_page_config(
    page_title="Edge Spectrum | V19",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── MATH ─────────────────────────────────────────────────────────────────────
def gamb_ret(edge: float, du: float, ced: float, days: int) -> float:
    return du * days * (ced / 100) * edge


def inv_ret(annual_pct: float, years: float) -> float:
    return ((1 + annual_pct / 100) ** years - 1) * 100


@st.cache_data
def precompute() -> pd.DataFrame:
    rows = []
    for r in RAW:
        v = {}
        for h in HZ:
            if r["m"] == "g":
                v[h] = (r["ced"] / 100) * r["e"] if h == "1du" \
                    else gamb_ret(r["e"], r["du"], r["ced"], HZ_DAYS[h])
            else:
                v[h] = inv_ret(r["a"], I_Y[h])
        rows.append({**r, **{f"v_{h}": v[h] for h in HZ},
                     "ar": AR_DEFAULT.get(r["cat"], 2)})
    return pd.DataFrame(rows)


D = precompute()


# ── STYLING ──────────────────────────────────────────────────────────────────
st.markdown("""
<style>
/* Page background + typography */
.stApp { background: #030303; }
html, body, [class*="css"] { font-family: 'Inter', -apple-system, Helvetica, Arial, sans-serif; }

/* Banner */
.es-banner {
    padding: 18px 28px;
    background: #030303;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    margin: -1rem -1rem 1.5rem -1rem;
}
.es-brand h1 {
    font-size: 1.35rem; font-weight: 800; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.5));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin: 0;
}
.es-brand p {
    font-size: 0.68rem; color: #71717a; margin-top: 4px;
    font-weight: 500; letter-spacing: 0.02em;
}
.es-legend {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.6rem; font-weight: 700; color: #3f3f46;
    text-transform: uppercase; letter-spacing: 0.1em;
}
.es-legend-grad {
    width: 130px; height: 4px; border-radius: 2px;
    background: linear-gradient(90deg, #22c55e, #a3e635, #facc15, #fb923c, #ef4444);
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.15);
}

/* Stat cards */
.es-stat {
    background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex; flex-direction: column; gap: 6px;
    transition: transform 0.2s, border-color 0.2s;
    height: 100%;
}
.es-stat:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
.es-stat-label {
    font-size: 0.58rem; font-weight: 700; color: #3f3f46;
    text-transform: uppercase; letter-spacing: 0.06em;
}
.es-stat-value {
    font-family: 'Geist Mono', ui-monospace, Menlo, monospace;
    font-size: 1.15rem; font-weight: 700; color: #e4e4e7;
}
.es-stat-value.pos { color: #22c55e; }
.es-stat-value.neg { color: #ef4444; }
.es-stat-value.warn { color: #facc15; }

/* Chart frame */
.es-chart-hdr {
    padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    background: #0a0a0a;
    border-radius: 16px 16px 0 0;
    border: 1px solid rgba(255,255,255,0.06); border-bottom: 0;
    margin-bottom: -0.5rem;
}
.es-chart-title {
    font-size: 0.72rem; font-weight: 700; color: #71717a;
    display: flex; align-items: center; gap: 8px;
}
.es-chart-title::before {
    content: ''; width: 4px; height: 12px;
    background: #6366f1; border-radius: 2px;
}
.es-chart-meta {
    font-size: 0.6rem; color: #3f3f46; font-weight: 700; letter-spacing: 0.04em;
}

/* Footer */
.es-footer {
    margin-top: 1.5rem; padding: 10px 0;
    font-size: 0.6rem; color: #3f3f46; font-weight: 600;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    letter-spacing: 0.04em;
}

/* Sidebar polish */
section[data-testid="stSidebar"] { background: #0a0a0a; border-right: 1px solid rgba(255,255,255,0.06); }
section[data-testid="stSidebar"] h3 {
    font-size: 0.58rem !important; font-weight: 800 !important;
    color: #3f3f46 !important; text-transform: uppercase;
    letter-spacing: 0.1em; margin-top: 1rem;
}

/* Hide Streamlit chrome — keep header transparent so sidebar toggle stays usable */
#MainMenu, footer { visibility: hidden; height: 0; }
header[data-testid="stHeader"] { background: transparent; }
</style>
""", unsafe_allow_html=True)


# ── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<div class="es-banner">
  <div class="es-brand">
    <h1>THE EDGE SPECTRUM</h1>
    <p>RE-DEFINING THE BOUNDARY OF EXPECTED RETURNS</p>
  </div>
  <div class="es-legend">
    <span>PLAYER</span>
    <div class="es-legend-grad"></div>
    <span>HOUSE</span>
  </div>
</div>
""", unsafe_allow_html=True)


# ── SIDEBAR CONTROLS ─────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### Category Filter")
    default_cats = [c for c in ALL_CATS if c not in ("Casino Gambling", "Poker & Skill-Based")]
    selected_cats = st.multiselect(
        "Categories",
        options=ALL_CATS,
        default=default_cats,
        label_visibility="collapsed",
    )

    st.markdown("### Time Horizon")
    horizon = st.radio(
        "Time Horizon",
        options=HZ,
        format_func=lambda h: HZ_LBL[h],
        index=HZ.index("1yr"),
        label_visibility="collapsed",
    )

    st.markdown("### Projection Layer")
    layer_labels = {"raw": "RAW", "fees": "FEES", "tax": "TAX", "all": "OVERLAY"}
    layer = st.radio(
        "Projection Layer",
        options=list(layer_labels.keys()),
        format_func=lambda l: layer_labels[l],
        index=0,
        label_visibility="collapsed",
        horizontal=True,
    )

    st.markdown("### Insights & Overlays")
    show_dca = st.checkbox(f"Dollar Cost (${DCA_AMT['1wk']}/wk)")
    show_risk = st.checkbox("Addiction Modeling")
    show_ruin = st.checkbox("Ruin Probability")


# ── DATA FILTER ──────────────────────────────────────────────────────────────
def filter_data(df: pd.DataFrame) -> pd.DataFrame:
    d = df[df["cat"].isin(selected_cats)].copy()
    if layer != "all":
        if layer == "raw":
            d = d[d["ly"] == "raw"]
        elif layer == "fees":
            d = d[d["ly"].isin(["raw", "fee"])]
        else:  # tax
            d = d[d["ly"].isin(["raw", "tax"])]
    return d.sort_values(f"v_{horizon}", ascending=False).reset_index(drop=True)


d = filter_data(D)


# ── STAT CARDS ───────────────────────────────────────────────────────────────
def fmt(v: float) -> str:
    s = "+" if v >= 0 else ""
    if abs(v) >= 1000:
        return f"{s}{v/1000:.1f}K%"
    return f"{s}{v:.2f}%"


if len(d) == 0:
    best_v = worst_v = 0.0
    best_name = worst_name = "—"
    spread = 0.0
else:
    best_v = float(d.iloc[0][f"v_{horizon}"])
    worst_v = float(d.iloc[-1][f"v_{horizon}"])
    best_name = d.iloc[0]["n"]
    worst_name = d.iloc[-1]["n"]
    spread = abs(best_v - worst_v)

c1, c2, c3, c4 = st.columns(4)
cards = [
    (c1, "Total Assets", str(len(d)), ""),
    (c2, "Peak Performer", fmt(best_v) if len(d) else "—", "pos"),
    (c3, "Maximum Drain", fmt(worst_v) if len(d) else "—", "neg"),
    (c4, "Variance Spread", f"{spread:.0f} pts" if len(d) else "—", "warn"),
]
for col, label, value, cls in cards:
    with col:
        st.markdown(
            f'<div class="es-stat"><span class="es-stat-label">{label}</span>'
            f'<span class="es-stat-value {cls}">{value}</span></div>',
            unsafe_allow_html=True,
        )

st.markdown("")  # spacer


# ── CHART ────────────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="es-chart-hdr">
  <div class="es-chart-title">Cumulative Expected Return (%) — {HZ_LBL[horizon]}</div>
  <div class="es-chart-meta">LIVE CALCULATION • V19.0</div>
</div>
""", unsafe_allow_html=True)

if len(d) == 0:
    st.info("Select at least one category to render the spectrum.")
else:
    vals = d[f"v_{horizon}"].tolist()
    colors = ["rgba(34, 197, 94, 0.75)" if v >= 0 else "rgba(239, 68, 68, 0.75)" for v in vals]

    # Rich hover: category, horizon return, contextual
    customdata = []
    for _, row in d.iterrows():
        hz_lines = "<br>".join(
            f"&nbsp;&nbsp;<b>{HZ_LBL[h]}:</b> {fmt(row[f'v_{h}'])}" for h in HZ
        )
        extra = ""
        if show_risk:
            ar = int(row["ar"])
            extra += f"<br><b>Addiction Risk:</b> <span style='color:{AR_CLR[ar]}'>{AR_LBL[ar]}</span>"
        if show_dca:
            dca = DCA_AMT[horizon]
            projected = dca * (1 + row[f"v_{horizon}"] / 100)
            extra += f"<br><b>DCA Contribution:</b> ${dca:,} → ${projected:,.0f}"
        if show_ruin and row["m"] == "g":
            extra += "<br><b>Ruin Probability:</b> <span style='color:#ef4444'>Elevated</span>"
        customdata.append([
            row["n"], row["cat"], CC[row["cat"]], row["type"],
            row["vol"], row["wp"], row["sk"], hz_lines, extra,
        ])

    hover = (
        "<b style='font-size:14px'>%{customdata[0]}</b><br>"
        "<span style='color:%{customdata[2]}'>●</span> %{customdata[1]} • %{customdata[3]}"
        "<br><br><b>PERFORMANCE HORIZONS</b><br>%{customdata[7]}"
        "<br><br><b>CONTEXT</b><br>"
        "&nbsp;&nbsp;<b>Volatility:</b> %{customdata[4]}<br>"
        "&nbsp;&nbsp;<b>Win Prob:</b> %{customdata[5]}<br>"
        "&nbsp;&nbsp;<b>Skill Factor:</b> %{customdata[6]}"
        "%{customdata[8]}"
        "<extra></extra>"
    )

    fig = go.Figure(go.Bar(
        x=d["n"].tolist(),
        y=vals,
        marker=dict(color=colors, line=dict(color="rgba(255,255,255,0.1)", width=1)),
        customdata=customdata,
        hovertemplate=hover,
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="#0a0a0a",
        margin=dict(l=50, r=20, t=20, b=20),
        height=560,
        xaxis=dict(showticklabels=False, showgrid=False, zeroline=False),
        yaxis=dict(
            gridcolor="rgba(255,255,255,0.05)",
            zerolinecolor="rgba(251, 191, 36, 0.4)",
            tickfont=dict(family="Geist Mono, monospace", size=10, color="#71717a"),
            ticksuffix="%",
        ),
        showlegend=False,
        bargap=0.15,
        hoverlabel=dict(
            bgcolor="rgba(10,10,10,0.96)",
            bordercolor="rgba(255,255,255,0.12)",
            font=dict(family="Inter, sans-serif", size=12, color="#e4e4e7"),
            align="left",
        ),
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})


# ── FOOTER ───────────────────────────────────────────────────────────────────
st.markdown("""
<div class="es-footer">
  <div>V19 — THE EDGE SPECTRUM • MARCH 2026</div>
  <div style="opacity:0.6">GAMBLING: LINEAR DECAY • INVESTING: COMPOUND APPRECIATION</div>
</div>
""", unsafe_allow_html=True)
