import { BaseComponent } from "../BaseComponent";
import { InputSystem } from "../../input/InputSystem";
import type { InputAction, InputActionEvent } from "../../input/InputAction";

/**
 * Input Component Base Class - 输入组件基类
 * Handles input processing and management for game entities
 * 处理游戏实体的输入处理和管理
 */
export class InputComponent extends BaseComponent {
    /**
     * Map of registered actions and their corresponding InputAction instances
     * 已注册动作及其对应的InputAction实例的映射
     */
    protected registeredActions: Map<string, InputAction> = new Map();

    /**
     * Constructor
     * @param name Component name / 组件名称
     */
    constructor(name: string = "InputComponent") {
        super(name);
    }

    /**
     * Register an input action with specified bindings
     * 注册具有指定绑定的输入动作
     * 
     * @param actionName Name of the action / 动作名称
     * @param options Binding options / 绑定选项
     * @param callback Callback function to handle the input / 处理输入的回调函数
     */
    protected registerAction(
        actionName: string, 
        options?: {
            key?: string | string[];
            gamepadButton?: number;
            gamepadAxis?: number;
        },
        callback?: (event: InputActionEvent) => void
    ): void {
        const action = InputSystem.instance.registerAction(actionName, options);
        if (callback) {
            action.addListener(callback);
        }
        this.registeredActions.set(actionName, action);
    }

    /**
     * Unregister an input action
     * 注销输入动作
     * 
     * @param actionName Name of the action to unregister / 要注销的动作名称
     */
    protected unregisterAction(actionName: string): void {
        const action = this.registeredActions.get(actionName);
        if (action) {
            // Remove all listeners for this action
            action.removeListener(() => {});
            this.registeredActions.delete(actionName);
        }
    }

    /**
     * Remap an existing action to a new key
     * 将现有动作重新映射到新键
     * 
     * @param actionName Name of the action to remap / 要重新映射的动作名称
     * @param newKey New key to bind / 要绑定的新键
     */
    protected remapAction(actionName: string, newKey: string): void {
        if (this.registeredActions.has(actionName)) {
            InputSystem.instance.remapAction(actionName, newKey);
        }
    }

    /**
     * Override dispose to clean up registered actions
     * 重写dispose以清理已注册的动作
     */
    public override dispose(): void {
        // Unregister all actions
        for (const actionName of this.registeredActions.keys()) {
            this.unregisterAction(actionName);
        }
        this.registeredActions.clear();
        super.dispose();
    }
}
