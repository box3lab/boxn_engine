import { Vector2, Vector3, type Scene } from "@babylonjs/core";
import type { UIContainer } from "./UIContainer";
import { Control } from "@babylonjs/gui";

/**
 * Base class for all UI elements in the framework
 * UI框架中所有UI元素的基类
 */
export abstract class UINode {
    /** Parent container of this UI node / UI节点的父容器 */
    protected _parent: UIContainer | null = null;
    /** Name of the UI node / UI节点的名称 */
    protected _name: string;
    /** Visibility state of the UI node / UI节点的可见性状态 */
    protected _isVisible: boolean = true;
    /** Position of the UI node in 2D space / UI节点在2D空间中的位置 */
    protected _position: Vector2 = Vector2.Zero();
    /** Rotation angle of the UI node in radians / UI节点的旋转角度（弧度） */
    protected _rotation: number = 0;
    /** Scale of the UI node / UI节点的缩放比例 */
    protected _scale: Vector2 = new Vector2(1, 1);
    /** Horizontal alignment of the UI node / UI节点的水平对齐方式 */
    protected _horizontalAlignment: number = Control.HORIZONTAL_ALIGNMENT_LEFT;
    /** Vertical alignment of the UI node / UI节点的垂直对齐方式 */
    protected _verticalAlignment: number = Control.VERTICAL_ALIGNMENT_TOP;
    /** Underlying Babylon.js GUI control / 底层的Babylon.js GUI控件 */
    protected _control: Control | undefined;

    /**
     * Creates a new UI node
     * 创建一个新的UI节点
     * @param name Name of the UI node / UI节点的名称
     */
    constructor(name: string) {
        this._name = name;
    }

    /**
     * Gets or sets the parent container
     * 获取或设置父容器
     */
    get parent(): UIContainer | null {
        return this._parent;
    }

    set parent(value: UIContainer | null) {
        if (this._parent === value) return;
        
        // Remove from original parent container / 从原父容器移除
        if (this._parent) {
            this._parent.removeChild(this);
        }
        
        // Add to new parent container / 添加到新父容器
        if (value) {
            value.addChild(this);
        } else {
            this._parent = null;
        }
    }

    /**
     * Gets the name of the UI node
     * 获取UI节点的名称
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets or sets the visibility state
     * 获取或设置可见性状态
     */
    get isVisible(): boolean {
        return this._isVisible;
    }

    set isVisible(value: boolean) {
        if (this._isVisible !== value) {
            this._isVisible = value;
            if (this._control) {
                this._control.isVisible = value;
            }
        }
    }

    /**
     * Gets or sets the position in 2D space
     * 获取或设置在2D空间中的位置
     */
    get position(): Vector2 {
        return this._position.clone();
    }

    set position(value: Vector2) {
        this._position.copyFrom(value);
        if (this._control) {
            this._control.left = value.x + "px";
            this._control.top = value.y + "px";
        }
    }

    /**
     * Gets or sets the rotation angle in radians
     * 获取或设置旋转角度（弧度）
     */
    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
        if (this._control) {
            this._control.rotation = value;
        }
    }

    /**
     * Gets or sets the scale
     * 获取或设置缩放比例
     */
    get scale(): Vector2 {
        return this._scale.clone();
    }

    set scale(value: Vector2) {
        this._scale.copyFrom(value);
        if (this._control) {
            this._control.scaleX = value.x;
            this._control.scaleY = value.y;
        }
    }

    /**
     * Gets or sets the horizontal alignment
     * 获取或设置水平对齐方式
     */
    get horizontalAlignment(): number {
        return this._horizontalAlignment;
    }

    set horizontalAlignment(value: number) {
        this._horizontalAlignment = value;
        if (this._control) {
            this._control.horizontalAlignment = value;
        }
    }

    /**
     * Gets or sets the vertical alignment
     * 获取或设置垂直对齐方式
     */
    get verticalAlignment(): number {
        return this._verticalAlignment;
    }

    set verticalAlignment(value: number) {
        this._verticalAlignment = value;
        if (this._control) {
            this._control.verticalAlignment = value;
        }
    }

    /**
     * Gets the underlying Babylon.js GUI control
     * 获取底层的Babylon.js GUI控件
     */
    get control(): Control | undefined {
        return this._control;
    }

    /**
     * Disposes the UI node and releases all resources
     * 销毁UI节点并释放所有资源
     */
    public abstract dispose(): void;
}