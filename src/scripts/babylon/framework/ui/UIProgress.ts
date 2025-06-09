import { TextBlock, Rectangle, Control } from "@babylonjs/gui";
import { UINode } from "./UINode";

/**
 * UIProgress - Class for creating and managing progress bar UI elements
 * UIProgress - 用于创建和管理进度条UI元素的类
 *
 * This class provides functionality for creating and managing progress bars within the UI system.
 * 此类提供了在UI系统中创建和管理进度条的功能。
 */
export class UIProgress extends UINode {
    private _currentValue: number = 100;
    private _maxValue: number = 100;
    private _progressBarBackground: Rectangle | null = null;
    private _progressBarForeground: Rectangle | null = null;
    private _textBlock: TextBlock | null = null;
    private _container: Rectangle | null = null;
    private _showText: boolean = true;
    private _textFormat: string = "{value}/{max}"; // 文本格式，支持 {value}, {max}, {percentage}

    // 进度条颜色配置
    private _normalColor: string = "#00ff00";    // 正常颜色（绿色）
    private _warningColor: string = "#ffff00";   // 警告颜色（黄色）
    private _dangerColor: string = "#ff0000";    // 危险颜色（红色）
    private _warningThreshold: number = 0.5;     // 警告阈值（50%）
    private _dangerThreshold: number = 0.25;     // 危险阈值（25%）

    // 进度条尺寸和样式
    private _width: number = 200;
    private _height: number = 20;
    private _barPadding: number = 2;
    private _backgroundColor: string = "#333333";
    private _borderColor: string = "white";
    private _borderThickness: number = 2;

    constructor(name: string, maxValue: number = 100, showText: boolean = true) {
        super(name);
        this._maxValue = maxValue;
        this._currentValue = maxValue;
        this._showText = showText;
        this.createProgressBar();
    }

    /**
     * 创建进度条控件
     */
    private createProgressBar(): void {
        // 创建容器
        this._container = new Rectangle(`${this._name}_container`);
        this._container.widthInPixels = this._width;
        this._container.heightInPixels = this._height + (this._showText ? 20 : 0);
        this._container.thickness = 0;
        this._container.background = "transparent";
        this._control = this._container;

        // 创建进度条背景
        this._progressBarBackground = new Rectangle(`${this._name}_background`);
        this._progressBarBackground.widthInPixels = this._width;
        this._progressBarBackground.heightInPixels = this._height;
        this._progressBarBackground.cornerRadius = 5;
        this._progressBarBackground.color = this._borderColor;
        this._progressBarBackground.thickness = this._borderThickness;
        this._progressBarBackground.background = this._backgroundColor;
        this._progressBarBackground.verticalAlignment = this._showText ? Control.VERTICAL_ALIGNMENT_TOP : Control.VERTICAL_ALIGNMENT_CENTER;
        this._progressBarBackground.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // 创建进度条前景
        this._progressBarForeground = new Rectangle(`${this._name}_foreground`);
        this._progressBarForeground.widthInPixels = (this._width - (this._barPadding * 2)) * (this._currentValue / this._maxValue);
        this._progressBarForeground.heightInPixels = this._height - (this._barPadding * 2);
        this._progressBarForeground.cornerRadius = 3;
        this._progressBarForeground.thickness = 0;
        this._progressBarForeground.background = this._normalColor;
        this._progressBarForeground.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._progressBarForeground.verticalAlignment = this._showText ? Control.VERTICAL_ALIGNMENT_TOP : Control.VERTICAL_ALIGNMENT_CENTER;
        this._progressBarForeground.leftInPixels = this._barPadding;
        this._progressBarForeground.topInPixels = this._showText ? this._barPadding : 0;

        // 设置进度条颜色
        this.updateProgressBarColor();

        // 创建文本显示
        if (this._showText) {
            this._textBlock = new TextBlock(`${this._name}_text`);
            this._textBlock.text = this.formatText();
            this._textBlock.color = "white";
            this._textBlock.fontSize = 12;
            this._textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            this._textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this._textBlock.heightInPixels = 16;
        }

        // 添加控件到容器
        this._container.addControl(this._progressBarBackground);
        this._container.addControl(this._progressBarForeground);
        if (this._textBlock) {
            this._container.addControl(this._textBlock);
        }

        // 应用初始属性
        this.applyProperties();
    }

    /**
     * 应用属性到控件
     */
    private applyProperties(): void {
        if (!this._control) return;

        this._control.isVisible = this._isVisible;
        this._control.left = this._position.x + "px";
        this._control.top = this._position.y + "px";
        this._control.rotation = this._rotation;
        this._control.scaleX = this._scale.x;
        this._control.scaleY = this._scale.y;
        this._control.horizontalAlignment = this._horizontalAlignment;
        this._control.verticalAlignment = this._verticalAlignment;
    }

    /**
     * 格式化文本显示
     */
    private formatText(): string {
        const percentage = Math.round((this._currentValue / this._maxValue) * 100);
        return this._textFormat
            .replace("{value}", Math.ceil(this._currentValue).toString())
            .replace("{max}", this._maxValue.toString())
            .replace("{percentage}", percentage.toString());
    }

    /**
     * 更新进度条颜色
     */
    private updateProgressBarColor(): void {
        if (!this._progressBarForeground) return;

        const percentage = this._currentValue / this._maxValue;

        if (percentage > this._warningThreshold) {
            this._progressBarForeground.background = this._normalColor;
        } else if (percentage > this._dangerThreshold) {
            this._progressBarForeground.background = this._warningColor;
        } else {
            this._progressBarForeground.background = this._dangerColor;
        }
    }

    /**
     * 更新显示
     */
    private updateDisplay(): void {
        if (!this._progressBarForeground) return;

        // 更新进度条宽度
        const percentage = this._currentValue / this._maxValue;
        this._progressBarForeground.widthInPixels = (this._width - (this._barPadding * 2)) * percentage;

        this.updateProgressBarColor();

        if (this._textBlock && this._showText) {
            this._textBlock.text = this.formatText();
        }
    }

    /**
     * 设置当前值
     * @param value 当前值
     */
    public setValue(value: number): void {
        this._currentValue = Math.max(0, Math.min(value, this._maxValue));
        this.updateDisplay();
    }

    /**
     * 获取当前值
     */
    public getValue(): number {
        return this._currentValue;
    }

    /**
     * 设置最大值
     * @param maxValue 最大值
     */
    public setMaxValue(maxValue: number): void {
        this._maxValue = Math.max(1, maxValue);
        this._currentValue = Math.min(this._currentValue, this._maxValue);
        this.updateDisplay();
    }

    /**
     * 获取最大值
     */
    public getMaxValue(): number {
        return this._maxValue;
    }

    /**
     * 减少值
     * @param amount 减少的数量
     */
    public decreaseValue(amount: number): void {
        this.setValue(this._currentValue - amount);
    }

    /**
     * 增加值
     * @param amount 增加的数量
     */
    public increaseValue(amount: number): void {
        this.setValue(this._currentValue + amount);
    }

    /**
     * 获取进度百分比
     */
    public getPercentage(): number {
        return this._currentValue / this._maxValue;
    }

    /**
     * 设置颜色配置
     * @param normalColor 正常颜色
     * @param warningColor 警告颜色
     * @param dangerColor 危险颜色
     * @param warningThreshold 警告阈值
     * @param dangerThreshold 危险阈值
     */
    public setColors(
        normalColor: string,
        warningColor: string,
        dangerColor: string,
        warningThreshold: number = 0.5,
        dangerThreshold: number = 0.25
    ): void {
        this._normalColor = normalColor;
        this._warningColor = warningColor;
        this._dangerColor = dangerColor;
        this._warningThreshold = warningThreshold;
        this._dangerThreshold = dangerThreshold;
        this.updateDisplay();
    }

    /**
     * 设置进度条尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;

        if (this._container && this._progressBarBackground && this._progressBarForeground) {
            this._container.widthInPixels = width;
            this._container.heightInPixels = height + (this._showText ? 20 : 0);
            this._progressBarBackground.widthInPixels = width;
            this._progressBarBackground.heightInPixels = height;

            // 重新计算前景宽度
            const percentage = this._currentValue / this._maxValue;
            this._progressBarForeground.widthInPixels = (width - (this._barPadding * 2)) * percentage;
            this._progressBarForeground.heightInPixels = height - (this._barPadding * 2);
            this._progressBarForeground.leftInPixels = this._barPadding;
        }
    }

    /**
     * 设置文本格式
     * @param format 文本格式，支持 {value}, {max}, {percentage}
     */
    public setTextFormat(format: string): void {
        this._textFormat = format;
        if (this._textBlock && this._showText) {
            this._textBlock.text = this.formatText();
        }
    }

    /**
     * 设置是否显示文本
     * @param show 是否显示文本
     */
    public setShowText(show: boolean): void {
        if (this._showText === show) return;

        this._showText = show;

        if (this._container && this._textBlock) {
            if (show) {
                this._container.addControl(this._textBlock);
                this._container.heightInPixels = this._height + 20;
                if (this._progressBarBackground) {
                    this._progressBarBackground.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                }
                if (this._progressBarForeground) {
                    this._progressBarForeground.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
                    this._progressBarForeground.topInPixels = this._barPadding;
                }
            } else {
                this._container.removeControl(this._textBlock);
                this._container.heightInPixels = this._height;
                if (this._progressBarBackground) {
                    this._progressBarBackground.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                }
                if (this._progressBarForeground) {
                    this._progressBarForeground.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
                    this._progressBarForeground.topInPixels = 0;
                }
            }
        }
    }

    /**
     * 获取文本显示状态
     */
    public getShowText(): boolean {
        return this._showText;
    }

    /**
     * 设置文本颜色
     * @param color 文本颜色
     */
    public setTextColor(color: string): void {
        if (this._textBlock) {
            this._textBlock.color = color;
        }
    }

    /**
     * 设置文本字体大小
     * @param size 字体大小
     */
    public setTextFontSize(size: number): void {
        if (this._textBlock) {
            this._textBlock.fontSize = size;
        }
    }

    /**
     * 设置进度条背景颜色
     * @param color 背景颜色
     */
    public setBackgroundColor(color: string): void {
        this._backgroundColor = color;
        if (this._progressBarBackground) {
            this._progressBarBackground.background = color;
        }
    }

    /**
     * 设置进度条边框颜色
     * @param color 边框颜色
     */
    public setBorderColor(color: string): void {
        this._borderColor = color;
        if (this._progressBarBackground) {
            this._progressBarBackground.color = color;
        }
    }

    /**
     * 设置边框厚度
     * @param thickness 边框厚度
     */
    public setBorderThickness(thickness: number): void {
        this._borderThickness = thickness;
        if (this._progressBarBackground) {
            this._progressBarBackground.thickness = thickness;
        }
    }

    /**
     * 实现dispose方法
     */
    public dispose(): void {
        if (this._container) {
            this._container.dispose();
            this._container = null;
        }

        this._progressBarBackground = null;
        this._progressBarForeground = null;
        this._textBlock = null;
        this._control = undefined;
    }
}
