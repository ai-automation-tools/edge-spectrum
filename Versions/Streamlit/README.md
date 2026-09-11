# Edge Spectrum — Streamlit

Native Streamlit port of the V19 Dark-Sidebar-Theme. Renders ~187 asset/game rows across 13 categories with horizon, layer, and insight controls.

## Run locally

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Deploy to Streamlit Community Cloud

1. Push this `Streamlit/` folder to a public GitHub repo (or a private one — Community Cloud supports both with GitHub auth).
2. Go to https://share.streamlit.io/ and click **New app**.
3. Fill in:
   - **Repository:** `<your-user>/<repo-name>`
   - **Branch:** `main`
   - **Main file path:** `Versions/Streamlit/streamlit_app.py` (or just `streamlit_app.py` if this folder is the repo root)
4. Click **Deploy**. First build takes ~2 min.

Community Cloud auto-detects `requirements.txt` and `.streamlit/config.toml`.

## Files

| File | Purpose |
|------|---------|
| `streamlit_app.py` | UI, filters, stat cards, Plotly bar chart, hover template |
| `data.py` | 187-row dataset + all constants (categories, colors, horizons, math scalars) |
| `requirements.txt` | streamlit, plotly, pandas |
| `.streamlit/config.toml` | dark theme palette matching the original |

## What's the same vs. V1.html

- All 13 categories and 187 rows preserved verbatim
- Linear gambling decay + compound investment formulas unchanged
- Sort-by-horizon, green/red bars, yellow zero-line
- Hover shows all 7 horizons, category, volatility/win-prob/skill
- Default selection excludes Casino Gambling + Poker (matches original "11 Selected")

## What's different

- Controls are native Streamlit widgets (multiselect, radio, checkbox) rather than custom dropdowns/pills — simpler, and they inherit the dark theme
- Rich Plotly hover replaces the 420px floating tooltip card
- No DCA/ruin-probability chart overlays yet (insights toggle extra fields into the hover panel only)
- Mobile layout relies on Streamlit's responsive grid instead of custom media queries

## Next steps (optional)

- Add DCA overlay as a second trace showing projected balance curve
- Add Monte Carlo ruin simulation for gambling rows
- Publish screenshots back to `Images/Screenshots/` per project convention
