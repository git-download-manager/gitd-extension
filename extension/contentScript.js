"use strict";

// declare debug mode var
let gitdDebugMode = false
let gitdProcessRunning = false

// templates
const gitdInitTemplateContainer = `<div id="gitd-container-template"><div class="gitd-shortcut-button">
                            <button id="gitdStartButton" @click="activateGitdInit" type="button" class="gitd-btn gitd-btn-sm gitd-btn-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-card-checklist" viewBox="0 0 16 16">
                                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                                    <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                <span x-text="gitdInitText">Gitd Start</span>
                            </button>
                        </div></div>`

// track body change (x-data)
// trackBodyAttributes("x-data")

// listen runtime message from bg
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        /*case "IM_CHANGED":
            // Dom Content Loading but not finish
            if (gitdDebugMode) console.log("content-script", "im changed")

            // start process
            // initGitdProcess("IM_CHANGED")

            break;*/
        /*case "IM_LOADING":
            // Dom Content Loading but not finish
            if (gitdDebugMode) console.log("content-script", "im loading")

            break;*/
        case "URL_CHANGED":
            // url changed
            if (gitdDebugMode) console.log("content-script", "url changed")

            // start process
            initGitdProcess("URL_CHANGED")

            break;
        case "IM_READY":
            // Everything Loading finished. Ready to use.
            if (gitdDebugMode) console.log("content-script", "im ready")

            // start process
            initGitdProcess("IM_READY")

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
// via: chrome dev tools: getEventListeners(window) -> return all events
// Request: gitdmanager (browser) -> contentScript -> background
// Response: background -> contentScript -> gitdmanager (browser)
window.addEventListener("submit-action", function(evt) {
    if (gitdDebugMode) console.log("content-script","submit-action", evt.detail)
    chrome.runtime.sendMessage(JSON.parse(evt.detail), function(response) {
        if (gitdDebugMode) console.log("bg-response", response);

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
// window.addEventListener("turbo:load", function(evt) {
//     if (gitdDebugMode) console.log("content-script", "turbo:load", evt)

//     // start process
//     initGitdProcess("turbo:load")

// }, false);

// debug mode listener
window.addEventListener("debug-mode-changed", function(evt) {
    if (gitdDebugMode) console.log("content-script", "debug-mode-changed", evt)

    gitdDebugMode = evt.detail

}, false);

// init gitd with process control
function initGitdProcess(where) {
    if (gitdProcessRunning) {
        if (gitdDebugMode) console.log("gitdProcessRunning is not finished yet", where);
        return
    }

    // process start
    gitdProcessRunning = true

    if (document.getElementById("gitdStartButton") === null) {
        /////////////////// inject templates
        // remove template
        if (document.getElementById("gitd-container-template")) {
            document.getElementById("gitd-container-template").remove()
        }

       // remove checkboxes if exists
       let gitdCheckboxes = document.querySelectorAll(".gitd-tree-checkbox-container")
       if (gitdCheckboxes.length > 0) {
         // remove checkbox
         gitdCheckboxes.forEach(e => e.remove())
       }

        // add x-data and template container
        document.body.setAttribute("x-data", "gitdManager")
        document.body.insertAdjacentHTML("beforeend", gitdInitTemplateContainer)
    }

    //////////////////// triggger button
    // if (where === "IM_CHANGED") {
    // hostname
    let hostname = window.location.hostname

    if (hostname === "github.com") {
        setTimeout(function() {
            if (gitdDebugMode) console.log("triggerGitdStart");

            let gitdStartButton = document.getElementById("gitdStartButton")
            if ( !!gitdStartButton && (gitdStartButton.getAttribute("data-trigger") === null || where === "URL_CHANGED") ) {
                if (gitdDebugMode) console.log("gitdStartButton", "trigger", "click", gitdStartButton)

                gitdStartButton.setAttribute("data-trigger", where)
                gitdStartButton.click()
            }

            // process finished
            gitdProcessRunning = false
        }, 1500)
    }
    // }

    // // process finished
    // gitdProcessRunning = false
}

// inject scripts
function injectGitdScripts(scrPath) {
    let s = document.createElement('script')
    s.src = chrome.runtime.getURL(scrPath);
    s.onload = function() {
        s.parentNode.removeChild(s);
    };
    (document.body || document.documentElement).appendChild(s)
    if (gitdDebugMode) console.log("injectGitdScripts", s);
}
