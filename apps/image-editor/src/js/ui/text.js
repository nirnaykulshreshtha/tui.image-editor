import Range from '@/ui/tools/range';
import Colorpicker from '@/ui/tools/colorpicker';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/text';
import { assignmentForDestroy } from '@/util';
import { defaultTextRangeValues } from '@/consts';
import FontFamily from './tools/fontFamily';

/**
 * Crop ui class
 * @class
 * @ignore
 */
export default class Text extends Submenu {
  constructor(
    subMenuElement,
    { locale, makeSvgIcon, menuBarPosition, usageStatistics, fontFamily }
  ) {
    super(subMenuElement, {
      locale,
      name: 'text',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });
    this.effect = {
      bold: false,
      italic: false,
      underline: false,
    };
    this.align = 'left';
    this.fontFamily = fontFamily;
    this._els = {
      textEffectButton: this.selector('.tie-text-effect-button'),
      textAlignButton: this.selector('.tie-text-align-button'),
      textColorpicker: new Colorpicker(
        this.selector('.tie-text-color'),
        '#ffbb3b',
        this.toggleDirection,
        this.usageStatistics
      ),
      textRange: new Range(
        {
          slider: this.selector('.tie-text-range'),
          input: this.selector('.tie-text-range-value'),
        },
        defaultTextRangeValues
      ),
      fontFamily: new FontFamily(this.selector('.tie-font-family'), {
        defaultFont: fontFamily ? fontFamily.defaultFont : 'Arial',
        fontFamilies: fontFamily
          ? ['Courier New', 'Arial', 'Verdana', 'Helvetica', 'Tahoma', ...fontFamily.fontFamilies]
          : ['Courier New', 'Arial', 'Verdana', 'Helvetica', 'Tahoma'],
      }),
    };
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._els.textColorpicker.destroy();
    this._els.textRange.destroy();

    assignmentForDestroy(this);
  }

  /**
   * Add event for text
   * @param {Object} actions - actions for text
   *   @param {Function} actions.changeTextStyle - change text style
   */
  addEvent(actions) {
    const setTextEffect = this._setTextEffectHandler.bind(this);
    const setTextAlign = this._setTextAlignHandler.bind(this);

    this.eventHandler = {
      setTextEffect,
      setTextAlign,
    };

    this.actions = actions;
    this._els.textEffectButton.addEventListener('click', setTextEffect);
    this._els.textAlignButton.addEventListener('click', setTextAlign);
    this._els.textRange.on('change', this._changeTextRnageHandler.bind(this));
    this._els.textColorpicker.on('change', this._changeColorHandler.bind(this));
    this._els.fontFamily.on('change', this._changeFontFamilyHandler.bind(this));
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    const { setTextEffect, setTextAlign } = this.eventHandler;

    this._els.textEffectButton.removeEventListener('click', setTextEffect);
    this._els.textAlignButton.removeEventListener('click', setTextAlign);
    this._els.textRange.off();
    this._els.textColorpicker.off();
  }

  /**
   * Returns the menu to its default state.
   */
  changeStandbyMode() {
    this.actions.stopDrawingMode();
  }

  /**
   * Executed when the menu starts.
   */
  changeStartMode() {
    this.actions.modeChange('text');
  }

  set textColor(color) {
    this._els.textColorpicker.color = color;
  }

  /**
   * Get text color
   * @returns {string} - text color
   */
  get textColor() {
    return this._els.textColorpicker.color;
  }

  /**
   * Get text size
   * @returns {string} - text size
   */
  get fontSize() {
    return this._els.textRange.value;
  }

  /**
   * Set text size
   * @param {Number} value - text size
   */
  set fontSize(value) {
    this._els.textRange.value = value;
  }

  /**
   * get font style
   * @returns {string} - font style
   */
  get fontStyle() {
    return this.effect.italic ? 'italic' : 'normal';
  }

  /**
   * get font weight
   * @returns {string} - font weight
   */
  get fontWeight() {
    return this.effect.bold ? 'bold' : 'normal';
  }

  /**
   * get text underline text underline
   * @returns {boolean} - true or false
   */
  get underline() {
    return this.effect.underline;
  }

  setTextStyleStateOnAction(textStyle = {}) {
    const { fill, fontSize, fontStyle, fontWeight, textDecoration, textAlign } = textStyle;

    this.textColor = fill;
    this.fontSize = fontSize;
    this.setEffectState('italic', fontStyle);
    this.setEffectState('bold', fontWeight);
    this.setEffectState('underline', textDecoration);
    this.setAlignState(textAlign);
  }

  setEffectState(effectName, value) {
    const effectValue = value === 'italic' || value === 'bold' || value === 'underline';
    const button = this._els.textEffectButton.querySelector(
      `.tui-image-editor-button.${effectName}`
    );

    this.effect[effectName] = effectValue;

    button.classList[effectValue ? 'add' : 'remove']('active');
  }

  setAlignState(value) {
    const button = this._els.textAlignButton;
    button.classList.remove(this.align);
    button.classList.add(value);
    this.align = value;
  }

  /**
   * text effect set handler
   * @param {object} event - add button event object
   * @private
   */
  _setTextEffectHandler(event) {
    const button = event.target.closest('.tui-image-editor-button');
    if (button) {
      const [styleType] = button.className.match(/(bold|italic|underline)/);
      const styleObj = {
        bold: { fontWeight: 'bold' },
        italic: { fontStyle: 'italic' },
        underline: { textDecoration: 'underline' },
      }[styleType];

      this.effect[styleType] = !this.effect[styleType];
      button.classList.toggle('active');
      this.actions.changeTextStyle(styleObj);
    }
  }

  /**
   * text effect set handler
   * @param {object} event - add button event object
   * @private
   */
  _setTextAlignHandler(event) {
    const button = event.target.closest('.tui-image-editor-button');
    if (button) {
      const styleType = this.getButtonType(button, ['left', 'center', 'right']);

      event.currentTarget.classList.remove(this.align);
      if (this.align !== styleType) {
        event.currentTarget.classList.add(styleType);
      }
      this.actions.changeTextStyle({ textAlign: styleType });

      this.align = styleType;
    }
  }

  /**
   * text align set handler
   * @param {number} value - range value
   * @param {boolean} isLast - Is last change
   * @private
   */
  _changeTextRnageHandler(value, isLast) {
    this.actions.changeTextStyle(
      {
        fontSize: value,
      },
      !isLast
    );
  }

  /**
   * text align set handler
   * @param {string} fontFamily - font family name
   * @private
   */
  _changeFontFamilyHandler(fontFamily) {
    fontFamily = fontFamily || this.fontFamily.defaultFont;
    this.fontFamily.defaultFont = fontFamily;
    this.actions.changeTextStyle({
      fontFamily,
    });
  }

  /**
   * change color handler
   * @param {string} color - change color string
   * @private
   */
  _changeColorHandler(color) {
    color = color || 'transparent';
    this.actions.changeTextStyle({
      fill: color,
    });
  }
}
