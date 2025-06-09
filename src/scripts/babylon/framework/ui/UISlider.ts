import { TextBlock, Rectangle, Control, Slider } from "@babylonjs/gui";
import { UINode } from "./UINode";

/**
 * UISlider - Class for creating and managing slider UI elements
 * UISlider - 用于创建和管理滑块UI元素的类
 *
 * This class provides functionality for creating and managing interactive sliders within the UI system.
 * 此类提供了在UI系统中创建和管理交互式滑块的功能。
 */
export class UISlider extends UINode {
    private _slider: Slider;
    private _textBlock: TextBlock | null = null;
    private _container: Rectangle | null = null;

    // 显示选项
    private _showText: boolean = true;
    private _textFormat: string = "{value}"; // 文本格式，支持 {value}, {min}, {max}, {percentage}

    // 滑块样式配置
    private _width: string = "200px";
    private _height: string = "20px";

    // 回调函数
    private _onValueChanged: ((value: number) => void) | null = null;

    constructor(name: string, minValue: number = 0, maxValue: number = 100, currentValue?: number, showText: boolean = true) {
        super(name);
        this._showText = showText;
        this._slider = new Slider(name);
        this.createSlider(minValue, maxValue, currentValue);
    }

    /**
     * 创建滑块控件
     */
    private createSlider(minValue: number, maxValue: number, currentValue?: number): void {
        // 创建主容器
        this._container = new Rectangle(`${this._name}_container`);
        this._container.width = this._width;
        this._container.height = this._showText ? "40px" : this._height;
        this._container.thickness = 0;
        this._container.background = "transparent";
        this._control = this._container;

        // 创建内置滑块
        this._slider = new Slider(`${this._name}_slider`);
        this._slider.minimum = minValue;
        this._slider.maximum = maxValue;
        this._slider.value = currentValue !== undefined ? currentValue : (minValue + maxValue) / 2;
        this._slider.width = this._width;
        this._slider.height = this._height;
        this._slider.color = "#00ff00";
        this._slider.background = "#333333";
        this._slider.verticalAlignment = this._showText ? Control.VERTICAL_ALIGNMENT_TOP : Control.VERTICAL_ALIGNMENT_CENTER;
        this._slider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // 设置滑块事件
        this._slider.onValueChangedObservable.add((value) => {
            this.updateText();
            if (this._onValueChanged) {
                this._onValueChanged(value);
            }
        });

        // 创建文本显示
        if (this._showText) {
            this._textBlock = new TextBlock(`${this._name}_text`);
            this._textBlock.text = this.formatText();
            this._textBlock.color = "white";
            this._textBlock.fontSize = 12;
            this._textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            this._textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this._textBlock.height = "16px";
        }

        // 添加控件到容器
        this._container.addControl(this._slider);
        if (this._textBlock) {
            this._container.addControl(this._textBlock);
        }

        // 应用初始属性
        this.applyProperties();
    }

    /**
     * 更新文本显示
     */
    private updateText(): void {
        if (this._textBlock && this._showText) {
            this._textBlock.text = this.formatText();
        }
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
        const value = this._slider.value;
        const min = this._slider.minimum;
        const max = this._slider.maximum;
        const percentage = Math.round(((value - min) / (max - min)) * 100);

        return this._textFormat
            .replace("{value}", value.toFixed(2))
            .replace("{min}", min.toString())
            .replace("{max}", max.toString())
            .replace("{percentage}", percentage.toString());
    }

    /**
     * 设置当前值
     * @param value 当前值
     */
    public setValue(value: number): void {
        this._slider.value = value;
        this.updateText();
    }

    /**
     * 获取当前值
     */
    public getValue(): number {
        return this._slider.value;
    }

    /**
     * 设置最小值
     * @param minValue 最小值
     */
    public setMinValue(minValue: number): void {
        this._slider.minimum = minValue;
        this.updateText();
    }

    /**
     * 获取最小值
     */
    public getMinValue(): number {
        return this._slider.minimum;
    }

    /**
     * 设置最大值
     * @param maxValue 最大值
     */
    public setMaxValue(maxValue: number): void {
        this._slider.maximum = maxValue;
        this.updateText();
    }

    /**
     * 获取最大值
     */
    public getMaxValue(): number {
        return this._slider.maximum;
    }

    /**
     * 设置步长
     * @param step 步长
     */
    public setStep(step: number): void {
        this._slider.step = step;
    }

    /**
     * 获取步长
     */
    public getStep(): number {
        return this._slider.step || 1;
    }

    /**
     * 设置范围
     * @param minValue 最小值
     * @param maxValue 最大值
     */
    public setRange(minValue: number, maxValue: number): void {
        this._slider.minimum = minValue;
        this._slider.maximum = maxValue;
        this.updateText();
    }

    /**
     * 获取百分比
     */
    public getPercentage(): number {
        const min = this._slider.minimum;
        const max = this._slider.maximum;
        const value = this._slider.value;
        return (value - min) / (max - min);
    }

    /**
     * 设置是否启用
     * @param enabled 是否启用
     */
    public setEnabled(enabled: boolean): void {
        this._slider.isEnabled = enabled;
        this._slider.alpha = enabled ? 1.0 : 0.5;
    }

    /**
     * 获取是否启用
     */
    public getEnabled(): boolean {
        return this._slider.isEnabled;
    }

    /**
     * 设置滑块尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setSize(width: string, height: string): void {
        this._width = width;
        this._height = height;

        if (this._container && this._slider) {
            this._container.width = width;
            this._container.height = this._showText ? "40px" : height;
            this._slider.width = width;
            this._slider.height = height;
        }
    }

    /**
     * 设置颜色配置
     * @param backgroundColor 背景颜色
     * @param fillColor 填充颜色
     */
    public setColors(backgroundColor: string, fillColor: string): void {
        this._slider.background = backgroundColor;
        this._slider.color = fillColor;
    }

    /**
     * 设置文本格式
     * @param format 文本格式，支持 {value}, {min}, {max}, {percentage}
     */
    public setTextFormat(format: string): void {
        this._textFormat = format;
        this.updateText();
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
                this._container.height = "40px";
                this._slider.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            } else {
                this._container.removeControl(this._textBlock);
                this._container.height = this._height;
                this._slider.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
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
     * 设置值变化回调
     * @param callback 回调函数
     */
    public setOnValueChanged(callback: (value: number) => void): void {
        this._onValueChanged = callback;
    }

    /**
     * 实现dispose方法
     */
    public dispose(): void {
        if (this._container) {
            this._container.dispose();
            this._container = null;
        }

        this._textBlock = null;
        this._control = undefined;

        // 清理回调
        this._onValueChanged = null;
    }
}

