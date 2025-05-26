import { Scene, Vector2, Color4 } from "@babylonjs/core";
import { Control, Rectangle } from "@babylonjs/gui";
import { UINode } from "./UINode";

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
export class UIPanel extends UINode {
    /** Background color of the panel / 面板的背景颜色 */
    private _backgroundColor: Color4;
    
    /** Border color of the panel / 面板的边框颜色 */
    private _borderColor: Color4;
    
    /** Border thickness of the panel / 面板的边框粗细 */
    private _borderThickness: number;
    
    /** Corner radius of the panel / 面板的圆角半径 */
    private _cornerRadius: number;

    /**
     * Creates a new UIPanel instance
     * 创建一个新的UIPanel实例
     * 
     * @param scene - The BabylonJS scene / BabylonJS场景
     * @param name - The name of the panel / 面板的名称
     */
    constructor(scene: Scene, name: string) {
        super(scene, name);
        
        // Initialize panel properties
        // 初始化面板属性
        this._backgroundColor = new Color4(0.2, 0.2, 0.2, 0.8);
        this._borderColor = new Color4(0.5, 0.5, 0.5, 1);
        this._borderThickness = 1;
        this._cornerRadius = 5;

        // Apply initial styling
        // 应用初始样式
        this.applyStyle();
    }

    /**
     * Apply the current style settings to the panel
     * 将当前样式设置应用到面板
     */
    private applyStyle(): void {
        this._rootContainer.background = this._backgroundColor.toHexString();
        this._rootContainer.thickness = this._borderThickness;
        this._rootContainer.color = this._borderColor.toHexString();
        this._rootContainer.cornerRadius = this._cornerRadius;
    }

    /**
     * Set the background color of the panel
     * 设置面板的背景颜色
     * 
     * @param color - The background color / 背景颜色
     */
    public setBackgroundColor(color: Color4): void {
        this._backgroundColor = color;
        this.applyStyle();
    }

    /**
     * Set the border color of the panel
     * 设置面板的边框颜色
     * 
     * @param color - The border color / 边框颜色
     */
    public setBorderColor(color: Color4): void {
        this._borderColor = color;
        this.applyStyle();
    }

    /**
     * Set the border thickness of the panel
     * 设置面板的边框粗细
     * 
     * @param thickness - The border thickness / 边框粗细
     */
    public setBorderThickness(thickness: number): void {
        this._borderThickness = thickness;
        this.applyStyle();
    }

    /**
     * Set the corner radius of the panel
     * 设置面板的圆角半径
     * 
     * @param radius - The corner radius / 圆角半径
     */
    public setCornerRadius(radius: number): void {
        this._cornerRadius = radius;
        this.applyStyle();
    }

    /**
     * Center the panel in its parent container
     * 在父容器中居中面板
     */
    public centerInParent(): void {
        this._rootContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._rootContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    }

    /**
     * Set the panel to stretch to fill its parent container
     * 设置面板以填充其父容器
     */
    public stretchToParent(): void {
        this._rootContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._rootContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._rootContainer.width = 1;
        this._rootContainer.height = 1;
    }

    /**
     * Get the background color
     * 获取背景颜色
     */
    public get backgroundColor(): Color4 {
        return this._backgroundColor;
    }

    /**
     * Get the border color
     * 获取边框颜色
     */
    public get borderColor(): Color4 {
        return this._borderColor;
    }

    /**
     * Get the border thickness
     * 获取边框粗细
     */
    public get borderThickness(): number {
        return this._borderThickness;
    }

    /**
     * Get the corner radius
     * 获取圆角半径
     */
    public get cornerRadius(): number {
        return this._cornerRadius;
    }
}
