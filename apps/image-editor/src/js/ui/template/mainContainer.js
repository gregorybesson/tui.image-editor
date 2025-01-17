export default ({
  locale,
  biImage,
  commonStyle,
  headerStyle,
  loadButtonStyle,
  downloadButtonStyle,
  submenuStyle,
}) => `
    <style>
      .tui-image-editor-jira, .tui-image-editor-share {
        transform: translateX(100%);
        -webkit-transform: translateX(100%);
        position: absolute;
        right: 10px;
        background-color: #fff;
        width: 500px;
        height: 100%;
        z-index: 2;
        border: 0;
        transition: transform .5s ease;
      }
      
      .tui-image-editor-jira.show, .tui-image-editor-share.show {
        transform: translateX(0);
        -webkit-transform: translateX(0);
        border-left: black 1px solid;
      }

      #share-copy.copied {
        fill: red;
      }
      
      .tui-image-editor-clipboard-btn.copied {
        background-color: red !important;
        border: 1px solid red !important;
      }
    </style>
    <div class="tui-image-editor-main-container" style="${commonStyle}">
        <div class="tui-image-editor-header" style="${headerStyle}">
            <div class="tui-image-editor-header-logo">
                <img src="${biImage}" />
            </div>
            <div class="tui-image-editor-header-buttons">
                <div style="${loadButtonStyle}">
                    ${locale.localize('Load')}
                    <input type="file" class="tui-image-editor-load-btn" />
                </div>
                <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                    ${locale.localize('Download')}
                </button>
            </div>
        </div>
        <div class="tui-image-editor-main">
            <div class="tui-image-editor-submenu" draggable="true" style="width: 250px;">
                <div class="tui-image-editor-submenu-style" style="${submenuStyle}"></div>
            </div>
            <div class="tui-image-editor-jira">
                <div id="jira-message" style="display: none;">

                    <h2>You need to configure your Jira connection. It's here:</h2>
                    <div><img src="https://gorira.omnishop.app/gorira/jira-settings.png" /></div>
                    <div style="margin-top: 2rem;">(And don't forget to create your Jira token following this link: <a href="https://id.atlassian.com/manage-profile/security/api-tokens">https://id.atlassian.com/manage-profile/security/api-tokens</a>)</div>
                </div>
                <form id="formJira" style="display: flex; flex-direction: column; padding: 2rem; justify-content: space-between; align-items: flex-start;">
                    <input type="hidden" name="page-title" id="jira-page-title"/>
                    <input type="hidden" name="page-url" id="jira-page-url"/>
                    <h2 id="jira-issue" style="display: none; background-color: yellowgreen; width: 100%; padding: 1rem;">
                        Issue created: <a id="jira-issue-id" href="#" target="_blank"></a>
                    </h2>
                    <div class="form-group" style="padding: 1rem 0 0; text-align: left;">
                        <label for="jiraProjects">Project <superscript>*</superscript></label><br/>
                        <select name="key" id="jiraProjects" style="user-select: auto;" required></select>
                    </div>
                    <div class="form-check"><br/>
                        <input type="checkbox" class="form-check-input" name="keep-project" id="keepProjectKey" checked="checked">
                        <label class="form-check-label" for="keepProjectKey">Keep this project for this website</label>
                    </div>
                    <div class="form-group" style="padding: 1rem 0 0; text-align: left;">
                        <label for="jira-summary">Summary <superscript>*</superscript></label><br/>
                        <input type="text" class="form-control" name="summary" id="jira-summary" placeholder="Short description" required><br/>
                        <small id="summaryHelp" class="form-text text-muted">Enter a short description of your ticket</small>
                    </div>
                    <div class="form-group" style="padding: 1rem 0; text-align: left;">
                        <label for="jira-description">Description <superscript>*</superscript></label><br/>
                        <textarea class="form-control" name="description" id="jira-description" rows="10" cols="45" style="user-select: auto;" required></textarea><br/>
                        <small id="descriptionHelp" class="form-text text-muted">try to be specific. Your description will be appended with your screenshot</small>
                    </div>
                    <button type="submit" title="Create a ticket" class="btn btn-primary share">Send to Jira</button>
                </form>
            </div>
            <div class="tui-image-editor-share" style="padding-top: 2rem;">
                <h2>Share</h2>
                <div> Congratulations! Your image is ready to share: Use the link below to share your screenshot<br/>
                    CAUTION: This link is public and anyone with the link can view your screenshot. <br/>
                </div>
                <div style="margin-top: 2rem;">
                    <img id="share-img" src="" style="width:100%;"/>
                </div>
                <div style="margin-top: 2rem;">
                    <a href="#" id="share-link" target="_blank"></a><a id="share-copy" href="#" style="vertical-align: middle; margin-left: 1rem;" title="copy the link"><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20" viewBox="0 0 330 330" xml:space="preserve">
                            <g>
                                <path d="M35,270h45v45c0,8.284,6.716,15,15,15h200c8.284,0,15-6.716,15-15V75c0-8.284-6.716-15-15-15h-45V15
                                    c0-8.284-6.716-15-15-15H35c-8.284,0-15,6.716-15,15v240C20,263.284,26.716,270,35,270z M280,300H110V90h170V300z M50,30h170v30H95
                                    c-8.284,0-15,6.716-15,15v165H50V30z"/>
                                <path d="M155,120c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15s-6.716-15-15-15H155z"/>
                                <path d="M235,180h-80c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15S243.284,180,235,180z"/>
                                <path d="M235,240h-80c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h80c8.284,0,15-6.716,15-15C250,246.716,243.284,240,235,240z
                                    "/>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                            <g>
                            </g>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="tui-image-editor-wrap">
                <div class="tui-image-editor-size-wrap">
                    <div class="tui-image-editor-align-wrap">
                        <div class="tui-image-editor"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
