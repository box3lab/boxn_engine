import { Control, InputText } from "@babylonjs/gui";
import { UINode } from "./UINode";
import type { EventState } from "babylonjs";

/**
 * UIInputText - Class for managing user input text in the UI
 * UIInputText - 用于在UI中管理用户输入文本的类
 * 
 * This class provides functionality for managing user input text within the UI system.
 * 此类提供了在UI系统中接受用户输入文本的功能
 */
// Bug: 输入框内无法使用输入法
export class UIInputText extends UINode {
    private _bgColor: string = "#000000a0";
    private _bgColorFocused: string = "#000000ff";
    private _text: string = "";
    private _color: string = "white";
    private _fontSize: number = 24; 
    private _placeholderText: string = "";
    private _placeholderColor: string = "gray";
    private _inputText: InputText;

    constructor(name: string, text: string = "", placeholder: string = "") {
        super(name);
        this._text = text;
        this._placeholderText = placeholder; // 初始时描述文本与文本内容相同

        this._inputText = new InputText(name + "_inputText");
        this._inputText.background = this._bgColor;
        this._inputText.focusedBackground = this._bgColorFocused;
        this._inputText.text = this._text;
        this._inputText.color = this._color;
        this._inputText.fontSize = this._fontSize;
        this._inputText.placeholderText = this._placeholderText;
        this._inputText.placeholderColor = this._placeholderColor;
        this._inputText.height = "40px"; // 设置输入框高度为40像素
        this.onTextChanged((eventData, _) => {
            this._text = eventData.text; // 更新文本内容
        });

        this._control = this._inputText;
    }

    // 背景颜色
    get bgColor(): string {
        return this._bgColor;
    }
    set bgColor(value: string) {
        if (this._bgColor!== value) {
            this._bgColor = value;
            this._inputText.background = value;
        }
    }

    // 背景颜色（焦点）
    get bgColorFocused(): string {
        return this._bgColorFocused;
    }
    set bgColorFocused(value: string) {
        if (this._bgColorFocused!== value) {
            this._bgColorFocused = value;
            this._inputText.focusedBackground = value;
        }
    }

    // 文本内容
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this._inputText.text = value;
        }
    }

    // 文本颜色
    get color(): string {
        return this._color;
    }
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this._inputText.color = value;
        }
    }

    // 字体大小
    get fontSize(): number {
        return this._fontSize;
    }
    set fontSize(value: number) {
        if (this._fontSize !== value) {
            this._fontSize = value;
            this._inputText.fontSize = value;
        }
    }

    // 描述文本
    get placeholder(): string {
        return this._placeholderText;
    }
    set placeholder(value: string) {
        if (this._placeholderText !== value) {
            this._placeholderText = value;
            this._inputText.placeholderText = value;
        }
    }

    // 描述文本颜色
    get placeholderColor(): string {
        return this._placeholderColor;
    }
    set placeholderColor(value: string) {
        if (this._placeholderColor !== value) {
            this._placeholderColor = value;
            this._inputText.placeholderColor = value;
        }
    }

    set textHorizontalAlignment(value: number) {
        this._inputText.horizontalAlignment = value;
    }

    set textVerticalAlignment(value: number) {
        this._inputText.verticalAlignment = value;
    }

    // 文本改变事件
    onTextChanged(callback: (eventData: InputText, eventState: EventState) => void): void {
        this._inputText.onTextChangedObservable.add(callback);
    }

    // 文本回车输入事件
    onEnterPressed(callback: (eventData: Control, eventState: EventState) => void): void {
        this._inputText.onEnterPressedObservable.add(callback);
    }

    public dispose(): void {
        this._inputText.dispose();
    }
}