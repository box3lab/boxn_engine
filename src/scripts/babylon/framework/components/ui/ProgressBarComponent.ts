import { Vector3, Color3, MeshBuilder } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from "@babylonjs/gui";
import { BaseComponent } from "../BaseComponent";
import type { IGameEntity } from "../../interface/IGameEntity";

/**
 * ProgressBarComponent - 3D进度条组件
 * 
 * 可用于显示血量、魔法值、经验值等各种进度信息
 */
export class ProgressBarComponent extends BaseComponent {
    private _currentValue: number = 100;
    private _maxValue: number = 100;
    private _texture: AdvancedDynamicTexture | null = null;
    private _mesh: any = null;
    private _progressBar: Rectangle | null = null;
    private _progressText: TextBlock | null = null;
    private _offset: Vector3 = new Vector3(0, 2, 0);
    private _barWidth: number = 150;
    private _barHeight: number = 20;
    private _barPadding: number = 2;
    private _isCreated: boolean = false;
    
    // 进度条颜色配置
    private _normalColor: string = "#00ff00";    // 正常颜色（绿色）
    private _warningColor: string = "#ffff00";   // 警告颜色（黄色）
    private _dangerColor: string = "#ff0000";    // 危险颜色（红色）
    private _warningThreshold: number = 0.5;     // 警告阈值（50%）
    private _dangerThreshold: number = 0.25;     // 危险阈值（25%）

    constructor(name: string = "ProgressBarComponent", maxValue: number = 100, offset?: Vector3) {
        super(name);
        this._maxValue = maxValue;
        this._currentValue = maxValue;
        if (offset) {
            this._offset = offset;
        }
    }

    public override attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        console.log("ProgressBarComponent: Attaching to entity:", gameEntity.getName());
        
        // 延迟创建，确保实体完全初始化
        setTimeout(() => {
            this.createProgressBar();
        }, 100);
    }

    private createProgressBar(): void {
        if (this._isCreated || !this.entity || !this.entity.scene) {
            console.warn("ProgressBarComponent: Already created or no entity/scene");
            return;
        }

        console.log("ProgressBarComponent: Creating progress bar for", this.entity.getName());

        try {
            // 创建一个小的平面来承载进度条
            this._mesh = MeshBuilder.CreatePlane(
                `progressBarMesh_${this.entity.getName()}_${Date.now()}`,
                { width: 2, height: 0.6 },
                this.entity.scene.scene
            );

            // 临时设置为半透明，便于调试定位
            this._mesh.isVisible = true;
            this._mesh.visibility = 0.7;
            this._mesh.parent = this.entity.root.root;
            this._mesh.position = this._offset.clone();

            console.log("ProgressBarComponent: Created mesh at position:", this._mesh.position);

            // 创建UI纹理
            this._texture = AdvancedDynamicTexture.CreateForMesh(this._mesh, 300, 100);

            // 创建进度条背景
            const background = new Rectangle("progressBarBg");
            background.widthInPixels = this._barWidth;
            background.heightInPixels = this._barHeight;
            background.cornerRadius = 5;
            background.color = "white";
            background.thickness = 2;
            background.background = "#333333";
            background.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            background.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

            // 创建进度条前景
            this._progressBar = new Rectangle("progressBarFg");
            this._progressBar.widthInPixels = this._barWidth - (this._barPadding * 2);
            this._progressBar.heightInPixels = this._barHeight - (this._barPadding * 2);
            this._progressBar.cornerRadius = 3;
            this._progressBar.thickness = 0;
            this._progressBar.background = this._normalColor;
            this._progressBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._progressBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this._progressBar.left = this._barPadding+(this._barWidth/2.0);

            // 创建进度文本
            this._progressText = new TextBlock("progressText");
            this._progressText.text = `${this._currentValue}/${this._maxValue}`;
            this._progressText.color = "white";
            this._progressText.fontSize = 14;
            this._progressText.fontWeight = "bold";
            this._progressText.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            this._progressText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this._progressText.top = -this._barHeight;

            this._texture.addControl(background);
            this._texture.addControl(this._progressBar);
            this._texture.addControl(this._progressText);

            this._isCreated = true;
            console.log("ProgressBarComponent: Progress bar created successfully");

        } catch (error) {
            console.error("ProgressBarComponent: Error creating progress bar:", error);
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
        this._barWidth = width;
        this._barHeight = height;
        
        // 如果已创建，需要重新创建
        if (this._isCreated) {
            this.recreateProgressBar();
        }
    }

    /**
     * 设置位置偏移
     * @param offset 偏移向量
     */
    public setOffset(offset: Vector3): void {
        this._offset = offset;
        if (this._mesh && this._isCreated) {
            this._mesh.position = this._offset.clone();
        }
    }

    private recreateProgressBar(): void {
        const currentValue = this._currentValue;
        const maxValue = this._maxValue;
        
        // 清理现有资源
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }
        
        this._isCreated = false;
        
        // 重新创建
        this.createProgressBar();
        
        // 恢复数值
        this._currentValue = currentValue;
        this._maxValue = maxValue;
        this.updateDisplay();
    }

    private updateDisplay(): void {
        if (!this._progressBar || !this._progressText || !this._isCreated) return;

        const percentage = this._currentValue / this._maxValue;
        
        // 更新进度条宽度
        this._progressBar.widthInPixels = (this._barWidth - (this._barPadding * 2)) * percentage;
        
        // 更新颜色
        if (percentage > this._warningThreshold) {
            this._progressBar.background = this._normalColor;
        } else if (percentage > this._dangerThreshold) {
            this._progressBar.background = this._warningColor;
        } else {
            this._progressBar.background = this._dangerColor;
        }
        
        // 更新文本
        this._progressText.text = `${Math.ceil(this._currentValue)}/${this._maxValue}`;
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
        if (this._mesh && this._isCreated) {
            this._mesh.position = this._offset.clone();
        }
    }

    public override dispose(): void {
        console.log("ProgressBarComponent: Disposing");
        
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
        
        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }
        
        this._progressBar = null;
        this._progressText = null;
        this._isCreated = false;
        
        super.dispose();
    }

    // 为了兼容性，保留血量相关的方法
    public setHealth(health: number): void {
        this.setValue(health);
    }

    public getHealth(): number {
        return this.getValue();
    }

    public takeDamage(damage: number): void {
        this.decreaseValue(damage);
    }

    public heal(amount: number): void {
        this.increaseValue(amount);
    }
}
