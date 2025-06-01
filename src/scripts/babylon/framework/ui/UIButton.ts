import { Observer, Scene, Vector2, type Nullable } from "@babylonjs/core";
import { Button, TextBlock, Vector2WithInfo } from "@babylonjs/gui";
import { UINode } from "./UINode";

/**
 * UIButton - Class for creating and managing button UI elements
 * UIButton - 用于创建和管理按钮UI元素的类
 * 
 * This class provides functionality for creating interactive buttons with text and click handling.
 * 此类提供了创建带有文本和点击处理的交互式按钮的功能。
 */
export class UIButton extends UINode {
    private _text: string = "";
    private _button: Button;
    private _onClick: (() => void) | null = null;

    constructor(name: string, text: string = "") {
        super(name);
        this._text = text;
        
        this._button = Button.CreateSimpleButton(name + "_button", text);
        this._button.name = name;
        this._button.onPointerClickObservable.add(() => {
            if (this._onClick) {
                this._onClick();
            }
        });
        this._control = this._button;
    }

    // 按钮文本
    get text(): string {
        return this._text;
    }

    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            if (this._button.textBlock) {
                this._button.textBlock.text = value;
            }
        }
    }

    // 按钮颜色
    set color(value: string) {
        this._button.color = value;
    }

    // 背景颜色
    set background(value: string) {
        this._button.background = value;
    }

    // 设置点击事件
    set onClick(callback: () => void) {
        this._onClick = callback;
    }

    // 实现dispose方法
    dispose(): void {
        this._button.dispose();
    }
}
