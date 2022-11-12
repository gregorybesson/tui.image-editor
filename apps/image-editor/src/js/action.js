import extend from 'tui-code-snippet/object/extend';
import Imagetracer from '@/helper/imagetracer';
import { isSupportFileApi, base64ToBlob, toInteger, isEmptyCropzone, includes } from '@/util';
import { eventNames, historyNames, drawingModes, drawingMenuNames, zoomModes } from '@/consts';

export default {
  /**
   * Get ui actions
   * @returns {Object} actions for ui
   * @private
   */
  getActions() {
    return {
      main: this._mainAction(),
      shape: this._shapeAction(),
      crop: this._cropAction(),
      resize: this._resizeAction(),
      flip: this._flipAction(),
      rotate: this._rotateAction(),
      text: this._textAction(),
      mask: this._maskAction(),
      draw: this._drawAction(),
      icon: this._iconAction(),
      filter: this._filterAction(),
      history: this._historyAction(),
    };
  },

  /**
   * Main Action
   * @returns {Object} actions for ui main
   * @private
   */
  _mainAction() {
    const exitCropOnAction = () => {
      if (this.ui.submenu === 'crop') {
        this.stopDrawingMode();
        this.ui.changeMenu('crop');
      }
    };
    const setAngleRangeBarOnAction = (angle) => {
      if (this.ui.submenu === 'rotate') {
        this.ui.rotate.setRangeBarAngle('setAngle', angle);
      }
    };
    const setFilterStateRangeBarOnAction = (filterOptions) => {
      if (this.ui.submenu === 'filter') {
        this.ui.filter.setFilterState(filterOptions);
      }
    };
    const onEndUndoRedo = (result) => {
      setAngleRangeBarOnAction(result);
      setFilterStateRangeBarOnAction(result);

      return result;
    };
    const toggleZoomMode = () => {
      const zoomMode = this._graphics.getZoomMode();

      this.stopDrawingMode();
      if (zoomMode !== zoomModes.ZOOM) {
        this.startDrawingMode(drawingModes.ZOOM);
        this._graphics.startZoomInMode();
      } else {
        this._graphics.endZoomInMode();
      }
    };
    const toggleHandMode = () => {
      const zoomMode = this._graphics.getZoomMode();

      this.stopDrawingMode();
      if (zoomMode !== zoomModes.HAND) {
        this.startDrawingMode(drawingModes.ZOOM);
        this._graphics.startHandMode();
      } else {
        this._graphics.endHandMode();
      }
    };
    const initFilterState = () => {
      if (this.ui.filter) {
        this.ui.filter.initFilterCheckBoxState();
      }
    };

    return extend(
      {
        initLoadImage: (imagePath, imageName) =>
          this.loadImageFromURL(imagePath, imageName).then((sizeValue) => {
            exitCropOnAction();
            this.ui.initializeImgUrl = imagePath;
            this.ui.resizeEditor({ imageSize: sizeValue });
            this.clearUndoStack();
            this._invoker.fire(eventNames.EXECUTE_COMMAND, historyNames.LOAD_IMAGE);
          }),
        undo: () => {
          if (!this.isEmptyUndoStack()) {
            exitCropOnAction();
            this.deactivateAll();
            this.undo().then(onEndUndoRedo);
          }
        },
        redo: () => {
          if (!this.isEmptyRedoStack()) {
            exitCropOnAction();
            this.deactivateAll();
            this.redo().then(onEndUndoRedo);
          }
        },
        reset: () => {
          exitCropOnAction();
          this.loadImageFromURL(this.ui.initializeImgUrl, 'resetImage').then((sizeValue) => {
            exitCropOnAction();
            initFilterState();
            this.ui.resizeEditor({ imageSize: sizeValue });
            this.clearUndoStack();
            this._initHistory();
          });
        },
        delete: () => {
          this.ui.changeHelpButtonEnabled('delete', false);
          exitCropOnAction();
          this.removeActiveObject();
          this.activeObjectId = null;
        },
        deleteAll: () => {
          exitCropOnAction();
          this.clearObjects();
          this.ui.changeHelpButtonEnabled('delete', false);
          this.ui.changeHelpButtonEnabled('deleteAll', false);
        },
        load: (file) => {
          if (!isSupportFileApi()) {
            alert('This browser does not support file-api');
          }

          this.ui.initializeImgUrl = URL.createObjectURL(file);
          this.loadImageFromFile(file)
            .then((sizeValue) => {
              exitCropOnAction();
              initFilterState();
              this.clearUndoStack();
              this.ui.activeMenuEvent();
              this.ui.resizeEditor({ imageSize: sizeValue });
              this._clearHistory();
              this._invoker.fire(eventNames.EXECUTE_COMMAND, historyNames.LOAD_IMAGE);
            })
            ['catch']((message) => Promise.reject(message));
        },
        jira: async () => {
          const jiraDiv = document.querySelector('.tui-image-editor-jira');
          const isOpen = jiraDiv.classList.contains('show');
          if (isOpen) {
            jiraDiv.classList.remove('show');
          } else {
            jiraDiv.classList.add('show');
            const { chrome } = window;
            const items = await chrome.storage.sync.get({
              jiraServer: '',
              jiraLogin: '',
              jiraPassword: '',
              jiraProjects: [],
            });
            const websiteUrl = document.getElementById('jira-page-url').value;
            const arr = websiteUrl.split('/');
            const websiteHost = `${arr[0]}//${arr[2]}`;
            let selectedProject = items.jiraProjects.find((p) => p.url === websiteHost);
            if (selectedProject) {
              selectedProject = selectedProject.key;
            }
            const user = btoa(`${items.jiraLogin}:${items.jiraPassword}`);
            const url = `https://gorira.omnishop.app/projects?host=${items.jiraServer}`;
            const response = await fetch(url, {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                Authorization: user,
              },
            });
            const projects = await response.json();
            const jiraSelect = document.getElementById('jiraProjects');
            jiraSelect.innerHTML = '';
            let option = document.createElement('option');
            option.value = '';
            option.text = 'Select a project';
            document.getElementById('jiraProjects').appendChild(option);
            projects.forEach((project) => {
              option = document.createElement('option');
              option.value = project.key;
              option.text = project.name;
              if (selectedProject && project.key.toLowerCase() === selectedProject.toLowerCase()) {
                option.selected = true;
              }
              document.getElementById('jiraProjects').appendChild(option);
            });

            const createJira = async (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              e.stopPropagation();
              const imageData = this.toDataURL();
              const formData = new FormData(document.getElementById('formJira'));
              const formValues = Object.fromEntries(formData.entries());
              formValues.type = 'png';
              formValues.data = imageData;

              if (formValues['keep-project']) {
                const project = {
                  key: formValues.key,
                  url: websiteHost,
                };
                items.jiraProjects = items.jiraProjects.map((p) => {
                  if (p.url === websiteHost) {
                    p.key = formValues.key;
                  }

                  return p;
                });
                if (
                  !items.jiraProjects.find((p) => p.key === project.key && p.url === project.url)
                ) {
                  items.jiraProjects.push(project);
                }
                chrome.storage.sync.set({ jiraProjects: items.jiraProjects });
              }

              const res = await fetch(
                `https://gorira.omnishop.app/issue?host=${items.jiraServer}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: user,
                  },
                  body: JSON.stringify(formValues),
                }
              );
              const json = await res.json();
              if (json.key) {
                const jiraIssue = document.getElementById('jira-issue');
                const jiraId = document.getElementById('jira-issue-id');
                jiraIssue.style.display = 'block';
                jiraId.innerHTML = json.key;
                jiraId.href = `${items.jiraServer}/browse/${json.key}`;
              }
              console.log('json', json);
            };

            // DOESN'T WORK: document.getElementById('formJira').removeEventListener('submit', createJira);
            document.getElementById('formJira').addEventListener('submit', createJira, true);
          }
        },
        download: () => {
          const dataURL = this.toDataURL();
          let imageName = this.getImageName();
          let blob, type;

          if (isSupportFileApi() && window.saveAs) {
            blob = base64ToBlob(dataURL);
            type = blob.type.split('/')[1];
            if (imageName.split('.').pop() !== type) {
              imageName += `.${type}`;
            }
            saveAs(blob, imageName); // eslint-disable-line
          } else {
            const link = document.createElement('a');
            link.download = 'screenshot.png';
            link.href = dataURL;
            link.click();
          }
        },
        clipboard: async () => {
          const dataURL = this.toDataURL();
          const blob = base64ToBlob(dataURL);
          const { ClipboardItem } = window;
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          console.log('Image copied.');
        },
        history: (event) => {
          this.ui.toggleHistoryMenu(event);
        },
        zoomIn: () => {
          this.ui.toggleZoomButtonStatus('zoomIn');
          this.deactivateAll();
          toggleZoomMode();
        },
        zoomOut: () => {
          this._graphics.zoomOut();
        },
        hand: () => {
          this.ui.offZoomInButtonStatus();
          this.ui.toggleZoomButtonStatus('hand');
          this.deactivateAll();
          toggleHandMode();
        },
      },
      this._commonAction()
    );
  },

  /**
   * Icon Action
   * @returns {Object} actions for ui icon
   * @private
   */
  _iconAction() {
    return extend(
      {
        changeColor: (color) => {
          if (this.activeObjectId) {
            this.changeIconColor(this.activeObjectId, color);
          }
        },
        addIcon: (iconType, iconColor) => {
          this.startDrawingMode('ICON');
          this.setDrawingIcon(iconType, iconColor);
        },
        cancelAddIcon: () => {
          this.ui.icon.clearIconType();
          this.changeSelectableAll(true);
          this.changeCursor('default');
          this.stopDrawingMode();
        },
        registerDefaultIcons: (type, path) => {
          const iconObj = {};
          iconObj[type] = path;
          this.registerIcons(iconObj);
        },
        registerCustomIcon: (imgUrl, file) => {
          const imagetracer = new Imagetracer();
          imagetracer.imageToSVG(
            imgUrl,
            (svgstr) => {
              const [, svgPath] = svgstr.match(/path[^>]*d="([^"]*)"/);
              const iconObj = {};
              iconObj[file.name] = svgPath;
              this.registerIcons(iconObj);
              this.addIcon(file.name, {
                left: 100,
                top: 100,
              });
            },
            Imagetracer.tracerDefaultOption()
          );
        },
      },
      this._commonAction()
    );
  },

  /**
   * Draw Action
   * @returns {Object} actions for ui draw
   * @private
   */
  _drawAction() {
    return extend(
      {
        setDrawMode: (type, settings) => {
          this.stopDrawingMode();
          if (type === 'free') {
            this.startDrawingMode('FREE_DRAWING', settings);
          } else if (type === 'arrow') {
            this.startDrawingMode('LINE_DRAWING', settings);
          } else {
            this.startDrawingMode('LINE_DRAWING', settings);
          }
        },
        setColor: (color) => {
          this.setBrush({
            color,
          });
        },
      },
      this._commonAction()
    );
  },

  /**
   * Mask Action
   * @returns {Object} actions for ui mask
   * @private
   */
  _maskAction() {
    return extend(
      {
        loadImageFromURL: (imgUrl, file) => {
          return this.loadImageFromURL(this.toDataURL(), 'FilterImage').then(() => {
            this.addImageObject(imgUrl).then(() => {
              URL.revokeObjectURL(file);
            });
            this._invoker.fire(eventNames.EXECUTE_COMMAND, historyNames.LOAD_MASK_IMAGE);
          });
        },
        applyFilter: () => {
          this.applyFilter('mask', {
            maskObjId: this.activeObjectId,
          });
        },
      },
      this._commonAction()
    );
  },

  /**
   * Text Action
   * @returns {Object} actions for ui text
   * @private
   */
  _textAction() {
    return extend(
      {
        changeTextStyle: (styleObj, isSilent) => {
          if (this.activeObjectId) {
            this.changeTextStyle(this.activeObjectId, styleObj, isSilent);
          }
        },
      },
      this._commonAction()
    );
  },

  /**
   * Rotate Action
   * @returns {Object} actions for ui rotate
   * @private
   */
  _rotateAction() {
    return extend(
      {
        rotate: (angle, isSilent) => {
          this.rotate(angle, isSilent);
          this.ui.resizeEditor();
          this.ui.rotate.setRangeBarAngle('rotate', angle);
        },
        setAngle: (angle, isSilent) => {
          this.setAngle(angle, isSilent);
          this.ui.resizeEditor();
          this.ui.rotate.setRangeBarAngle('setAngle', angle);
        },
      },
      this._commonAction()
    );
  },

  /**
   * Shape Action
   * @returns {Object} actions for ui shape
   * @private
   */
  _shapeAction() {
    return extend(
      {
        changeShape: (changeShapeObject, isSilent) => {
          if (this.activeObjectId) {
            this.changeShape(this.activeObjectId, changeShapeObject, isSilent);
          }
        },
        setDrawingShape: (shapeType) => {
          this.setDrawingShape(shapeType);
        },
      },
      this._commonAction()
    );
  },

  /**
   * Crop Action
   * @returns {Object} actions for ui crop
   * @private
   */
  _cropAction() {
    return extend(
      {
        crop: () => {
          const cropRect = this.getCropzoneRect();
          if (cropRect && !isEmptyCropzone(cropRect)) {
            this.crop(cropRect)
              .then(() => {
                this.stopDrawingMode();
                this.ui.resizeEditor();
                this.ui.changeMenu('crop');
                this._invoker.fire(eventNames.EXECUTE_COMMAND, historyNames.CROP);
              })
              ['catch']((message) => Promise.reject(message));
          }
        },
        cancel: () => {
          this.stopDrawingMode();
          this.ui.changeMenu('crop');
        },
        /* eslint-disable */
        preset: (presetType) => {
          switch (presetType) {
            case 'preset-square':
              this.setCropzoneRect(1 / 1);
              break;
            case 'preset-3-2':
              this.setCropzoneRect(3 / 2);
              break;
            case 'preset-4-3':
              this.setCropzoneRect(4 / 3);
              break;
            case 'preset-5-4':
              this.setCropzoneRect(5 / 4);
              break;
            case 'preset-7-5':
              this.setCropzoneRect(7 / 5);
              break;
            case 'preset-16-9':
              this.setCropzoneRect(16 / 9);
              break;
            default:
              this.setCropzoneRect();
              this.ui.crop.changeApplyButtonStatus(false);
              break;
          }
        },
      },
      this._commonAction()
    );
  },

  /**
   * Resize Action
   * @returns {Object} actions for ui resize
   * @private
   */
  _resizeAction() {
    return extend(
      {
        getCurrentDimensions: () => this._graphics.getCurrentDimensions(),
        preview: (actor, value, lockState) => {
          const currentDimensions = this._graphics.getCurrentDimensions();
          const calcAspectRatio = () => currentDimensions.width / currentDimensions.height;

          let dimensions = {};
          switch (actor) {
            case 'width':
              dimensions.width = value;
              if (lockState) {
                dimensions.height = value / calcAspectRatio();
              } else {
                dimensions.height = currentDimensions.height;
              }
              break;
            case 'height':
              dimensions.height = value;
              if (lockState) {
                dimensions.width = value * calcAspectRatio();
              } else {
                dimensions.width = currentDimensions.width;
              }
              break;
            default:
              dimensions = currentDimensions;
          }

          this._graphics.resize(dimensions).then(() => {
            this.ui.resizeEditor();
          });

          if (lockState) {
            this.ui.resize.setWidthValue(dimensions.width);
            this.ui.resize.setHeightValue(dimensions.height);
          }
        },
        resize: (dimensions = null) => {
          if (!dimensions) {
            dimensions = this._graphics.getCurrentDimensions();
          }

          this.resize(dimensions)
            .then(() => {
              this._graphics.setOriginalDimensions(dimensions);
              this.stopDrawingMode();
              this.ui.resizeEditor();
              this.ui.changeMenu('resize');
            })
          ['catch']((message) => Promise.reject(message));
        },
        reset: (standByMode = false) => {
          const dimensions = this._graphics.getOriginalDimensions();

          this.ui.resize.setWidthValue(dimensions.width, true);
          this.ui.resize.setHeightValue(dimensions.height, true);

          this._graphics.resize(dimensions).then(() => {
            if (!standByMode) {
              this.stopDrawingMode();
              this.ui.resizeEditor();
              this.ui.changeMenu('resize');
            }
          });
        },
      },
      this._commonAction()
    );
  },

  /**
   * Flip Action
   * @returns {Object} actions for ui flip
   * @private
   */
  _flipAction() {
    return extend(
      {
        flip: (flipType) => this[flipType](),
      },
      this._commonAction()
    );
  },

  /**
   * Filter Action
   * @returns {Object} actions for ui filter
   * @private
   */
  _filterAction() {
    return extend(
      {
        applyFilter: (applying, type, options, isSilent) => {
          if (applying) {
            this.applyFilter(type, options, isSilent);
          } else if (this.hasFilter(type)) {
            this.removeFilter(type);
          }
        },
      },
      this._commonAction()
    );
  },

  /**
   * Image Editor Event Observer
   */
  setReAction() {
    this.on({
      undoStackChanged: (length) => {
        if (length) {
          this.ui.changeHelpButtonEnabled('undo', true);
          this.ui.changeHelpButtonEnabled('reset', true);
        } else {
          this.ui.changeHelpButtonEnabled('undo', false);
          this.ui.changeHelpButtonEnabled('reset', false);
        }
        this.ui.resizeEditor();
      },
      redoStackChanged: (length) => {
        if (length) {
          this.ui.changeHelpButtonEnabled('redo', true);
        } else {
          this.ui.changeHelpButtonEnabled('redo', false);
        }
        this.ui.resizeEditor();
      },
      /* eslint-disable complexity */
      objectActivated: (obj) => {
        this.activeObjectId = obj.id;

        this.ui.changeHelpButtonEnabled('delete', true);
        this.ui.changeHelpButtonEnabled('deleteAll', true);

        if (obj.type === 'cropzone') {
          this.ui.crop.changeApplyButtonStatus(true);
        } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
          this.stopDrawingMode();
          if (this.ui.submenu !== 'shape') {
            this.ui.changeMenu('shape', false, false);
          }
          this.ui.shape.setShapeStatus({
            strokeColor: obj.stroke,
            strokeWidth: obj.strokeWidth,
            fillColor: obj.fill,
          });

          this.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
        } else if (obj.type === 'path' || obj.type === 'line') {
          if (this.ui.submenu !== 'draw') {
            this.ui.changeMenu('draw', false, false);
            this.ui.draw.changeStandbyMode();
          }
        } else if (['i-text', 'text'].indexOf(obj.type) > -1) {
          if (this.ui.submenu !== 'text') {
            this.ui.changeMenu('text', false, false);
          }

          this.ui.text.setTextStyleStateOnAction(obj);
        } else if (obj.type === 'icon') {
          this.stopDrawingMode();
          if (this.ui.submenu !== 'icon') {
            this.ui.changeMenu('icon', false, false);
          }
          this.ui.icon.setIconPickerColor(obj.fill);
        }
      },
      /* eslint-enable complexity */
      addText: (pos) => {
        const { textColor: fill, fontSize, fontStyle, fontWeight, underline } = this.ui.text;
        const fontFamily = 'Noto Sans';

        this.addText('Double Click', {
          position: pos.originPosition,
          styles: { fill, fontSize, fontFamily, fontStyle, fontWeight, underline },
        }).then(() => {
          this.changeCursor('default');
        });
      },
      addObjectAfter: (obj) => {
        if (obj.type === 'icon') {
          this.ui.icon.changeStandbyMode();
        } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
          this.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
          this.ui.shape.changeStandbyMode();
        }
      },
      objectScaled: (obj) => {
        if (['i-text', 'text'].indexOf(obj.type) > -1) {
          this.ui.text.fontSize = toInteger(obj.fontSize);
        } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) >= 0) {
          const { width, height } = obj;
          const strokeValue = this.ui.shape.getStrokeValue();

          if (width < strokeValue) {
            this.ui.shape.setStrokeValue(width);
          }
          if (height < strokeValue) {
            this.ui.shape.setStrokeValue(height);
          }
        }
      },
      selectionCleared: () => {
        this.activeObjectId = null;
        if (this.ui.submenu === 'text') {
          this.changeCursor('text');
        } else if (!includes(['draw', 'crop', 'resize'], this.ui.submenu)) {
          this.stopDrawingMode();
        }
      },
    });
  },

  /**
   * History Action
   * @returns {Object} history actions for ui
   * @private
   */
  _historyAction() {
    return {
      undo: (count) => this.undo(count),
      redo: (count) => this.redo(count),
    };
  },

  /**
   * Common Action
   * @returns {Object} common actions for ui
   * @private
   */
  _commonAction() {
    const { TEXT, CROPPER, SHAPE, ZOOM, RESIZE } = drawingModes;

    return {
      modeChange: (menu) => {
        switch (menu) {
          case drawingMenuNames.TEXT:
            this._changeActivateMode(TEXT);
            break;
          case drawingMenuNames.CROP:
            this.startDrawingMode(CROPPER);
            break;
          case drawingMenuNames.SHAPE:
            this._changeActivateMode(SHAPE);
            this.setDrawingShape(this.ui.shape.type, this.ui.shape.options);
            break;
          case drawingMenuNames.ZOOM:
            this.startDrawingMode(ZOOM);
            break;
          case drawingMenuNames.RESIZE:
            this.startDrawingMode(RESIZE);
            break;
          default:
            break;
        }
      },
      deactivateAll: this.deactivateAll.bind(this),
      changeSelectableAll: this.changeSelectableAll.bind(this),
      discardSelection: this.discardSelection.bind(this),
      stopDrawingMode: this.stopDrawingMode.bind(this),
    };
  },

  /**
   * Mixin
   * @param {ImageEditor} ImageEditor instance
   */
  mixin(ImageEditor) {
    extend(ImageEditor.prototype, this);
  },
};
