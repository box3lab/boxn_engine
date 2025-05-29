import { Scene, Vector2 } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";
import { UINode } from "./UINode";

/**
 * UIText - Class for displaying and managing text in the UI
 * UIText - 用于在UI中显示和管理文本的类
 * 
 * This class provides functionality for displaying and managing text within the UI system.
 * 此类提供了在UI系统中显示和管理文本的功能。
 */
export class UIText extends UINode {
    private _text: string = "";
    private _color: string = "white";
    private _fontSize: number = 24; 
    private _textBlock: TextBlock;

    constructor(name: string, text: string = "") {
        super(name);
        this._text = text;
        
        this._textBlock = new TextBlock(name + "_text");
        this._textBlock.text = text;
        this._textBlock.color = this._color;
        this._textBlock.fontSize = this._fontSize;
        this._control = this._textBlock;
    }

    // 文本内容
    get text(): string {
        return this._text;
    }

    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this._textBlock.text = value;
        }
    }

    // 文本颜色
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this._textBlock.color = value;
    }

    // 字体大小
    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(value: number) {
        if (this._fontSize !== value) {
            this._fontSize = value;
            this._textBlock.fontSize = value;
        }
    }

    // 文本水平对齐
    set textHorizontalAlignment(value: number) {
        this._textBlock.textHorizontalAlignment = value;
    }

    // 文本垂直对齐
    set textVerticalAlignment(value: number) {
        this._textBlock.textVerticalAlignment = value;
    }

    // 文本换行
    set textWrapping(value: boolean) {
        this._textBlock.textWrapping = value;
    }

    // 实现dispose方法
    dispose(): void {
        this._textBlock.dispose();
    }
}
