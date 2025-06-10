import { Vector2, Scene} from "@babylonjs/core";
import { Ellipse, Container, Control, Vector2WithInfo } from "@babylonjs/gui";
import { UINode } from "./UINode";

export class UIJoystick extends UINode {
    private _container: Container | null = null;
    private _outerCircle: Ellipse | null = null;
    private _innerCircle: Ellipse | null = null;
    private _puck: Ellipse | null = null;
    private _isPressed: boolean = false;
    private _currentPosition: Vector2 = Vector2.Zero();
    private _normalizedPosition: Vector2 = Vector2.Zero();
    private _radius: number = 50;
    private _scene: Scene;
    private _puckRadius: number = 20;
    private _deadZone: number = 0.1;
    private _joystickColor: string = "LightGray";
    private _backgroundAlpha: number = 0.7;
    private _puckAlpha: number = 0.9;
    private _onPositionChanged: ((x: number, y: number) => void) | null = null;
    private _onPressed: (() => void) | null = null;
    private _onReleased: (() => void) | null = null;

    // Touch handling
    private _joystickPointerId: number | null = null;
    private _joystickButtonDownPos: Vector2 = Vector2.Zero();
    private _joystickDelta: Vector2 = Vector2.Zero();
    private _isDragging: boolean = false;

    constructor(name: string, radius: number = 50, scene: Scene) {
        super(name);
        this._radius = radius;
        this._scene = scene;
        this._puckRadius = Math.min(radius * 0.4, 20);
        this.createJoystick();
    }

    private createJoystick(): void {
        // 创建容器
        const containerSize = this._radius * 2 + this._puckRadius * 2 + 1;
        this._container = new Container(`${this._name}_container`);
        this._container.widthInPixels = containerSize;
        this._container.heightInPixels = containerSize;
        this._container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._container.isVisible = true; // 始终可见，但透明度可调
        //this._container.isPointerBlocker = true; // 阻止指针事件穿透
        this._control = this._container;

        // 创建外圆圈
        this._outerCircle = this.createCircle(
            this._radius,
            containerSize * 0.01, // 外圆圈厚度
            `${this._name}_outer`
        );

        // 创建内圆圈
        this._innerCircle = this.createCircle(
            this._puckRadius,
            containerSize * 0.04, // 内圆圈厚度
            `${this._name}_inner`
        );

        // 创建摇杆
        this._puck = this.createCircle(
            this._puckRadius,
            containerSize * 0.01, // 摇杆厚度
            `${this._name}_puck`
        );

        this._container.addControl(this._outerCircle);
        this._container.addControl(this._innerCircle);
        this._container.addControl(this._puck);

        this.setupEventHandlers();
        this.applyProperties();
    }

    private createCircle(radius: number, thickness: number, name: string): Ellipse {
        const circle = new Ellipse(name);
        circle.widthInPixels = radius * 2;
        circle.heightInPixels = radius * 2;
        circle.thickness = thickness;
        circle.color = this._joystickColor;
        circle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        circle.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        return circle;
    }

    private setupEventHandlers(): void {
        // 使用容器的指针事件处理 POINTERDOWN，确保只在摇杆区域内触发
        if (this._container) {
            this._container.onPointerDownObservable.add((eventData) => {
                // 如果已经有一个触摸点在控制摇杆，忽略新的触摸
                if (this._joystickPointerId !== null) {
                    console.log("UIJoystick: 忽略新的触摸，已有触摸点", this._joystickPointerId);
                    return;
                }

                // 获取画布坐标
                const canvas = this._scene.getEngine().getRenderingCanvas();
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const canvasX = eventData.x - rect.left;
                    const canvasY = eventData.y - rect.top;
                    const point = new Vector2(canvasX, canvasY);

                    // 使用简单的方法获取pointerId - 在单点触控时通常为0
                    this._joystickPointerId = 0; // 简化处理
                    this._isDragging = true;
                    this._joystickButtonDownPos = point.clone();
                    this._isPressed = true;
                    console.log("UIJoystick: 开始拖拽，pointerId:", 0);
                    this.onTouchJoystick(point);
                    if (this._onPressed) this._onPressed();
                }
            });
        }

        // 使用场景的指针事件处理 POINTERUP 和 POINTERMOVE
        this._scene.onPointerObservable.add((pointerInfo) => {
            const event = pointerInfo.event as PointerEvent;
            const canvas = this._scene.getEngine().getRenderingCanvas();

            if (!canvas || !this._container) return;

            const rect = canvas.getBoundingClientRect();
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            const point = new Vector2(canvasX, canvasY);

            if (pointerInfo.type === 2 ) { // POINTERUP
                // 如果摇杆正在被拖拽，则释放它
                if (this._isDragging) {
                    this._isDragging = false;
                    this._joystickPointerId = null;
                    this._joystickDelta.scaleInPlace(0);
                    this._isPressed = false;
                    console.log("UIJoystick: 释放摇杆");
                    this.resetKnobPosition();
                    if (this._onReleased) this._onReleased();
                }
            } else if (pointerInfo.type === 4 && this._isDragging) { // POINTERMOVE
                // 如果摇杆正在被拖拽，更新位置
                this.onTouchJoystick(point);
            }
        });
    }

    private onTouchJoystick(touchPoint: Vector2): void {
        if (!this._puck) return;

        const joystickVector = touchPoint.subtract(this._joystickButtonDownPos);
        if (joystickVector.length() > this._radius) {
            joystickVector.scaleInPlace(this._radius / joystickVector.length());
        }

        this._puck.left = joystickVector.x;
        this._puck.top = joystickVector.y;

        // 计算归一化位置
        this._joystickDelta = joystickVector.scale(1 / this._radius);
        this._normalizedPosition.copyFrom(this._joystickDelta);

        // 应用死区
        const magnitude = this._normalizedPosition.length();
        if (magnitude < this._deadZone) {
            this._normalizedPosition.set(0, 0);
        } else {
            const adjustedMagnitude = (magnitude - this._deadZone) / (1 - this._deadZone);
            this._normalizedPosition.normalize();
            this._normalizedPosition.scaleInPlace(Math.min(adjustedMagnitude, 1));
        }

        if (this._onPositionChanged) {
            this._onPositionChanged(this._normalizedPosition.x, this._normalizedPosition.y);
        }
    }

    private resetKnobPosition(): void {
        if (!this._puck) return;

        this._currentPosition.set(0, 0);
        this._normalizedPosition.set(0, 0);
        this._puck.left = 0;
        this._puck.top = 0;

        if (this._onPositionChanged) {
            this._onPositionChanged(0, 0);
        }
    }

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

    public getNormalizedPosition(): Vector2 {
        return this._normalizedPosition.clone();
    }

    public getX(): number {
        return this._normalizedPosition.x;
    }

    public getY(): number {
        return this._normalizedPosition.y;
    }

    public isPressed(): boolean {
        return this._isPressed;
    }

    public getMagnitude(): number {
        return this._normalizedPosition.length();
    }

    public getAngle(): number {
        return Math.atan2(this._normalizedPosition.y, this._normalizedPosition.x);
    }

    public getAngleDegrees(): number {
        return this.getAngle() * (180 / Math.PI);
    }

    public setRadius(radius: number): void {
        this._radius = radius;
        this._puckRadius = Math.min(radius * 0.4, 20);

        if (this._container && this._outerCircle && this._puck) {
            const containerSize = radius * 2 + this._puckRadius * 2 + 1;
            this._container.widthInPixels = containerSize;
            this._container.heightInPixels = containerSize;
            this._outerCircle.widthInPixels = radius * 2;
            this._outerCircle.heightInPixels = radius * 2;
        }
    }

    public setPuckRadius(radius: number): void {
        this._puckRadius = radius;
        if (this._puck && this._innerCircle) {
            this._puck.widthInPixels = radius * 2;
            this._puck.heightInPixels = radius * 2;
            this._innerCircle.widthInPixels = radius * 2;
            this._innerCircle.heightInPixels = radius * 2;
        }
    }

    public setDeadZone(deadZone: number): void {
        this._deadZone = Math.max(0, Math.min(1, deadZone));
    }

    public setJoystickColor(color: string): void {
        this._joystickColor = color;
        if (this._outerCircle) this._outerCircle.color = color;
        if (this._innerCircle) this._innerCircle.color = color;
        if (this._puck) this._puck.color = color;
    }

    // 兼容性方法
    public setBackgroundStyle(backgroundColor: string, borderColor?: string, borderThickness?: number): void {
        this.setJoystickColor(borderColor || backgroundColor);
    }

    public setKnobStyle(knobColor: string, borderColor?: string, borderThickness?: number): void {
        this.setJoystickColor(borderColor || knobColor);
    }

    public setKnobRadius(radius: number): void {
        this.setPuckRadius(radius);
    }

    public setAlpha(backgroundAlpha: number, puckAlpha?: number): void {
        this._backgroundAlpha = Math.max(0, Math.min(1, backgroundAlpha));
        if (puckAlpha !== undefined) {
            this._puckAlpha = Math.max(0, Math.min(1, puckAlpha));
        }

        if (this._outerCircle) this._outerCircle.alpha = this._backgroundAlpha;
        if (this._innerCircle) this._innerCircle.alpha = this._backgroundAlpha;
        if (this._puck) this._puck.alpha = this._puckAlpha;
    }

    public setOnPositionChanged(callback: (x: number, y: number) => void): void {
        this._onPositionChanged = callback;
    }

    public setOnPressed(callback: () => void): void {
        this._onPressed = callback;
    }

    public setOnReleased(callback: () => void): void {
        this._onReleased = callback;
    }

    public isInDirection(direction: number, tolerance: number = 45): boolean {
        if (this.getMagnitude() < this._deadZone) return false;

        const currentAngle = this.getAngleDegrees();
        const diff = Math.abs(currentAngle - direction);
        return diff <= tolerance || diff >= (360 - tolerance);
    }

    public isUp(): boolean {
        return this.isInDirection(-90, 45);
    }

    public isDown(): boolean {
        return this.isInDirection(90, 45);
    }

    public isLeft(): boolean {
        return this.isInDirection(180, 45);
    }

    public isRight(): boolean {
        return this.isInDirection(0, 45);
    }

    public getPrimaryDirection(): string {
        if (this.getMagnitude() < this._deadZone) return "center";

        const angle = this.getAngleDegrees();

        if (angle >= -45 && angle < 45) return "right";
        if (angle >= 45 && angle < 135) return "down";
        if (angle >= 135 || angle < -135) return "left";
        if (angle >= -135 && angle < -45) return "up";

        return "center";
    }

    // 添加调试方法
    public enableDebug(): void {
        console.log("UIJoystick: 调试模式已启用");
        console.log("UIJoystick: 容器信息", {
            position: this._position,
            radius: this._radius,
            puckRadius: this._puckRadius,
            containerSize: this._container?.widthInPixels
        });
    }

    public dispose(): void {
        this._onPositionChanged = null;
        this._onPressed = null;
        this._onReleased = null;

        // 重置触摸状态
        this._joystickPointerId = null;
        this._isDragging = false;
        this._isPressed = false;

        if (this._container) {
            this._container.dispose();
            this._container = null;
        }

        this._outerCircle = null;
        this._innerCircle = null;
        this._puck = null;
        this._control = undefined;
    }
}
