"use strict";

// Manifest json file to object data
let manifestData = chrome.runtime.getManifest()

// console.log("manifestData", manifestData);
// Fired when the extension is first installed, when the extension is updated to a new version, and when the browser is updated to a new version.
chrome.runtime.onInstalled.addListener(
    function() {
        console.info('%c' + manifestData.name + ' Extension: %cWelcome to my world!', 'color: orange;', 'color: default;')
    }
)

// Use APIs that support event filters to restrict listeners to the cases the extension cares about. 
// If an extension is listening for the tabs.onUpdated event, try using the webNavigation.onCompleted event with filters instead, as the tabs API does not support filters.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events/UrlFilter
let urlFilters = {
    url: [
        {
            hostEquals:'github.com',
            schemes:["https"]
        },
        {
            hostEquals:'gitlab.com',
            schemes:["https"]
        },
        {
            hostEquals:'bitbucket.org',
            schemes:["https"]
        }
    ]
}

/*chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
    // send message
    chrome.tabs.sendMessage(details.tabId, {
        action: 'IM_LOADING'
    })
}, urlFilters)*/

chrome.webNavigation.onCompleted.addListener(function (details) {
    chrome.tabs.sendMessage(details.tabId, {
        action: 'IM_READY'
    })
}, urlFilters)

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    chrome.tabs.sendMessage(details.tabId, {
        action: 'IM_CHANGED'
    })
}, urlFilters)

// gitdmanager api request listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // console.log("bg", request, sender, sendResponse)

    if (request.name === "gitd-api") {
        // console.log(_findUrlFromManifest(request.url))
        fetch(_findUrlFromManifest(request.url), {
            method: "POST",
            body: JSON.stringify(request.body),
            headers: {
              "content-type": "application/json",
            },
          })
          .then(resp => resp.json())
          .then(response => sendResponse(response))
          .catch(e => {
            //console.warn("fetch Error", e);
  
            sendResponse({status: false, message: "internal server error. something wrong!"})
        })
    }

    return true // last error fixed
})

function _findUrlFromManifest(request_url) {
    let version = manifestData.manifest_version

    let url = ""
    if (version === 2) {
        url = (manifestData.permissions[0]).replace("/*", request_url)
    } else if (version === 3) {
        url = (manifestData.host_permissions[0]).replace("/*", request_url)
    }

    return url
}
