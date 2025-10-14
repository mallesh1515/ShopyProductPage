/* script.js - vanilla JS for product page interactions */

/* ---------- Utilities ---------- */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

/* ---------- Gallery ---------- */
const thumbnailRow = qs('#thumbnailRow');
const mainImage = qs('#mainImage');
qsa('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
        // swap main image
        const full = thumb.dataset.full || thumb.src;
        mainImage.src = full;
        // active thumb
        qsa('.thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    });
});

// zoom on click (bonus)
let isZoomed = false;
mainImage.addEventListener('click', () => {
    isZoomed = !isZoomed;
    mainImage.classList.toggle('zoomed', isZoomed);
});
mainImage.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        isZoomed = !isZoomed;
        mainImage.classList.toggle('zoomed', isZoomed);
    }
});

/* ---------- Variants ---------- */
const swatches = qsa('.swatch');
const sizeSelect = qs('#sizeSelect');
const selLabel = qs('#selVariant');
let selectedColor = null;
let selectedSize = sizeSelect.value;

// load from localStorage (bonus persist)
try {
    const savedColor = localStorage.getItem('selectedColor');
    const savedSize = localStorage.getItem('selectedSize');
    if (savedColor) selectedColor = savedColor;
    if (savedSize) { selectedSize = savedSize; sizeSelect.value = savedSize; }
} catch (e) { /* ignore */ }

function updateVariantLabel() {
    selLabel.textContent = `${selectedColor || '—'} - ${selectedSize || '—'}`;
}
updateVariantLabel();

// setup swatches
swatches.forEach(s => {
    const color = s.dataset.color;
    if (color === selectedColor) s.classList.add('selected');

    s.addEventListener('click', () => {
        // mark selected
        swatches.forEach(x => x.classList.remove('selected'));
        s.classList.add('selected');
        selectedColor = s.dataset.color;
        // if swatch provides an image, update main image
        if (s.dataset.image) {
            mainImage.src = s.dataset.image;
            // ensure no thumb remains active
            qsa('.thumb').forEach(t => t.classList.remove('active'));
        }
        updateVariantLabel();
        try { localStorage.setItem('selectedColor', selectedColor); } catch (e) { }
    });
});

// size selection
sizeSelect.addEventListener('change', (e) => {
    selectedSize = e.target.value;
    updateVariantLabel();
    try { localStorage.setItem('selectedSize', selectedSize); } catch (e) { }
});

/* ---------- Size Chart Modal ---------- */
const sizeChartBtn = qs('#sizeChartBtn');
const sizeModal = qs('#sizeChartModal');
const compareModal = qs('#compareModal');

function openModal(modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
}
function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// size modal controls
sizeChartBtn.addEventListener('click', () => openModal(sizeModal));
qsa('#sizeChartModal .modal-close, #compareModal .modal-close').forEach(btn => {
    btn.addEventListener('click', (ev) => {
        const modal = ev.target.closest('.modal');
        closeModal(modal);
    });
});

// overlay click to close
qsa('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
});

// ESC to close
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') qsa('.modal[aria-hidden="false"]').forEach(m => closeModal(m));
});

/* ---------- Compare Colours Modal ---------- */
const compareBtn = qs('#compareColorsBtn');
const compareSwatchesContainer = qs('#compareSwatches');
const comparePreview = qs('#comparePreview');

compareBtn.addEventListener('click', () => {
    // populate the compare modal with clones of available swatches
    compareSwatchesContainer.innerHTML = '';
    comparePreview.innerHTML = '';
    swatches.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'swatch';
        btn.style.background = s.style.background;
        btn.dataset.color = s.dataset.color;
        btn.setAttribute('aria-label', 'Compare ' + s.dataset.color);
        compareSwatchesContainer.appendChild(btn);

        // selection handler
        btn.addEventListener('click', () => {
            // toggle selected class
            btn.classList.toggle('selected');
            refreshComparePreview();
        });
    });

    openModal(compareModal);
});

function refreshComparePreview() {
    comparePreview.innerHTML = '';
    const selected = qsa('#compareSwatches .swatch.selected');
    // limit to 4 to keep UI tidy
    const max = 4;
    selected.slice(0, max).forEach(s => {
        const block = document.createElement('div');
        block.style.width = '120px';
        block.style.height = '120px';
        block.style.borderRadius = '8px';
        block.style.display = 'flex';
        block.style.alignItems = 'center';
        block.style.justifyContent = 'center';
        block.style.flexDirection = 'column';
        block.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)';
        block.innerHTML = `<div style="width:60px;height:60px;border-radius:50%;background:${s.style.background}; margin-bottom:8px;"></div><div style="font-size:0.9rem;">${s.dataset.color}</div>`;
        comparePreview.appendChild(block);
    });
}

/* ---------- Tabs (pure JS) ---------- */
qsa('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        qsa('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        qsa('.tab-content').forEach(content => content.classList.add('hidden'));
        const el = qs('#' + tab);
        if (el) el.classList.remove('hidden');
        // small micro-animation: focus top of content
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});

/* ---------- Bundle total calculation ---------- */
const bundlePrices = [30.00, 25.00, 20.00]; // must align with visuals
const bundleTotalEl = qs('#bundleTotal');
function updateBundleTotal() {
    const sum = bundlePrices.reduce((a, b) => a + b, 0);
    bundleTotalEl.textContent = `$${sum.toFixed(2)}`;
}
updateBundleTotal();

/* Add to cart / bundle click handlers (demo only) */
qs('#addToCartBtn').addEventListener('click', () => {
    alert(`Added to cart: ${selectedColor || '—'} / ${selectedSize || '—'}`);
});
qs('#addBundleBtn').addEventListener('click', () => {
    alert(`Bundle added. Total ${bundleTotalEl.textContent}`);
});

/* ---------- Pair well: small interactions ---------- */
qsa('.card-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        const title = card.querySelector('h4').textContent;
        alert(`${title} added to cart`);
    });
});

/* ---------- Simple accessibility helpers ---------- */
// focus management for modals
qsa('.modal').forEach(modal => {
    modal.addEventListener('transitionend', () => {
        // no-op placeholder
    });
});
