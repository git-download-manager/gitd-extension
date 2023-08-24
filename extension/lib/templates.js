"use strict";

let gitdInitTemplate = `<div class="gitd-shortcut-button">
                            <button id="gitdStartButton" @click="activateGitdInit" type="button" class="gitd-btn gitd-btn-sm gitd-btn-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-card-checklist" viewBox="0 0 16 16">
                                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                                    <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                <span x-text="gitdInitText">Gitd Start</span>
                            </button>
                        </div>
                        <div id="gitd-init">
                            <template aria-label="alert-box" x-if="alertBox" x-transition>
                                <div x-bind:class="alertType" class="gitd-alert gitd-alert-dismissible">
                                    <button @click="removeAlertBox" type="button" class="gitd-btn close">
                                        <span>&times;</span>
                                    </button>
                                    <p x-html="alertMessage"></p>
                                </div>
                            </template>
                            <template aria-label="progress-bar" x-if="downloadProgress" x-transition>
                                <div class="gitd-alert gitd-alert-light">
                                    <div class="gitd-progress-info">
                                        <div class="gitd-progress-label">
                                            <span @zip-file-download.window="zipFileDownloadEvt" x-text="zipFileDownloadText"></span>
                                            <span @zip-file-prepare.window="zipFilePrepareEvt" x-text="zipFilePrepareText" style="float:right !important;"></span>
                                        </div>
                                        <div class="gitd-progress-percentage">
                                            <span @current-file-download.window="currentFileDownloadEvt" x-text="currentFileDownloadText" class="gitd-current-filename"></span>
                                            <span x-text="calculateProgressBarText"></span>
                                        </div>
                                    </div>
                                    <div class="gitd-progress">
                                        <div class="progress-bar gitd-bg-success" x-bind:style="calculateProgressBarStyle" style="width:0%;"></div>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <template aria-label="notifyBox" x-if="notifyBox">
                            <div x-transition style="position: fixed; top: 120px; right: 30px; z-index:9999;">
                                <div x-bind:class="notifyType" class="gitd-alert gitd-alert-dismissible">
                                    <button @click="removeNotifyBox" type="button" class="gitd-btn close">
                                        <span>&times;</span>
                                    </button>
                                    <span x-text="notifyMessage"></span>
                                </div>
                            </div>
                        </template>`