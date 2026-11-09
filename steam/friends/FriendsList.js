// Text content
(function initNoctaliaReloader() {
    if (document.querySelector('script[src*="noctalia-reload.js"]')) return;
    const link = document.querySelector('link[rel="stylesheet"][href*="FriendsList.css"]');
    if (link && link.href) {
        const script = document.createElement('script');
        script.src = new URL('../../noctalia-reload.js', link.href).href;
        document.head.appendChild(script);
    }
})();

let searchText = "Search for a friend...";

//Create a mutation that edit the search bar
const obs = new MutationObserver((mutation) => {
    if(!document.querySelector(".tabSearchTransitionGroup").hasChildNodes()) {
        document.querySelector(".tabSearchTransitionGroup").innerHTML = `<div class='searchPlaceholder'>${searchText}</div>`;
    }
}).observe(document.body, { childList:true, subtree:true });