import { Scene, Vector2, Color4 } from "@babylonjs/core";
import { Control, Rectangle } from "@babylonjs/gui";
import { UIContainer } from "./UIContainer";

/**
 * UIPanel - A container panel for UI elements
 * UIPanel - UI元素的容器面板
 * 
 * This class provides a panel container that can hold multiple UI elements.
 * It extends UINode with additional panel-specific features like background color,
 * border, and layout management.
 * 
 * 此类提供了一个可以容纳多个UI元素的面板容器。
 * 它扩展了UINode，添加了面板特定的功能，如背景颜色、边框和布局管理。
 */
export class UIPanel extends UIContainer  {
    private _width: string | number;
    private _height: string | number;
    private _background: string = "transparent";

    constructor(name: string, scene: Scene, width: string | number = "100%", height: string | number = "100%") {
        super(name, scene);
        this._width = width;
        this._height = height;
        this._containerControl.width = width;
        this._containerControl.height = height;
    }

    // 尺寸属性
    get width(): string | number {
        return this._width;
    }

    set width(value: string | number) {
        this._width = value;
        this._containerControl.width = value;
    }

    get height(): string | number {
        return this._height;
    }

    set height(value: string | number) {
        this._height = value;
        this._containerControl.height = value;
    }

    // 背景属性
    get background(): string {
        return this._background;
    }

    set background(value: string) {
        this._background = value;
        this._containerControl.background = value;
    }
}
