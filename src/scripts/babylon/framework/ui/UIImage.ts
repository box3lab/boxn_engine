import { Vector2 } from "@babylonjs/core";
import { Image } from "@babylonjs/gui";
import { UINode } from "./UINode";

export class UIImage extends UINode {
    protected _imageControl: Image;
    protected _source: string = "";

    constructor(name: string,source?:string) {
        super(name);
        this._imageControl = new Image(name);
        this._control = this._imageControl;
        if(source){
            this._source = source;
        }
    }

    // 获取/设置图片源
    get source(): string {
        return this._source;
    }

    set source(value: string) {
        if (this._source !== value) {
            this._source = value;
            this._imageControl.source = value;
        }
    }

    // 获取/设置图片宽度
    get width(): string | number {
        return this._imageControl.width;
    }

    set width(value: string | number) {
        this._imageControl.width = value;
    }

    // 获取/设置图片高度
    get height(): string | number {
        return this._imageControl.height;
    }

    set height(value: string | number) {
        this._imageControl.height = value;
    }

    // 获取/设置图片缩放模式
    get stretch(): number {
        return this._imageControl.stretch;
    }

    set stretch(value: number) {
        this._imageControl.stretch = value;
    }

    // 实现dispose方法
    public dispose(): void {
        if (this._imageControl) {
            this._imageControl.dispose();
            this._imageControl = null as any;
        }
    }
}
