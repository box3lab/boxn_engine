import { Scene, Vector2, Vector3, AbstractMesh, TransformNode } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";

/**
 * UINode - Base class for BabylonJS UI controls
 * UINode - BabylonJS UI控件的基类
 * 
 * This class provides a foundation for managing UI elements within a BabylonJS scene.
 * It handles the creation, positioning, and hierarchy of UI components.
 * 
 * 此类为在BabylonJS场景中管理UI元素提供了基础。
 * 它处理UI组件的创建、定位和层级关系。
 */
export abstract class UINode {
    /** Reference to the BabylonJS scene / BabylonJS场景的引用 */
    protected _scene: Scene;
    
    /** UI texture for rendering UI elements / 用于渲染UI元素的纹理 */
    protected _uiTexture: AdvancedDynamicTexture;
    
    /** Main container for UI elements / UI元素的主容器 */
    protected _rootContainer: Rectangle;
    
    /** Position of the UI element / UI元素的位置 */
    protected _position: Vector2;
    
    /** Size of the UI element / UI元素的大小 */
    protected _size: Vector2;
    
    /** Visibility state of the UI element / UI元素的可见性状态 */
    protected _isVisible: boolean;
    
    /** Parent UINode reference / 父UINode引用 */
    protected _parent: UINode | null;
    
    /** Array of child UINodes / 子UINode数组 */
    protected _children: UINode[];

    /**
     * Creates a new UINode instance
     * 创建一个新的UINode实例
     * 
     * @param scene - The BabylonJS scene / BabylonJS场景
     * @param name - The name of the UI element / UI元素的名称
     */
    constructor(scene: Scene, name: string) {
        this._scene = scene;
        this._uiTexture = AdvancedDynamicTexture.CreateFullscreenUI(name);
        this._rootContainer = new Rectangle(name);
        this._position = new Vector2(0, 0);
        this._size = new Vector2(1, 1);
        this._isVisible = true;
        this._parent = null;
        this._children = [];

        // Initialize root container properties
        // 初始化根容器属性
        this._rootContainer.width = 1;
        this._rootContainer.height = 1;
        this._rootContainer.thickness = 0;
        this._rootContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._rootContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._uiTexture.addControl(this._rootContainer);
    }
    
    /**
     * Scale the UI element with the window size
     * 使用窗口大小缩放UI元素
     */
    public scaleWithWindow(){
        const engine = this._scene.getEngine();
        if (engine) {
            engine.onResizeObservable.add(() => {
                const renderEngine = this._scene.getEngine();
                if (renderEngine) {
                    this._uiTexture.scaleTo(renderEngine.getRenderWidth(), renderEngine.getRenderHeight());
                }
            });
        }
    }

    /** Get the scene reference / 获取场景引用 */
    public get scene(): Scene {
        return this._scene;
    }

    /** Get the UI texture / 获取UI纹理 */
    public get uiTexture(): AdvancedDynamicTexture {
        return this._uiTexture;
    }

    /** Get the root container / 获取根容器 */
    public get rootContainer(): Rectangle {
        return this._rootContainer;
    }

    /** Get the position / 获取位置 */
    public get position(): Vector2 {
        return this._position;
    }

    /** Set the position / 设置位置 */
    public set position(value: Vector2) {
        this._position = value;
        this._rootContainer.left = value.x;
        this._rootContainer.top = value.y;
    }

    /** Get the size / 获取大小 */
    public get size(): Vector2 {
        return this._size;
    }

    /** Set the size / 设置大小 */
    public set size(value: Vector2) {
        this._size = value;
        this._rootContainer.width = value.x;
        this._rootContainer.height = value.y;
    }

    /** Set the width / 设置宽度 */
    public setWidth(width: number|string): void {
        this._rootContainer.width = width;
    }

    /** Get the width / 获取宽度 */
    public getWidth(): number|string {
        return this._rootContainer.width;
    }

    /** Set the height / 设置高度 */
    public setHeight(height: number|string): void {
        this._rootContainer.height = height;
    }

    /** Get the height / 获取高度 */
    public getHeight(): number|string {
        return this._rootContainer.height;
    }

    /** Get visibility state / 获取可见性状态 */
    public get isVisible(): boolean {
        return this._isVisible;
    }

    /** Set visibility state / 设置可见性状态 */
    public set isVisible(value: boolean) {
        this._isVisible = value;
        this._rootContainer.isVisible = value;
    }

    /** Get parent node / 获取父节点 */
    public get parent(): UINode | null {
        return this._parent;
    }

    /** Get child nodes / 获取子节点 */
    public get children(): UINode[] {
        return this._children;
    }

    /**
     * Add a child UINode
     * 添加子UINode
     * 
     * @param child - The child UINode to add / 要添加的子UINode
     */
    public addChild(child: UINode): void {
        if (child._parent) {
            child._parent.removeChild(child);
        }
        child._parent = this;
        this._children.push(child);
        this._rootContainer.addControl(child._rootContainer);
    }

    /**
     * Remove a child UINode
     * 移除子UINode
     * 
     * @param child - The child UINode to remove / 要移除的子UINode
     */
    public removeChild(child: UINode): void {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            this._rootContainer.removeControl(child._rootContainer);
            child._parent = null;
        }
    }

    /**
     * Set the position using x,y coordinates
     * 使用x,y坐标设置位置
     * 
     * @param x - X coordinate / X坐标
     * @param y - Y coordinate / Y坐标
     */
    public setPosition(x: number, y: number): void {
        this.position = new Vector2(x, y);
    }

    /**
     * Set the size using width and height
     * 使用宽度和高度设置大小
     * 
     * @param width - Width of the UI element / UI元素的宽度
     * @param height - Height of the UI element / UI元素的高度
     */
    public setSize(width: number, height: number): void {
        this.size = new Vector2(width, height);
    }

    /** Show the UI element / 显示UI元素 */
    public show(): void {
        this.isVisible = true;
    }

    /** Hide the UI element / 隐藏UI元素 */
    public hide(): void {
        this.isVisible = false;
    }

    /** Get the debug state / 获取调试状态 */
    public get isDebug(): boolean {
        return this._rootContainer.thickness > 0;
    }

    /** Set the debug state / 设置调试状态 */
    public set isDebug(value: boolean) {
        this._rootContainer.thickness = value ? 1 : 0;
    }

    /**
     * Dispose of the UI element and its resources
     * 释放UI元素及其资源
     * 
     * This method should be called when the UI element is no longer needed
     * 当不再需要UI元素时应该调用此方法
     */
    public dispose(): void {
        // Remove from parent if exists
        // 如果存在父节点，从父节点中移除
        if (this._parent) {
            this._parent.removeChild(this);
        }

        // Dispose all children
        // 释放所有子节点
        for (const child of this._children) {
            child.dispose();
        }
        this._children = [];

        // Dispose UI elements
        // 释放UI元素
        this._rootContainer.dispose();
        this._uiTexture.dispose();
    }
}