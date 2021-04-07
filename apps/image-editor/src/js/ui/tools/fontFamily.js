import snippet from 'tui-code-snippet';

const PICKER_CONTROL_HEIGHT = '100%';
const DEFAULT_FONT_FAMILIES = [
  'Arial sans-serif',
  'Verdana sans-serif',
  'Helvetica sans-serif',
  'Tahoma sans-serif',
  'Trebuchet MS sans-serif',
  'Times New Roman serif',
  'Georgia serif',
  'Garamond serif',
  'Courier New monospace',
  'Brush Script MT cursive',
];

/**
 * Colorpicker control class
 * @class
 * @ignore
 */
class FontFamily {
  constructor(fontFamilyElement, { fontFamilies = [] }) {
    this.fontFamilyElement = fontFamilyElement;
    this.fontFamilies =
      fontFamilies && fontFamilies.length > 0 ? fontFamilies : DEFAULT_FONT_FAMILIES;

    this._fontFamilyElement = fontFamilyElement;
    this.selectBox = this._fontPickerWithSelectbox(this._fontFamilyElement);
    // this.selectBox.addEventListener('change', this._changeFontFamilyHandler.bind(this));
    this._addEvent();
  }

  _fontPickerWithSelectbox(pickerControl) {
    const selectlistWrap = document.createElement('div');
    const selectlist = document.createElement('select');
    const optionlist = document.createElement('ul');

    selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
    optionlist.className = 'tui-image-editor-selectlist';

    selectlistWrap.appendChild(selectlist);
    selectlistWrap.appendChild(optionlist);

    this._makeSelectOptionList(selectlist);

    pickerControl.appendChild(selectlistWrap);
    pickerControl.style.height = PICKER_CONTROL_HEIGHT;

    this._drawSelectOptionList(selectlist, optionlist);
    this._fontPickerWithSelectboxForAddEvent(selectlist, optionlist);

    return selectlist;
  }

  /**
   * Make option list for select control
   * @param {HTMLElement} selectlist - blend option select list element
   * @private
   */
  _makeSelectOptionList(selectlist) {
    snippet.forEach(this.fontFamilies, (option) => {
      const selectOption = document.createElement('option');
      selectOption.setAttribute('value', option);
      selectOption.innerHTML = option.replace(/^[a-z]/, ($0) => $0.toUpperCase());
      selectlist.appendChild(selectOption);
    });
  }

  /**
   * Make selectbox option list custom style
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _drawSelectOptionList(selectlist, optionlist) {
    const options = selectlist.querySelectorAll('option');
    snippet.forEach(options, (option) => {
      const optionElement = document.createElement('li');
      optionElement.innerHTML = option.innerHTML;
      optionElement.setAttribute('data-item', option.value);
      optionlist.appendChild(optionElement);
    });
  }

  /**
   * custom selectbox custom event
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _fontPickerWithSelectboxForAddEvent(selectlist, optionlist) {
    optionlist.addEventListener('click', (event) => {
      const optionValue = event.target.getAttribute('data-item');
      const fireEvent = document.createEvent('HTMLEvents');

      selectlist.querySelector(`[value="${optionValue}"]`).selected = true;
      fireEvent.initEvent('change', true, true);

      selectlist.dispatchEvent(fireEvent);

      this.selectBoxShow = false;
      optionlist.style.display = 'none';
    });

    selectlist.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.selectBoxShow = !this.selectBoxShow;
      optionlist.style.display = this.selectBoxShow ? 'block' : 'none';
      optionlist.setAttribute('data-selectitem', selectlist.value);
      optionlist.querySelector(`[data-item='${selectlist.value}']`).classList.add('active');
    });
  }

  /**
   * Add event
   * @private
   */
  _addEvent() {
    this.selectBox.addEventListener('change', (event) => {
      this.fire('change', event.target.value);
    });
  }

  /**
   * text align set handler
   * @param {Event} event - Change Event
   * @private
   */
  _changeFontFamilyHandler(event) {
    console.log(event);
    console.log(event.target.value);
    this.changeTextStyle(
      0,
      {
        fontFamily: event.target.value,
      },
      true
    );
  }
}

snippet.CustomEvents.mixin(FontFamily);
export default FontFamily;
