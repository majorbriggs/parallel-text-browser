const langs = ['de', 'pl', 'fr'];
const contents = {};
let currentActiveId = null;
const searchInput = document.getElementById('search-input');
const toggles = document.querySelectorAll('.view-toggles input');

// PDF.js variables
let pdfDoc = null;
let currentPdfPage = 1;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

// Initialize PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize the app
async function init() {
    // Load text contents
    for (const lang of langs) {
        try {
            const response = await fetch(`${lang}.md`);
            const text = await response.text();
            contents[lang] = text;
            renderColumn(lang, text);
        } catch (error) {
            console.error(`Error loading ${lang}.md:`, error);
            document.getElementById(`content-${lang}`).innerHTML = `<p style="color:red">Error loading file.</p>`;
        }
    }

    // Load PDF
    try {
        pdfDoc = await pdfjsLib.getDocument('kuhnapfel.pdf').promise;
        renderPDFPage(1); // Default to start of text
    } catch (error) {
        console.error('Error loading PDF:', error);
    }

    setupEventListeners();
    updateLayout();
}

async function renderPDFPage(num) {
    if (!pdfDoc) return;
    if (num < 1 || num > pdfDoc.numPages) return;

    currentPdfPage = num;

    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    } catch (error) {
        console.error('Error rendering PDF page:', error);
    }
}

function renderColumn(lang, markdown, searchTerm = '') {
    const container = document.getElementById(`content-${lang}`);

    const lines = markdown.split('\n');
    let html = '';
    let currentPage = '1';

    lines.forEach(line => {
        if (line.trim() === '') return;

        const pageMatch = line.match(/## \[(?:Page|Strona|Seite)\s+(\d+)\]/i);
        if (pageMatch) {
            currentPage = pageMatch[1];
            html += marked.parse(line);
            return;
        }

        const markerMatch = line.match(/^\s*\[(\d+)\]\s*(.*)/);

        if (markerMatch) {
            const id = markerMatch[1];
            let text = markerMatch[2];

            if (searchTerm) {
                const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                text = text.replace(regex, '<span class="search-match">$1</span>');
            }

            const renderedText = marked.parseInline(text);
            html += `<p data-para-id="${id}" data-page="${currentPage}" class="para ${id === currentActiveId ? 'active' : ''}">${renderedText}</p>`;
        } else if (line.startsWith('#')) {
            html += marked.parse(line);
        }
    });

    container.innerHTML = html;
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        const para = e.target.closest('.para');
        if (!para) return;

        const id = para.getAttribute('data-para-id');
        const page = para.getAttribute('data-page');
        currentActiveId = id;
        syncParagraphs(id, page);
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        langs.forEach(lang => {
            renderColumn(lang, contents[lang], term);
        });
    });

    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                toggles.forEach(t => {
                    if (t !== toggle) t.checked = false;
                });
                if (!toggle.checked) toggle.checked = true;
            }

            updateLayout();
            if (currentActiveId) {
                const activePara = document.querySelector(`.para[data-para-id="${currentActiveId}"]`);
                const page = activePara ? activePara.getAttribute('data-page') : '1';
                syncParagraphs(currentActiveId, page);
            }
        });
    });

    window.addEventListener('resize', updateLayout);
}

function updateLayout() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        const anyChecked = Array.from(toggles).some(t => t.checked);
        if (!anyChecked) toggles[0].checked = true;
    }

    toggles.forEach(t => {
        const lang = t.getAttribute('data-lang');
        const col = document.getElementById(`col-${lang}`);
        if (!col) return;

        if (isMobile) {
            col.classList.remove('hidden');
            if (t.checked) {
                col.classList.remove('mobile-hidden');
            } else {
                col.classList.add('mobile-hidden');
            }
        } else {
            col.classList.remove('mobile-hidden');
            if (t.checked) {
                col.classList.remove('hidden');
            } else {
                col.classList.add('hidden');
            }
        }
    });
}

function syncParagraphs(id, page) {
    document.querySelectorAll('.para').forEach(p => p.classList.remove('active'));

    const matching = document.querySelectorAll(`.para[data-para-id="${id}"]`);

    matching.forEach(p => {
        p.classList.add('active');
        const col = p.closest('.column');
        if (col && !col.classList.contains('hidden') && !col.classList.contains('mobile-hidden')) {
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Sync PDF via PDF.js
    if (page && pdfDoc) {
        const pdfPage = parseInt(page);
        renderPDFPage(pdfPage);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

init();
