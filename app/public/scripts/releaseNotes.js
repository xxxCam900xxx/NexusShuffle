// Release Notes viewer - creates a modal and renders README.md as simple HTML
(function () {
    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function inlineFormat(text) {
        // code spans
        text = text.replace(/`([^`]+)`/g, (m, p1) => `<code>${escapeHtml(p1)}</code>`);
        // bold **text**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // italic *text*
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        // links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return text;
    }

    function markdownToHtml(md) {
        const lines = md.split(/\r?\n/);
        let out = '';
        let inCode = false;
        let inList = false;

        for (let rawLine of lines) {
            let line = rawLine;
            if (/^```/.test(line)) {
                if (!inCode) {
                    inCode = true;
                    out += '<pre><code>';
                } else {
                    inCode = false;
                    out += '</code></pre>';
                }
                continue;
            }
            if (inCode) {
                out += escapeHtml(line) + '\n';
                continue;
            }

            if (/^\s*$/.test(line)) {
                if (inList) { out += '</ul>'; inList = false; }
                out += '';
                continue;
            }

            const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (hMatch) {
                if (inList) { out += '</ul>'; inList = false; }
                const level = hMatch[1].length;
                out += `<h${level}>${inlineFormat(escapeHtml(hMatch[2]))}</h${level}>`;
                continue;
            }

            if (/^[-*+]\s+/.test(line)) {
                if (!inList) { out += '<ul>'; inList = true; }
                const item = line.replace(/^[-*+]\s+/, '');
                out += `<li>${inlineFormat(escapeHtml(item))}</li>`;
                continue;
            }

            // horizontal rule
            if (/^(\*{3,}|-{3,})\s*$/.test(line)) {
                if (inList) { out += '</ul>'; inList = false; }
                out += '<hr/>';
                continue;
            }

            // paragraph
            if (inList) { out += '</ul>'; inList = false; }
            out += `<p>${inlineFormat(escapeHtml(line))}</p>`;
        }

        if (inList) out += '</ul>';
        if (inCode) out += '</code></pre>';
        return out;
    }

    function createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'rn-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const modal = document.createElement('div');
        modal.className = 'rn-modal';

        const header = document.createElement('div');
        header.className = 'rn-header';
        const title = document.createElement('h2');
        title.textContent = 'Release Notes';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'rn-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
        header.appendChild(title);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'rn-content';
        content.innerHTML = '<p>Loading...</p>';

        modal.appendChild(header);
        modal.appendChild(content);
        overlay.appendChild(modal);

        // basic styles injected once
        if (!document.getElementById('rn-styles')) {
            const style = document.createElement('style');
            style.id = 'rn-styles';
            style.textContent = `
            .rn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;padding:40px;z-index:9999}
            .rn-modal{background:#fff;color:#000;max-width:900px;width:100%;max-height:80vh;overflow:auto;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
            .rn-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #eee}
            .rn-header h2{margin:0;font-size:16px}
            .rn-close{background:none;border:0;font-size:22px;cursor:pointer}
            .rn-content{padding:16px}
            .rn-content img{max-width:100%}
            .rn-content pre{background:#f6f8fa;padding:10px;border-radius:4px;overflow:auto}
            .rn-content code{background:#eee;padding:2px 4px;border-radius:3px}
            `;
            document.head.appendChild(style);
        }

        // close on ESC or overlay click
        overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
        document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { if (document.body.contains(overlay)) document.body.removeChild(overlay); document.removeEventListener('keydown', onKey); } });

        return { overlay, modal, content };
    }

    async function showReadme() {
        const { overlay, content } = createModal();
        document.body.appendChild(overlay);
        try {
            const res = await fetch('RELEASENOTES.md');
            if (!res.ok) throw new Error('Failed to fetch README');
            const md = await res.text();
            content.innerHTML = markdownToHtml(md);
        } catch (e) {
            content.innerHTML = `<p>Fehler beim Laden der Release Notes: ${escapeHtml(String(e))}</p>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const ver = document.querySelector('.version p');
        if (!ver) return;
        ver.style.cursor = 'pointer';
        ver.setAttribute('title', 'Release Notes anzeigen');
        ver.addEventListener('click', (e) => {
            e.preventDefault();
            showReadme();
        });
    });
})();
