// Input type definitions
// 输入类型定义
export type InputActionCallback = (event: InputActionEvent) => void;
export type KeyBindingMap = Record<string, string>; // Maps keyboard keys to actions / 按键到Action的映射
export type GamepadAxisMap = Record<number, string>; // Maps gamepad axes to actions / 游戏手柄轴到Action的映射
export type GamepadButtonMap = Record<number, string>; // Maps gamepad buttons to actions / 游戏手柄按钮到Action的映射

// interface Vector2 {
//     x: number;
//     y: number;
// }

// Input event types enumeration
// 输入事件类型枚举
export enum InputEventType {
    KEYDOWN = "keydown",      // Keyboard key press / 键盘按下
    KEYUP = "keyup",         // Keyboard key release / 键盘释放
    MOUSE_DOWN = "mousedown", // Mouse button press / 鼠标按下
    MOUSE_UP = "mouseup",     // Mouse button release / 鼠标释放
    MOUSE_MOVE = "mousemove", // Mouse movement / 鼠标移动
}

// Interface for input action events
// 输入动作事件接口
export interface InputActionEvent {
    eventType: InputEventType; // Type of the input event / 输入事件类型
    value?: any;              // Optional value associated with the event / 事件相关的可选值
}

// Class representing an input action that can be triggered by various input events
// 表示可由各种输入事件触发的输入动作类
export class InputAction {
    private _callbacks: InputActionCallback[] = []; // Array of callback functions / 回调函数数组
    private _eventType: InputEventType = InputEventType.KEYDOWN; // Current event type / 当前事件类型
    private _value: any = null; // Current value / 当前值

    // Add a new callback function to the action
    // 为动作添加新的回调函数
    public addListener(callback: InputActionCallback): void {
        this._callbacks.push(callback);
    }

    // Remove a callback function from the action
    // 从动作中移除回调函数
    public removeListener(callback: InputActionCallback): void {
        this._callbacks = this._callbacks.filter(cb => cb !== callback);
    }

    // Trigger the action with a specific event
    // 使用特定事件触发动作
    public trigger(event: InputActionEvent): void {
        this._eventType = event.eventType;
        this._value = event.value || null;
        this._callbacks.forEach(cb => cb({ eventType: event.eventType, value: this._value }));
    }

    // Get the current event type
    // 获取当前事件类型
    public get eventType(): InputEventType {
        return this._eventType;
    }

    // Get the current value
    // 获取当前值
    public get value(): any {
        return this._value;
    }
}