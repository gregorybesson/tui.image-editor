import { getHelpMenuBarPosition } from '@/util';

export default ({ locale, biImage, loadButtonStyle, downloadButtonStyle, menuBarPosition }) => `
    <ul class="tui-image-editor-help-menu ${getHelpMenuBarPosition(menuBarPosition)}"></ul>
    <div class="tui-image-editor-controls">
        <!--div class="tui-image-editor-controls-logo">
            <img src="${biImage}" />
        </div-->
        <ul class="tui-image-editor-menu" style="text-align: left"></ul>

        <div class="tui-image-editor-controls-buttons">
            <button class="tui-image-editor-jira-btn" style="${loadButtonStyle}">
                ${locale.localize('Jira')}
            </button>
            <button class="tui-image-editor-clipboard-btn" style="${downloadButtonStyle}">
                ${locale.localize('Copy to clipboard')}
            </button>
            <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                ${locale.localize('Download')}
            </button>
        </div>
    </div>
`;
