// Live reloader for Noctalia v5 color palette changes
(function () {
    if (window.__noctaliaColorReloaderActive) return;
    window.__noctaliaColorReloaderActive = true;

    const STYLE_ID = "noctalia-live-colors";
    const POLL_INTERVAL_MS = 1000;
    let lastCssContent = "";
    let cachedColorsUrl = null;

    function resolveColorsUrl() {
        if (cachedColorsUrl) return cachedColorsUrl;

        const candidates = [];
        if (document.currentScript && document.currentScript.src) {
            candidates.push(document.currentScript.src);
        }
        document.querySelectorAll('link[rel="stylesheet"][href], script[src]').forEach((el) => {
            const url = el.href || el.src;
            if (url) candidates.push(url);
        });

        for (const rawUrl of candidates) {
            const cleanUrl = rawUrl.split("?")[0].split("#")[0];

            if (/\/(Steam\.css|colors\.css|noctalia-reload\.js|bigpicture\.custom\.css|TitleBar\.css)$/i.test(cleanUrl)) {
                cachedColorsUrl = new URL("colors.css", cleanUrl).href;
                return cachedColorsUrl;
            }
            if (/\/(headers|overlay|config|webkit|steam)\/[^/]+\.(css|js)$/i.test(cleanUrl)) {
                cachedColorsUrl = new URL("../colors.css", cleanUrl).href;
                return cachedColorsUrl;
            }
            if (/\/steam\/friends\/[^/]+\.(css|js)$/i.test(cleanUrl)) {
                cachedColorsUrl = new URL("../../colors.css", cleanUrl).href;
                return cachedColorsUrl;
            }
            const skinMatch = cleanUrl.match(/^(https?:\/\/[^/]+\/skins\/[^/]+\/)/i);
            if (skinMatch) {
                cachedColorsUrl = skinMatch[1] + "colors.css";
                return cachedColorsUrl;
            }
        }

        return null;
    }

    function applyColorsToDoc(doc, cssText) {
        if (!doc || !doc.head) return;

        // Remove stale Millennium cached RootColors style blocks if present
        doc.querySelectorAll('style#RootColors, style#MillenniumRootColors, link[href*="colors.css"]').forEach((el) => {
            if (el.tagName === "STYLE") {
                el.remove();
            }
        });

        let styleEl = doc.getElementById(STYLE_ID);
        if (!styleEl) {
            styleEl = doc.createElement("style");
            styleEl.id = STYLE_ID;
            doc.head.appendChild(styleEl);
        } else if (doc.head.lastElementChild !== styleEl) {
            doc.head.appendChild(styleEl);
        }

        if (styleEl.textContent !== cssText) {
            styleEl.textContent = cssText;
        }
    }

    async function checkAndReloadColors() {
        const colorsUrl = resolveColorsUrl();
        if (!colorsUrl) return;

        try {
            const response = await fetch(`${colorsUrl}?t=${Date.now()}`, {
                cache: "no-store",
            });
            if (!response.ok) return;

            const cssText = await response.text();
            if (!cssText || !cssText.includes(":root")) return;

            if (cssText !== lastCssContent) {
                lastCssContent = cssText;
                applyColorsToDoc(document, cssText);

                document.querySelectorAll("iframe").forEach((iframe) => {
                    try {
                        if (iframe.contentDocument) {
                            applyColorsToDoc(iframe.contentDocument, cssText);
                        }
                    } catch (_) {
                        // Ignore cross-origin iframes
                    }
                });
            }
        } catch (_) {
            // Ignore transient loopback errors
        }
    }

    checkAndReloadColors();
    setInterval(checkAndReloadColors, POLL_INTERVAL_MS);
})();

