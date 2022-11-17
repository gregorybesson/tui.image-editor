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
            <div class="tui-image-editor-share">
                <h2>Share</h2>
                <div> Congratulations! Your image is ready to share: Use the link below to share your screenshot<br/>
                    CAUTION: This link is public and anyone with the link can view your screenshot. <br/>
                </div>
                <div>
                    <a href="#" id="share-link" target="_blank"></a>
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
