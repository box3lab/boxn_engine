import { Scene, Vector2 } from "@babylonjs/core";
import { ScrollViewer, Control, Rectangle } from "@babylonjs/gui";
import { UINode } from "./UINode";

/**
 * UIScrollView - A scrollable view container for UI elements
 * UIScrollView - 用于UI元素的可滚动视图容器
 * 
 * This class provides a scrollable container that can hold multiple UI elements.
 * It extends UINode with scroll view specific features like scroll bars, content size,
 * and scroll position management.
 * 
 * 此类提供了一个可以容纳多个UI元素的可滚动容器。
 * 它扩展了UINode，添加了滚动视图特定的功能，如滚动条、内容大小和滚动位置管理。
 */
export class UIScrollView extends UINode {
    /** The underlying ScrollViewer control / 底层的ScrollViewer控件 */
    private _scrollViewer: ScrollViewer;
    /** Width of the scroll view / 滚动视图的宽度 */
    private _width: string | number;
    /** Height of the scroll view / 滚动视图的高度 */
    private _height: string | number;
    /** Color of the scroll bars / 滚动条的颜色 */
    private _barColor: string = "#666666";
    /** Background color of the scroll view / 滚动视图的背景颜色 */
    private _backgroundColor: string = "#00000090";

    /** The content rectangle of the scroll view / 滚动视图的内容矩形 */
    private _contentRect: Rectangle;

    /**
     * Creates a new UIScrollView
     * 创建一个新的UIScrollView
     * @param name Name of the scroll view / 滚动视图的名称
     * @param width Width of the scroll view / 滚动视图的宽度
     * @param height Height of the scroll view / 滚动视图的高度
     */
    constructor(name: string,
        width: string | number = "100px", height: string | number = "100px") {
        super(name);
        this._width = width;
        this._height = height;

        // Create the scroll viewer control / 创建滚动视图控件
        this._scrollViewer = new ScrollViewer(name + "_scrollViewer");
        this._scrollViewer.width = width;
        this._scrollViewer.height = height;
        this._scrollViewer.horizontalBar.color = this._barColor;
        this._scrollViewer.verticalBar.color = this._barColor;
        this._scrollViewer.thickness = 0;
        this._scrollViewer.background = this._backgroundColor;

        this._control = this._scrollViewer;
        this._contentRect = new Rectangle(name + "_contentRect");
        // this._contentRect.background = this._backgroundColor;
        this._scrollViewer.addControl(this._contentRect);
    }

    /**
     * Gets or sets the width of the scroll view
     * 获取或设置滚动视图的宽度
     */
    get width(): string | number {
        return this._width;
    }

    set width(value: string | number) {
        this._width = value;
        this._scrollViewer.width = value;
    }

    /**
     * Gets or sets the height of the scroll view
     * 获取或设置滚动视图的高度
     */
    get height(): string | number {
        return this._height;
    }

    set height(value: string | number) {
        this._height = value;
        this._scrollViewer.height = value;
    }

    /**
     * Gets or sets the color of the scroll bars
     * 获取或设置滚动条的颜色
     */
    get barColor(): string {
        return this._barColor;
    }

    /**
     * Sets the color of the scroll bars
     * 设置滚动条的颜色
     */
    set barColor(value: string) {
        this._barColor = value;
        this._scrollViewer.horizontalBar.color = value;
        this._scrollViewer.verticalBar.color = value;
    }

    /**
     * Gets the content container where child elements can be added
     * 获取可以添加子元素的内容容器
     */
    get contentContainer(): Control {
        return this._scrollViewer;
    }

    /**
     * Gets the content rectangle of the scroll view
     * 获取滚动视图的内容矩形
     */
    get contentRect(): Rectangle {
        return this._contentRect;
    }

    /**
     * Sets the content rectangle of the scroll view
     * 设置滚动视图的内容矩形
     */
    set contentRect(value: Rectangle) {
        this._contentRect = value;
    }

    /**
     * Gets or sets the width of the content rectangle
     * 获取或设置内容矩形的宽度
     */
    public set contentRectWidth(width: string | number) {
        this._contentRect.width = width;
    }

    /**
     * Gets the width of the content rectangle
     * 获取内容矩形的宽度
     */
    public get contentRectWidth(): string | number{
        return this._contentRect.width;
    }

    /**
     * Gets or sets the height of the content rectangle
     * 获取或设置内容矩形的高度
     */
    public set contentRectHeight(height: string | number) {
        this._contentRect.height = height;
    }

    /**
     * Gets the height of the content rectangle
     * 获取内容矩形的高度
     */
    public get contentRectHeight(): string | number{
        return this._contentRect.height;
    }

    /**
     * Gets or sets the current scroll position
     * 获取或设置当前的滚动位置
     * @returns A Vector2 containing the horizontal and vertical scroll positions
     * 返回包含水平和垂直滚动位置的Vector2
     */
    get scrollPosition(): Vector2 {
        return new Vector2(
            this._scrollViewer.horizontalBar.value,
            this._scrollViewer.verticalBar.value
        );
    }

    set scrollPosition(value: Vector2) {
        this._scrollViewer.horizontalBar.value = value.x;
        this._scrollViewer.verticalBar.value = value.y;
    }

    /**
     * Gets or sets the background color of the scroll view
     * 获取或设置滚动视图的背景颜色
     */
    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(value: string) {
        this._backgroundColor = value;
        this._scrollViewer.background = value;
    }
    
    /**
     * Disposes the scroll view and releases all resources
     * 销毁滚动视图并释放所有资源
     */
    public dispose(): void {
        if (this._scrollViewer) {
            this._scrollViewer.dispose();
            this._scrollViewer = null as any;
        }
    }
} 