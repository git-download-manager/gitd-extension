"use strict";

// Alpine Init
document.addEventListener('alpine:init', () => {
  window.Alpine.data('gitdManager', () => ({
    // event listener
    zipFileDownloadEvt(evt) {
      if (this.isDebugActive()) console.log("zipFileDownload", evt, this.$el)

      this.isDownloaded = true
    },
    zipFileDownloadText(evt) {
      return this.isFinished ? 'All process completed.' : this.isDownloaded ? 'Download zip package: ' + this.currentFileZip : this.isZipped ? 'Prepare zip file: ' + this.currentFileZip : 'Files downloading...'
    },

    zipFilePrepareEvt(evt) {
      if (this.isDebugActive()) console.log("zipFilePrepare", evt, this.$el)

      this.isZipped = true
    },

    zipFilePrepareText(evt) {
      return this.fileCounter + ' / ' + this.totalFiles
    },

    currentFileDownloadEvt(evt) {
      if (this.isDebugActive()) console.log("currentFileDownload", evt)

      this.currentFileDownload = evt.detail
      this.updateFileCounter()
      this.calculateProgressBar()
    },

    currentFileDownloadText(evt) {
      return (this.isDownloaded || this.isZipped) ? this.currentFileZip : this.currentFileDownload
    },
    // event listener

    // init
    gitdInit: false,
    gitdInitText: "Gitd Start",

    activateGitdInit() {
      if (this.isDebugActive()) console.log("toggleGitdInit");
      
      // check gitd-init attribute
      if (document.querySelector(".gitd-tree-checkbox") === null) {
        this.gitdInit = true
        this.gitdInitText = "Gitd Ready"

        // hostname
        let hostname = window.location.hostname

        // inject checkbox for select download list
        let navItem = this._findNavItem(hostname)
        if (!!navItem && navItem.length > 0) {
          //console.log("navItem", navItem)
          // inject checkbox
          for (const key in navItem) {
            if (Object.hasOwnProperty.call(navItem, key)) {
                const element = navItem[key];

                // root row not allowed
                if (key === "0") {                  
                  // for bitbucket.org
                  if (element.parentElement.getAttribute("href") === "..") {
                    continue
                  }
                }

                let itemPathElement = this._findNavItemPath(hostname, element)
                if (!!itemPathElement) {
                  let itemType = this._findNavItemType(hostname, element)
                  element.parentElement.insertAdjacentHTML("beforebegin", this._findNavItemCheckbox(hostname, itemPathElement.innerText, itemType))
                }
            }
          }
        }
      }
      
    },

    _findNavItem(hostname) {
        switch (hostname) {
            case "github.com":
                return document.querySelectorAll("div.js-navigation-item > div:first-child > svg")
                break;
            case "gitlab.com":
                return document.querySelectorAll("table.tree-table > tbody > tr.tree-item > td.tree-item-file-name > a > span:first-child")
                break;
            case "bitbucket.org":
                return document.querySelectorAll("div.css-hix1c1 > table > tbody > tr > td > a > span:first-child")
                break;
        }
        
        return null
    },

    _findNavItemType(hostname, element) {
      // type: none: 0 - file: 1 - folder: 2
      let itemType = 1
      let itemTypeLabel = null
      let itemElement = null

      // find item type
      switch (hostname) {
          case "github.com":
              itemTypeLabel = element.getAttribute("aria-label")
              break;
          case "gitlab.com":
              itemElement = element.querySelector("svg")
              if (!!itemElement) {
                  itemTypeLabel = itemElement.getAttribute("aria-label")
              }
              break;
          case "bitbucket.org":
              itemElement = element.querySelector("span.css-x5ykhp > span.css-pxzk9z")
              if (!!itemElement) {
                  if (this._hasClass(itemElement, "folder-icon")) {
                    itemTypeLabel = "folder-icon"
                  } else if (this._hasClass(itemElement, "file-icon")) {
                    itemTypeLabel = "file-icon"
                  }
              }
              break;
      }

      // bitbucket.org item type labels => "Directory," "File," -> epic fail
      if (itemTypeLabel === "Directory" || itemTypeLabel === "Directory," || itemTypeLabel === "folder-icon") {
        itemType = 2
      } else if (itemTypeLabel === "File" || itemTypeLabel === "File," || itemTypeLabel === "file-icon") {
        itemType = 1
      }

      return itemType
    },

    _hasClass(element, className) {
      return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
    },

    _findNavItemPath(hostname, element) {
      // find item type
      switch (hostname) {
          case "github.com":
              return element.parentElement.nextElementSibling.querySelector("div > span > a")
              break;
          case "gitlab.com":
              return element.parentElement.querySelector("span:last-child")
              break;
          case "bitbucket.org":
              return element.querySelector("span.css-15qk21d")
              break;
      }
      
      return null
    },

    _findNavItemCheckbox(hostname, itemPath = "", itemType = 1) {
      // find item type
      switch (hostname) {
          case "github.com":
              return "<div role=\"gridcell\" class=\"mr-3 flex-shrink-0\"><input class=\"gitd-tree-checkbox\" type=\"checkbox\" data-name=\""+itemPath+"\" data-type=\""+itemType+"\" @click=\"toggleSelectList\"></div>"
              break;
          case "gitlab.com":
              return "<span role=\"gridcell\" style=\"padding:5px 15px;z-index:9999;position:relative;\"><input class=\"gitd-tree-checkbox\" style=\"position:absolute;left:10px;top:8px;\" type=\"checkbox\" data-name=\""+itemPath+"\" data-type=\""+itemType+"\" @click=\"toggleSelectList\"></span>"
              break;
          case "bitbucket.org":
              return "<span role=\"gridcell\" class=\"mr-3 flex-shrink-0\"><input class=\"gitd-tree-checkbox\" type=\"checkbox\" data-name=\""+itemPath+"\" data-type=\""+itemType+"\" @click=\"toggleSelectList\"></span>"
              break;
      }
      
      return null
    },

    // debug mode
    gitdDebugMode: false,

    isDebugActive() {
      //console.log("isDebugActive",window.gitdDebugMode, this.gitdDebugMode);
      if (window.gitdDebugMode != undefined && window.gitdDebugMode != this.gitdDebugMode) {
        // update debug mode last status
        this.gitdDebugMode = window.gitdDebugMode

        // psuh last status data to content script
        window.dispatchEvent(new CustomEvent(
          'debug-mode-changed',
          { 
            bubbles: true, 
            detail: window.gitdDebugMode
          }
        ))
      }

      return window.gitdDebugMode
    },

    // Enum: Error Messages
    ErrorDownloadRunning: "Please wait until the download is finished.",
    ErrorSelectLimitExceed: "Maximum selection limit exceeded",
    ErrorApiResponseWaiting: "Please wait until the process is finished.",
    ErrorDownloadFilesNotFound: "No download files found!!! Process canceled.",
    ErrorServer502: "Something wrong. Please try again after a while...",
    ErrorUnknownUrl: "Please write a valid repository url.",

    // Enum: Download Types
    DownloadNone: -1,
	  DownloadFullPackage: 1,
	  DownloadPartialPackage: 2,
	  DownloadSingleFile: 3,
	  DownloadCustomPackage: 4,

    // Search and Advanced Options
    loading: false,
    gitUrl: "",
    gitUrlValid: true,
    gitBranch: "",

    checkLoadingActive() {
      if (this.downloadProgress && !this.isFinished) {
        this.loading = true
      } else {
        this.loading = false
      }
    },

    validateGitUrl() {
      const regex = /https:\/\/(github\.com|bitbucket\.org|gitlab\.com)(\S+)(\/|\/([\w#!:.?+=&%@!\-\/]))?/sg;
      this.gitUrlValid = regex.test(this.gitUrl)
    },

    // user selection list
    selectList: {},

    // get all - text
    getAllSelectList() {
      return Object.keys(this.selectList).join(', ')
    },

    // type: none: 0 - file: 1 - folder: 2
    addSelectList(path, type) {
      this.selectList[path] = type
    },

    removeSelectList(path) {
      delete this.selectList[path]
    },

    resetSelectList() {
      this.selectList = {}

      // uncheck all checkboxes
      let checkboxes = document.querySelectorAll('input.gitd-tree-checkbox');
      if (checkboxes.length > 0) {
        [...checkboxes].map((el) => {
          el.checked = false;
        })
      }
    },

    toggleSelectList(evt, path, type) {
      path = this.$el.getAttribute("data-name")
      type = this.$el.getAttribute("data-type")
      type = parseInt(type, 10)
      
      if (this.isDebugActive()) console.log(evt, path, type, this.$el);

      if (this.loading) {
        this.showNotifyBox("gitd-alert-warning",  this.ErrorDownloadRunning, 3000)
        return false
      }

      if (this.selectList.hasOwnProperty(path)) {
        this.removeSelectList(path)
      } else {
        if (this.selectListLimit > Object.keys(this.selectList).length) {
          this.addSelectList(path, type)
        } else {
          this.$el.checked = false
          this.showNotifyBox("gitd-alert-warning", this.ErrorSelectLimitExceed, 3000)
          if (this.isDebugActive()) console.log("selectList", this.selectList, Object.keys(this.selectList).length, this.selectListLimit)

          return false
        }
      }

      if (Object.keys(this.selectList).length > 0) {
        this.showAlertBox("gitd-alert-secondary", '<button @click="submitAction" class="gitd-btn gitd-btn-sm gitd-btn-warning"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg><span class="nav-link-inner--text">Start Download</span></button> <span x-text="getAllSelectList" class="small"></span>')
      } else {
        this.removeAlertBox()
      }

      if (this.isDebugActive()) console.log("selectList", this.selectList, this.selectListLimit)
      return true
    },

    // limitations
    selectListLimit: 5, // select max file or folder in current tree list

    // Fetch Objects
    currentBranch: "",
    archiveUrl: "",
    fileUrlPattern: "",
    packageName: "",
    treeList: [],
    breadcrumbList: [],

    isTreePath(item) {
      return item.startsWith("tree:");
    },

    isFilePath(item) {
      return item.startsWith("blob:");
    },

    submitAction(evt, action = "download", sub = "", direction = 0, filename = "") {
      if (this.isDebugActive()) console.log("submitAction", action, sub, direction, filename);

      // check loading
      if (this.loading) {
        this.showNotifyBox("gitd-alert-warning", this.ErrorDownloadRunning, 3000)
        return
      }

      // activate loading
      this.loading = true

      // get current tab url
      this.gitUrl = window.location.href

      // get branch name
      //this.gitBranch = 

      // collect form values
      this.validateGitUrl()
      if (!this.gitUrlValid) {
        this.loading = false

        this.showNotifyBox("gitd-alert-warning", this.ErrorUnknownUrl, 3000)
        return
      }

      // Show loading message while request finished
      this.showNotifyBox("gitd-alert-info", this.ErrorApiResponseWaiting, -1)
      if (this.isDebugActive()) console.log("post-data", JSON.stringify({url: this.gitUrl, branch: this.gitBranch, action: action,sub: sub,direction: direction,filename: filename,select_list: this.selectList}))

      // download alert box remove
      this.removeAlertBox()

      // send message to background service
      let isSend = window.dispatchEvent(new CustomEvent(
        'submit-action',
        { 
          bubbles: true, 
          detail: JSON.stringify({
                    name: "gitd-api",
                    url: "/magic/browser",
                    body: {
                      url: this.gitUrl,
                      branch: this.gitBranch, // TODO: if branch is multiple name and slash inside, has to get the current branch name on document
                      action: action,
                      sub: sub,
                      direction: direction,
                      filename: filename,
                      select_list: this.selectList
                    }
          })
        }
      ))

      if (isSend) {
        //Listen for the event
        window.addEventListener("submit-action-response", (function(evt) {
          if (this.isDebugActive()) console.log("submit-action-response", evt)

          // result
          let result = JSON.parse(evt.detail)
          if (this.isDebugActive()) console.log("api-response", result)

          if (result === null || !result.status) {
            // loading process reset
            this.loading = false
            this.gitUrlValid = false

            // download process reset
            this._finishDownloadProcess()

            this.showNotifyBox("gitd-alert-warning", result.message, 5000)
          } else {
            this.gitUrl = result.result.query_url
            this.archiveUrl = result.result.archive_url
            this.fileUrlPattern = result.result.url_pattern
            this.currentBranch = this.gitBranch = result.result.branch
            //this.branchList = result.result.branch_list
            this.treeList = result.result.tree_list
            this.breadcrumbList = result.result.breadcrumb_list
            this.packageName = result.result.package_name

            // Download Process
            if (this.isDebugActive()) console.log("download_type", result.result.download_type)

            switch(result.result.download_type) {
              case this.DownloadNone:
                // action=view
                if (this.isDebugActive()) console.log("DownloadNone")
                break;
              case this.DownloadFullPackage:
                // direct download remote url
                if (this.isDebugActive()) console.log("DownloadFullPackage")
                
                // open new tab archive url for redirect/download file
                // when return redirect url from api server, close this line
                this.downloadFullPackage(this.archiveUrl, this.currentBranch + ".zip")
                break;
              case this.DownloadPartialPackage:
              case this.DownloadCustomPackage:
                if (this.isDebugActive()) console.log("DownloadPartialPackage", "or", "DownloadCustomPackage")
                let self = this

                if (result.result.download_tree_list.length > 0) {
                  // download progress start
                  this._startDownloadProcess(result.result.download_tree_list.length, this.packageName)

                  // New GitZip Package Creator
                  const gitdZip = new GitdZip()
                  gitdZip.treeListPrefix = this._generateSingleFilePath(this.breadcrumbList)
                  gitdZip.treeList = result.result.download_tree_list
                  gitdZip.zipFilename = this.packageName
                  gitdZip.fileUrlPattern = this.fileUrlPattern
                  gitdZip.save = this.downloadPartialPackage

                  gitdZip.init()
                  gitdZip.handleTreeListStream()
                  gitdZip.start().then(function() {
                    gitdZip.download()
                  }).then(function(){
                    gitdZip.end()

                    // download process reset
                    self._finishDownloadProcess()
                  })
                } else {
                  this.showNotifyBox("gitd-alert-warning", this.ErrorDownloadFilesNotFound, 5000)
                }
                break;
              case this.DownloadSingleFile:
                if (this.isDebugActive()) console.log("DownloadSingleFile")
                // stupid code lines :(
                let filename = this._findUrl2Filename(result.result.url)
                let path = this._generateSingleFilePath(this.breadcrumbList, filename)
                let url = this._generateSingleFileUrl(this.fileUrlPattern, path)
                
                fetch(url, {
                  method: "GET",
                  //mode: "no-cors", // Gitlab back to cloudflare and want to set mode and headers
                  //headers: {
                  //  "Access-Control-Allow-Origin": "*"
                  //}
                })
                  .then(resp => resp.blob())
                  .then((file) => {
                      this.downloadPartialPackage([file], this._findUrl2Filename(url))
                  })
                break;
            }

            // finished the loading
            this.checkLoadingActive()
            this.removeNotifyBox()
          }

        }).bind(this), {once: true})
      }
    },

    // single file download ///////
    // dirty method quicklyfind single filename.ext from url
    // via: https://stackoverflow.com/questions/511761/js-function-to-get-filename-from-url
    _findUrl2Filename(url) {
      //return url.split('/').pop()
      return new URL(url).pathname.split('/').pop();
    },

    _generateSingleFilePath(breadcrumd, filename) {
      let path = []
      if (breadcrumd.length > 0) {
        for (const index in breadcrumd) {
            if (index == 0) {
              continue
            }
            path.push(breadcrumd[index])            
        }
      }

      if (filename != "") {
        path.push(filename)
      }
      
      return path.join("/")
    },

    _generateSingleFileUrl(pattern, path) {
      return pattern.replace("[PATH]", path)
    },
    // single file download ///////

    treeSplit(item) {
      // tree:12123:util.js
      // type:size:path
      return item.split(":")
    },

    getTreeType(item) {
      return this.treeSplit(item)[0]
    },

    // remove this beacuse of objectsize runs too long
    getTreeSize(item) {
      return this.formatBytes(this.treeSplit(item)[1])
    },

    getTreePath(item) {
      return this.treeSplit(item)[2]
    },

    // via: https://stackoverflow.com/a/18650828
    formatBytes(bytes, decimals = 2) {
      if (bytes === "-") return '-';
      if (bytes === 0) return '0 Bytes';
  
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // Notification Box Show/Remove
    notifyBox: false,
    notifyType: "",
    notifyMessage: "",

    async showNotifyBox(type, message, ttl) {
      if (this.isDebugActive()) console.log("showNotifyBox", type, message)
      this.notifyBox = true
      this.notifyType = type
      this.notifyMessage = message

      // ttl = -1 => 
      if (ttl > 0) {
        setTimeout(() => {
          if (this.isDebugActive()) console.log("removeNotifyBox")
          this.removeNotifyBox()
        }, ttl)
      }
    },

    removeNotifyBox() {
      if (this.isDebugActive()) console.log("removeNotifyBox");
      this.notifyBox = false
      this.notifyType = ""
      this.notifyMessage = ""
    },

    // Alert Box Show/Remove
    alertBox: false,
    alertType: "",
    alertMessage: "",

    showAlertBox(type, message) {
      this.alertBox = true
      this.alertType = type
      this.alertMessage = message
    },

    removeAlertBox() {
      this.alertBox = false
      this.alertType = ""
      this.alertMessage = ""
    },

    removeSelectListBox() {
      this.removeAlertBox()
      this.resetSelectList()
    },

    // Progress Bar for Making Zip File
    downloadProgress: false,
    progressPercent: 0,
    totalFiles: 0,
    fileCounter: 0, // download files count for calculate progress bar
    currentFileDownload: "",
    currentFileZip: "",
    isDownloaded: false, // download the zip package
    isZipped: false, // zip process started
    isFinished: false, // all process finished: zip and download
    isStarted: false, // fetch process start

    updateFileCounter() {
      this.fileCounter += 1
    },

    calculateProgressBar() {
      this.progressPercent = Math.ceil(this.fileCounter / this.totalFiles * 100);
    },

    calculateProgressBarText() {
      return this.progressPercent + "%"
    },

    calculateProgressBarStyle() {
      return "width:" + this.progressPercent + "%;"
    },

    _startDownloadProcess(totalFiles, zipFilename) {
      // locked all button
      this.loading = true

      // download section
      this.downloadProgress = true
      this.isStarted = true
      this.isFinished = this.isDownloaded = this.isZipped = false
      this.totalFiles = totalFiles + 1 // +1 = zip package
      this.currentFileZip = zipFilename
      this.progressPercent = this.fileCounter = 0
    },
    _finishDownloadProcess(timeout = 2000) {
      this.isFinished = true
      this.loading = false

      // select list reset
      this.resetSelectList()

      let self = this
      setTimeout(function() {
        self.totalFiles = self.fileCounter = self.progressPercent = 0
        self.downloadProgress = self.isStarted = self.isDownloaded = self.isZipped = false
        self.currentFileZip = self.currentFileDownload = ""
      }, timeout)
    },

    // download button invisible click
    // via: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
    // via: https://itnext.io/how-to-download-files-with-javascript-d5a69b749896
    // files []Blog or []UInt8Array
    downloadPartialPackage(files, filename) {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(new Blob(files,{ type: 'application/octet-stream; charset=utf-8' }), filename);
      } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(new Blob(files,{ type: 'application/octet-stream; charset=utf-8' }));
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 10)
      }
    },

    downloadFullPackage(url, filename) {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.target = "_blank";
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 10)
    },
  }))
})

function GitdZip () {}

GitdZip.prototype.thanks = "https://github.com/101arrowz/fflate/wiki/Guide:-Modern-(Buildless)"
GitdZip.prototype.zip = null
GitdZip.prototype.zipFilename = null
GitdZip.prototype.zipReadableStream = null
GitdZip.prototype.treeList = null
GitdZip.prototype.treeListPrefix = null
GitdZip.prototype.save = null // save function initilize
GitdZip.prototype.fileUrlPattern = null // https://github.com/101arrowz/fflate/blob/master/[PATH]
GitdZip.prototype.largeFileSize = 500000
GitdZip.prototype.incompressibleTypes = new Set([
  'zip', 'gz', 'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx',
  'ppt', 'pptx', 'xls', 'xlsx', 'heic', 'heif', '7z', 'bz2',
  'rar', 'gif', 'webp', 'webm', 'mp4', 'mov', 'mp3', 'aifc'
])

// Download progress variable
GitdZip.prototype.startTime = 0
GitdZip.prototype.isStarted = false
GitdZip.prototype.isFinished = false
GitdZip.prototype.isAborted = false
GitdZip.prototype.fileCounter = 0
//GitdZip.prototype.workerChuckSize = 5 // browser paralel worker for per fileChuckSize
GitdZip.prototype.fileChuckSize = 50 // browser paralel request limit 50

GitdZip.prototype.init = function() {
  this.zip = new fflate.Zip()
}

GitdZip.prototype.isDebugActive = function() {
  return window.gitdDebugMode
}

GitdZip.prototype.startTimer = function() {
  this.startTime = new Date().getTime()
}

GitdZip.prototype.calculateTimer = function(start) {
  let ms = new Date().getTime() - start
  const days = Math.floor(ms / (24*60*60*1000));
  const daysms = ms % (24*60*60*1000);
  const hours = Math.floor(daysms / (60*60*1000));
  const hoursms = ms % (60*60*1000);
  const minutes = Math.floor(hoursms / (60*1000));
  const minutesms = ms % (60*1000);
  const sec = Math.floor(minutesms / 1000);
  return days + ":" + hours + ":" + minutes + ":" + sec;
}

GitdZip.prototype.setTreeList = function(tree) {
  this.treeList = tree
}

GitdZip.prototype.setFileUrlPattern = function(url) {
  this.fileUrlPattern = url
}

GitdZip.prototype._generateFileUrl = function(path) {
  if (this.treeListPrefix != "") {
    path = this.treeListPrefix + "" + path
  }
  return this.fileUrlPattern.replace("[PATH]", path)
}

GitdZip.prototype.handleTreeListStream = function() {
  let zip = this.zip
  this.zipReadableStream = new ReadableStream({
    start(controller) {
      zip.ondata = function (err, data, final) {
        //console.log("zipReadableStream", final)
        if (err) {
          controller.error(err)
        } else {
          controller.enqueue(data)
          if (final) {
            controller.close()
          }
        }
      }
    },
    cancel() {
      zip.terminate()
    }
  })
}

GitdZip.prototype.delay = function(timeout) {
  let self = this

  return new Promise(function(resolve) {
    setTimeout(function() {
      if (self.isDebugActive()) console.log("delay")
      resolve()
    }, timeout)
  })
}

// TODO: https://gist.github.com/alexpsi/43dd7fd4d6a263c7485326b843677740
// more more more quick download
GitdZip.prototype.start = async function() {
  let self = this
  if (self.isDebugActive()) console.log("treelist", self.treeList.length)

  // start timer
  this.startTimer()

  // process
  let n = self.fileChuckSize
  let xs = this.treeList
  const chunks = Array.from({length: Math.ceil(xs.length/n)||1}, (_,i)=>xs.slice(i*n, (i+1)*n))
  for (const chunk of chunks) {
    await Promise.all(chunk.map( async function(path) {
      return await self.add(path)
    }), self.delay(5))
  }
}

GitdZip.prototype.add = async function(filename) {
  let self = this
  // Download file
  return await fetch(this._generateFileUrl(filename), {
    method: "GET",
  }).then(function (response) {
    if (!response.body) {
      return response
    }

    // trigger custom event
    if (self.isDebugActive()) console.log("current-file-download", filename)
    document.dispatchEvent(new CustomEvent('current-file-download', { bubbles: true, detail: filename }))

    // process start file download
    let loaded = 0
    const contentLength = response.headers.get('content-length')
    const total = !contentLength ? -1 : parseInt(contentLength, 10)

    const ext = filename.slice(filename.lastIndexOf('.') + 1);
    const zippedFileStream = (self.incompressibleTypes.has(ext)) 
      ? new fflate.ZipPassThrough(filename)
      //: new fflate.ZipDeflate(filename, { level: 9 })
      : total > self.largeFileSize
        ? new fflate.AsyncZipDeflate(filename, { level: 9 })
        : new fflate.ZipDeflate(filename, { level: 9 })
    
    zippedFileStream.mtime = new Date()

    //console.log("zip", self.zip)
    self.zip.add(zippedFileStream)

    // Via: https://danlevy.net/you-may-not-need-axios/
    return new Response(
      new ReadableStream({
        start(controller) {
          const fileReader = response.body.getReader()
          return read()
  
          function read() {
            return fileReader.read()
              .then(({ done, value }) => {
                if (done) {
                  //console.log("zippedFileStream", zippedFileStream)
                  zippedFileStream.push(new Uint8Array(0), true)
                  return void controller.close()
                }
                loaded += value.byteLength
                //console.log("loaded", loaded)
                //console.log({ loaded, total })
                zippedFileStream.push(value)

                controller.enqueue(value)

                return read()
              })
              .catch(error => {
                if (self.isDebugActive()) console.error(error)
                controller.error(error)
              })
          }
        }
      })
    )
    
  }).then(function(res) {
    if (self.isDebugActive()) console.log("finish", filename)
  }).catch(function(e) {
    if (self.isDebugActive()) console.log(filename, e)
  })
}

GitdZip.prototype.end = function() {
  // trigger custom event
  document.dispatchEvent(new CustomEvent('zip-file-prepare', { bubbles: true, detail: this.zipFilename }))
  document.dispatchEvent(new CustomEvent('current-file-download', { bubbles: true, detail: this.zipFilename }))

  // prepare zip package
  this.zip.end()
}

GitdZip.prototype.download = function() {
  const chucks = []
  let sz = 0
  let self = this

  // TODO: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
  this.zipReadableStream.pipeTo(
    new WritableStream({
      write(dat) { 
        sz += dat.length; 
        chucks.push(dat)
        //console.log(sz, dat); 
      },
      close() {
        // trigger custom event
        document.dispatchEvent(new CustomEvent('zip-file-download', { bubbles: true, detail: self.zipFilename }))

        // package save
        self.save(chucks, self.zipFilename)
        if (self.isDebugActive()) console.log("zip-package-save", self.calculateTimer(self.startTime))
      }
    })
  )
}