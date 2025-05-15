import { KeyboardEventTypes, PointerEventTypes, Scene, Vector2 } from "@babylonjs/core";
import { InputAction, type GamepadAxisMap, type GamepadButtonMap, type KeyBindingMap, InputEventType } from "./InputAction";
import { Singleton } from "../common/Singleton";
import type { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import { PointerInput } from "@babylonjs/core/DeviceInput/InputDevices/deviceEnums";

/**
 * Input System - 输入系统
 * A comprehensive input management system that handles keyboard, mouse, and gamepad inputs
 * 一个综合的输入管理系统，处理键盘、鼠标和游戏手柄输入
 * 
 * Features / 功能:
 * - Keyboard input handling / 键盘输入处理
 * - Mouse position and movement tracking / 鼠标位置和移动追踪
 * - Gamepad support / 游戏手柄支持
 * - Action mapping and remapping / 动作映射和重映射
 * - Key combination detection / 按键组合检测
 */
export class InputSystem extends Singleton<InputSystem>() {
    // Scene reference for input handling / 用于输入处理的场景引用
    private scene: Scene | null = null;
    
    // Storage for all registered input actions / 存储所有注册的输入动作
    private actions: Record<string, InputAction> = {};
    
    // Mapping of keyboard keys to action names / 键盘按键到动作名称的映射
    private keyBindings: KeyBindingMap = {};
    
    // Mapping of gamepad buttons to action names / 游戏手柄按钮到动作名称的映射
    private gamepadButtonBindings: GamepadButtonMap = {};
    
    // Mapping of gamepad axes to action names / 游戏手柄摇杆到动作名称的映射
    private gamepadAxisBindings: GamepadAxisMap = {};
    
    // Set of currently pressed keys / 当前按下的按键集合
    private activeKeys: Set<string> = new Set();
    
    // Current mouse position in screen coordinates / 当前鼠标在屏幕坐标中的位置
    private _mousePosition: Vector2 = Vector2.Zero();
    
    // Mouse movement delta since last frame / 自上一帧以来的鼠标移动增量
    private _mouseDelta: Vector2 = Vector2.Zero();
    // Mouse movement delta since last frame / 自上一帧以来的鼠标移动增量
    private _mouseActive: number = 0;
    // Mouse position from the previous frame / 上一帧的鼠标位置
    private lastMousePosition: Vector2 = Vector2.Zero();

    // 存储多指触控状态 / Store multi-touch states
    private _touchPoints: Map<number, { position: Vector2; delta: Vector2; lastPosition: Vector2}> = new Map();

    /**
     * Initialize the input system with a Babylon.js scene
     * 使用 Babylon.js 场景初始化输入系统
     * @param scene - The Babylon.js scene to attach input handlers to / 要附加输入处理程序的 Babylon.js 场景
     */
    public init(scene: Scene) {
        this.scene = scene;
        this.setupInputListeners();
    }

    /**
     * Register a new input action with optional key, gamepad button, or axis bindings
     * 注册新的输入动作，可选的键盘按键、游戏手柄按钮或摇杆绑定
     * 
     * @param actionName - Name of the action to register / 要注册的动作名称
     * @param options - Optional binding configurations / 可选的绑定配置
     * @param options.key - Keyboard key to bind / 要绑定的键盘按键
     * @param options.gamepadButton - Gamepad button index to bind / 要绑定的游戏手柄按钮索引
     * @param options.gamepadAxis - Gamepad axis index to bind / 要绑定的游戏手柄摇杆索引
     * @returns The created InputAction instance / 返回创建的输入动作实例
     */
    public registerAction(actionName: string, options?: {
        key?: string | string[];
        gamepadButton?: number;
        gamepadAxis?: number;
    }): InputAction {
        const action = new InputAction();
        this.actions[actionName] = action;

        if (options?.key) {
            if (Array.isArray(options.key)) {
                options.key.forEach(key => {
                    this.keyBindings[key] = actionName;
                });
            } else {
                this.keyBindings[options.key] = actionName;
            }
        }

        if (options?.gamepadButton !== undefined) {
            this.gamepadButtonBindings[options.gamepadButton] = actionName;
        }

        if (options?.gamepadAxis !== undefined) {
            this.gamepadAxisBindings[options.gamepadAxis] = actionName;
        }

        return action;
    }

    /**
     * Remap an existing action to a new keyboard key
     * 将现有动作重新映射到新的键盘按键
     * 
     * @param actionName - Name of the action to remap / 要重映射的动作名称
     * @param newKey - New keyboard key to bind / 要绑定的新键盘按键
     */
    public remapAction(actionName: string, newKey: string): void {
        // 移除旧的键盘绑定 / Remove old keyboard binding
        for (const key in this.keyBindings) {
            if (this.keyBindings[key] === actionName) {
                delete this.keyBindings[key];
            }
        }

        // 添加新绑定 / Add new binding
        if (newKey) {
            this.keyBindings[newKey] = actionName;
        }
    }

    /**
     * Get the current mouse position in screen coordinates
     * 获取当前鼠标在屏幕坐标中的位置
     * @returns A Vector2 containing the mouse position / 包含鼠标位置的 Vector2
     */
    public get mousePosition(): Vector2 {
        return this._mousePosition.clone();
    }

    /**
     * Get the mouse movement delta since the last frame
     * 获取自上一帧以来的鼠标移动增量
     * @returns A Vector2 containing the mouse movement delta / 包含鼠标移动增量的 Vector2
     */
    public get mouseDelta(): Vector2 {
        return this._mouseDelta.clone();
    }

    /**
     * Get the touch points
     * 获取触控点
     * @returns A Map containing touch points / 包含触控点的 Map
     */
    public get touchPoints(): Map<number, { position: Vector2; delta: Vector2; lastPosition: Vector2 }> {
        return this._touchPoints;
    }

    /**
     * Set up input event listeners for keyboard, mouse, and gamepad
     * 设置键盘、鼠标和游戏手柄的输入事件监听器
     * 
     * This method initializes all necessary event observers:
     * 此方法初始化所有必要的事件观察器：
     * - Keyboard events for key press/release / 按键按下/释放的键盘事件
     * - Mouse events for position and movement / 鼠标位置和移动的鼠标事件
     * - Gamepad state updates / 游戏手柄状态更新
     */
    private setupInputListeners(): void {  
        if (!this.scene) return;
        // 键盘输入监听 / Keyboard input listener
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key;
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this.activeKeys.add(key);
                this.triggerKeyAction(key, kbInfo.type);
            } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                this.activeKeys.delete(key);
                this.triggerKeyAction(key, kbInfo.type);
            }
            
            this.checkKeyCombinations();
        });

        // 鼠标输入监听 / Mouse input listener
        this.scene.onPointerObservable.add((pointerInfo) => {
            const event = pointerInfo.event as IPointerEvent;
            const { clientX: x, clientY: y, inputIndex, pointerId=0 } = event;
            const type = pointerInfo.type;

            // 更新全局鼠标状态 / Update global mouse state
            if (type === PointerEventTypes.POINTERMOVE || type === PointerEventTypes.POINTERDOWN) {
                this._mouseDelta.x = x - this.lastMousePosition.x;
                this._mouseDelta.y = y - this.lastMousePosition.y;
                this._mousePosition.x = x;
                this._mousePosition.y = y;
                this.lastMousePosition = this._mousePosition.clone();
            } else if (type === PointerEventTypes.POINTERUP) {
                this._mousePosition.x = x;
                this._mousePosition.y = y;
                this.lastMousePosition = this._mousePosition.clone();
                this._mouseDelta = Vector2.Zero();
            }

            switch (type) {
                case PointerEventTypes.POINTERDOWN:
                    // 添加触控点 / Add touch point
                    this._touchPoints.set(pointerId, {
                        position: new Vector2(x, y),
                        delta: Vector2.Zero(),
                        lastPosition: new Vector2(x, y)
                    });
                    this.triggerTouchAction(inputIndex, type, pointerId, new Vector2(x, y));

                    break;

                case PointerEventTypes.POINTERMOVE:
                    // 多指触控处理 / Multi-touch handling
                    if (this._touchPoints.has(pointerId)) {
                        const tp = this._touchPoints.get(pointerId)!;
                        tp.delta.x = x - tp.lastPosition.x;
                        tp.delta.y = y - tp.lastPosition.y;
                        tp.position.x = x;
                        tp.position.y = y;
                        tp.lastPosition = tp.position.clone();
                    }
                    this.triggerTouchAction(inputIndex, type, pointerId, new Vector2(x, y));

                    break;

                case PointerEventTypes.POINTERUP:
                    // 移除触控点 / Remove touch point
                    this.triggerTouchAction(inputIndex, type, pointerId, new Vector2(x, y));
                    this._touchPoints.delete(pointerId);
                    //if(this._mouseActive === pointerId) this._mouseActive = 0;
                    break;

                case PointerEventTypes.POINTERWHEEL:
                    // 鼠标滚轮事件 / Mouse wheel event
                    this.triggerTouchAction(inputIndex, type, pointerId, new Vector2(x, y));
                    break;
                default:
                    break;
            }
        });
                // 鼠标输入监听 / Mouse input listener

        // 游戏手柄监听 / Gamepad listener
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateGamepads();
        });
    }

    /**
     * Trigger an action based on key press state
     * 根据按键状态触发动作
     * 
     * @param key - The keyboard key that was pressed/released / 被按下/释放的键盘按键
     * @param keyType - The type of keyboard event (KEYDOWN/KEYUP) / 键盘事件类型（按下/释放）
     */
    private triggerKeyAction(key: string, keyType: KeyboardEventTypes): void {
        const actionName = this.keyBindings[key];
        if (actionName && this.actions[actionName]) {
            this.actions[actionName].trigger({ eventType: keyType === KeyboardEventTypes.KEYDOWN ? InputEventType.KEYDOWN : InputEventType.KEYUP });
        }
    }
    private triggerTouchAction(buttonid: number, touchType: number, pointerId: number, position: Vector2): void {
        const pointerInputMap: { [buttonid: number]: string } = {
            [PointerInput.LeftClick]: "MOUSE_LEFT",
            [PointerInput.MiddleClick]: "MOUSE_MIDDLE", 
            [PointerInput.RightClick]: "MOUSE_RIGHT",
            [PointerInput.BrowserBack]: "BROWSER_BACK",
            [PointerInput.BrowserForward]: "BROWSER_FORWARD",
            [PointerInput.Move]: "MOUSE_MOVE",
            [PointerInput.MouseWheelX]: "MOUSE_WHEEL_X",
            [PointerInput.MouseWheelY]: "MOUSE_WHEEL_Y",
        };
        const pointerEventTypeMap: { [touchType: number]: InputEventType } = {
            [PointerEventTypes.POINTERDOWN]: InputEventType.MOUSE_DOWN,
            [PointerEventTypes.POINTERUP]: InputEventType.MOUSE_UP,
            [PointerEventTypes.POINTERMOVE]: InputEventType.MOUSE_MOVE,
            [PointerEventTypes.POINTERWHEEL]: InputEventType.MOUSE_WHEEL,
        };
        const key = pointerInputMap[buttonid];
        const actionName = this.keyBindings[key];
        if (actionName && this.actions[actionName]) {
            this.actions[actionName].trigger({ eventType: (pointerEventTypeMap[touchType]), value: position, id: pointerId });
        }
    }
    /**
     * Check for key combinations (e.g., Shift + W for running)
     * 检查按键组合（例如：Shift + W 用于奔跑）
     * 
     * This method handles complex input combinations that require multiple keys
     * 此方法处理需要多个按键的复杂输入组合
     */
    private checkKeyCombinations(): void {
        // 示例组合键: Shift + W = 奔跑 / Example combination: Shift + W = Run
        if (this.activeKeys.has("Shift") && this.activeKeys.has("w")) {
            this.actions["Run"]?.trigger({ eventType: InputEventType.KEYDOWN });
        } else {
            this.actions["Run"]?.trigger({ eventType: InputEventType.KEYUP });
        }
    }

    /**
     * Update gamepad input state
     * 更新游戏手柄输入状态
     * 
     * This method processes:
     * 此方法处理：
     * - Gamepad button states / 游戏手柄按钮状态
     * - Gamepad axis values with deadzone handling / 带死区处理的游戏手柄摇杆值
     */
    private updateGamepads(): void {
        const gamepads = navigator.getGamepads();
        
        for (const gamepad of gamepads) {
            if (!gamepad) continue;
            
            // 处理游戏手柄按钮 / Handle gamepad buttons
            for (let i = 0; i < gamepad.buttons.length; i++) {
                const actionName = this.gamepadButtonBindings[i];
                if (actionName && this.actions[actionName]) {
                    const isPressed = gamepad.buttons[i].pressed;
                    this.actions[actionName].trigger({ eventType: isPressed ? InputEventType.MOUSE_DOWN : InputEventType.MOUSE_UP });
                }
            }
            
            // 处理游戏手柄摇杆 / Handle gamepad axes
            for (let i = 0; i < gamepad.axes.length; i++) {
                const actionName = this.gamepadAxisBindings[i];
                if (actionName && this.actions[actionName]) {
                    const value = gamepad.axes[i];
                    // 添加死区处理 / Add deadzone handling
                    if (Math.abs(value) > 0.1) {
                        this.actions[actionName].trigger({ 
                            eventType: InputEventType.MOUSE_DOWN,
                            value: value 
                        });
                    } else {
                        this.actions[actionName].trigger({ 
                            eventType: InputEventType.MOUSE_UP,
                            value: 0 
                        });
                    }
                }
            }
        }
    }

    /**
     * Clean up and dispose of the input system
     * 清理并释放输入系统
     * 
     * Resets all input states and clears stored data
     * 重置所有输入状态并清除存储的数据
     */
    public dispose(): void {
        this.activeKeys.clear();
        this._mouseDelta = Vector2.Zero();
        this._mousePosition = Vector2.Zero();
        this.lastMousePosition = Vector2.Zero();
        this._touchPoints.clear();
    }

    /**
     * 获取指定触控点 / Get specific touch point
     * @param pointerId 触控点ID / Touch point ID
     * @returns 触控点数据，如果不存在则返回null / Touch point data, or null if not exists
     */
    public getTouchPoint(pointerId: number): { position: Vector2; delta: Vector2; lastPosition: Vector2 } | null {
        return this._touchPoints.get(pointerId) || null;
    }

    /**
     * 获取触控点数量 / Get number of touch points
     * @returns 当前触控点数量 / Current number of touch points
     */
    public getTouchPointCount(): number {
        return this._touchPoints.size;
    }

    /**
     * 检查是否为多点触控 / Check if multi-touch is active
     * @returns 是否有多个触控点 / Whether there are multiple touch points
     */
    public isMultiTouch(): boolean {
        return this._touchPoints.size > 1;
    }
}