"use strict";

// declare debug mode var
let gitdDebugMode = false

// listen runtime message from bg
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case "IM_CHANGED":
            // Dom Content Loading but not finish
            if (isDebugActive()) console.log("content-script", "im changed")

            // inject templates
            injectGitdTemplates()

            break;
        /*case "IM_LOADING":
            // Dom Content Loading but not finish
            if (isDebugActive()) console.log("content-script", "im loading")

            break;*/
        case "IM_READY":
            // Everything Loading finished. Ready to use.
            if (isDebugActive()) console.log("content-script", "im ready")

            // inject templates
            injectGitdTemplates()

            // inject gitdmanager
            injectGitdScripts("lib/gitdmanager.js")

            // inject alpine
            injectGitdScripts("lib/alpine-scp.min.js")

            // inject fflate
            injectGitdScripts("lib/fflate.min.js")

            break;
        default:
            break;
    }
});

// listen browser submit event
// Request: gitdmanager (browser) -> contentScript -> background
// Response: background -> contentScript -> gitdmanager (browser)
window.addEventListener("submit-action", function(evt) {
    if (isDebugActive()) console.log("content-script","submit-action", evt.detail)
    chrome.runtime.sendMessage(JSON.parse(evt.detail), function(response) {
        if (isDebugActive()) console.log("bg-response", response);

        window.dispatchEvent(new CustomEvent(
            'submit-action-response',
            { 
              bubbles: true, 
              detail: JSON.stringify(response)
            }
        ))
    });
}, false);

// via: chrome dev tools: getEventListeners(window) -> return all events
// only for github "turbo:load" event listen
window.addEventListener("turbo:load", function(evt) {
    if (isDebugActive()) console.log("content-script", "turbo:load", evt)

    setTimeout(function() {

        // checkbox add
        let navItem = document.querySelectorAll("div.js-navigation-item > div:first-child > svg")
        if (navItem.length > 0) {

            // inject checkbox
            for (const key in navItem) {
                if (Object.hasOwnProperty.call(navItem, key)) {
                    const element = navItem[key];

                    // type: none: 0 - file: 1 - folder: 2
                    let itemType = element.getAttribute("aria-label")
                    if (itemType === "Directory") {
                        itemType = 2
                    } else if (itemType === "File") {
                        itemType = 1
                    }

                    let pathElement = element.parentElement.nextElementSibling.querySelector("div > span > a")
                    if (!!pathElement) {
                        element.parentElement.insertAdjacentHTML("beforebegin", "<div role=\"gridcell\" class=\"mr-3 flex-shrink-0\"><input class=\"gitd-tree-checkbox\" type=\"checkbox\" data-name=\""+pathElement.innerText+"\" data-type=\""+itemType+"\" @click=\"toggleSelectList\"></div>")
                    }
                }
            }
        }

    }, 1500)

}, false);

// debug mode listener
window.addEventListener("debug-mode-changed", function(evt) {
    if (isDebugActive()) console.log("content-script", "debug-mode-changed", evt)

    gitdDebugMode = evt.detail

}, false);

// check debug mode
function isDebugActive() {
    return gitdDebugMode
}

// inject templates
function injectGitdTemplates() {
    if (!document.body.hasAttribute("x-data")) {
        document.body.setAttribute("x-data", "gitdManager")
        document.body.insertAdjacentHTML("beforeend", gitdInitTemplate)
    }
}

// inject scripts
function injectGitdScripts(scrPath) {
    let s = document.createElement('script')
    s.src = chrome.runtime.getURL(scrPath);
    s.onload = function() {
        s.parentNode.removeChild(s);
    };
    (document.body || document.documentElement).appendChild(s)
    if (isDebugActive()) console.log(s);
}