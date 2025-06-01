import { InputComponent } from "./InputComponent";
import { PlayerEntity } from "../../entity/PlayerEntity";
import type { MovementComponent } from "../movement/MovementComponent";
import { type InputActionEvent, InputEventType } from "../../input/InputAction";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { SkeletonAnimationComponent } from "../animation/SkeletonAnimationComponent";
import { EventEmitter } from "../../common/EventEmitter";
import { PointerMgr } from "../../mgr/PointerMgr";
import type { Vector2 } from "babylonjs";
import { InputSystem } from "../../input/InputSystem";
/**
 * Player Input Component - 玩家输入组件
 * Handles player input and movement
 * 处理玩家输入和移动
 */
export class PlayerInputComponent extends InputComponent {
    /**
     * The game entity that the player input component is attached to
     * 玩家输入组件所附加的游戏实体
     */
    private _gameEntity: PlayerEntity | null = null;

    /**
     * The movement component of the player entity
     * 玩家实体的运动组件
     */
    private _movementComponent: MovementComponent | null = null;

    /**
     * The forward input action
     * 向前移动输入动作
     */
    private isForward: boolean = false;

    /**
     * The backward input action
     * 向后移动输入动作
     */
    private isBackward: boolean = false;

    /**
     * The left input action
     * 向左移动输入动作
     */
    private isLeft: boolean = false;

    /**
     * The right input action
     * 向右移动输入动作
     */
    private isRight: boolean = false;

    /**
     * The jump input action
     * 跳跃输入动作
     */
    private isJump: boolean = false;

    /**
     * The input direction
     * 输入方向
     */
    public inputDirection: Vector3 = Vector3.Zero();

    /**
     * Constructor
     * @param name Component name / 组件名称
     */
    constructor(name: string = "PlayerInputComponent") {
        super(name);
    }

    /**
     * Attach the player input component to a game entity
     * 将玩家输入组件附加到游戏实体
     * @param gameEntity The game entity to attach to / 附加到的游戏实体
     */
    public attachTo(gameEntity: PlayerEntity): void {
        this._gameEntity = gameEntity;
        this._movementComponent = gameEntity.getComponent(
            "MovementComponent",
        ) as MovementComponent;
        this.bindInput();
    }

    /**
     * Update the player input component
     * 更新玩家输入组件
     * @param deltaTime The time since the last frame / 自上一帧以来的时间
     */
    public override update(deltaTime: number): void {
        super.update(deltaTime);
        this.calculateMovement();
    }

    /**
     * Dispose the player input component
     * 释放玩家输入组件
     */
    public override dispose(): void {
        super.dispose();
        this.unbindInput();
    }

    /**
     * Bind the input actions to the player input component
     * 将输入动作绑定到玩家输入组件
     */
    bindInput(): void {
        this.registerAction("MoveForward", { key: "w" }, (options) =>
            this.moveForward(options),
        );
        this.registerAction("MoveBackward", { key: "s" }, (options) =>
            this.moveBackward(options),
        );
        this.registerAction("MoveLeft", { key: "a" }, (options) =>
            this.moveLeft(options),
        );
        this.registerAction("MoveRight", { key: "d" }, (options) =>
            this.moveRight(options),
        );
        this.registerAction("Jump", { key: " " }, (options) =>
            this.jump(options),
        );
        this.registerAction("MouseLeft", { key: "MOUSE_LEFT" }, (options) =>
            this.mouseLeft(options),
        );
        this.registerAction("MouseRight", { key: "MOUSE_RIGHT" }, (options) =>
            this.mouseRight(options),
        );
        this.registerAction("MouseMove", { key: "MOUSE_MOVE" }, () =>
            this.mouseMove(),
        );
        this.registerAction("MouseWheel", { key: "MOUSE_WHEEL_Y" }, () =>
            this.onMouseWheel(),
        );
    }

    /**
     * Unbind the input actions from the player input component
     * 从玩家输入组件解绑输入动作
     */
    unbindInput(): void {
        this.unregisterAction("MoveForward");
        this.unregisterAction("MoveBackward");
        this.unregisterAction("MoveLeft");
        this.unregisterAction("MoveRight");
        this.unregisterAction("Jump");
        this.unregisterAction("MouseLeft");
        this.unregisterAction("MouseRight");
        this.unregisterAction("MouseMove");
        this.unregisterAction("MouseWheel");
    }

    /**
     * Move forward
     * 向前移动
     */
    protected moveForward(options: InputActionEvent): void {
        if (options.eventType === InputEventType.KEYDOWN) {
            this.isForward = true;
        } else if (options.eventType === InputEventType.KEYUP) {
            this.isForward = false;
        }
    }

    /**
     * Move backward
     * 向后移动
     */
    protected moveBackward(options: InputActionEvent): void {
        if (options.eventType === InputEventType.KEYDOWN) {
            this.isBackward = true;
        } else if (options.eventType === InputEventType.KEYUP) {
            this.isBackward = false;
        }
    }

    /**
     * Move left
     * 向左移动
     */
    protected moveLeft(options: InputActionEvent): void {
        if (options.eventType === InputEventType.KEYDOWN) {
            this.isLeft = true;
        } else if (options.eventType === InputEventType.KEYUP) {
            this.isLeft = false;
        }
    }

    /**
     * Move right
     * 向右移动
     */
    protected moveRight(options: InputActionEvent): void {
        if (options.eventType === InputEventType.KEYDOWN) {
            this.isRight = true;
        } else if (options.eventType === InputEventType.KEYUP) {
            this.isRight = false;
        }
    }

    /**
     * Jump
     * 跳跃
     */
    protected jump(options: InputActionEvent): void {
        if (options.eventType === InputEventType.KEYDOWN) {
            this.isJump = true;
            this._movementComponent?.jump();
        } else if (options.eventType === InputEventType.KEYUP) {
            this.isJump = false;
        }
    }

    /**
     * Calculate the movement direction
     * 计算移动方向
     */
    protected calculateMovement(): void {
        this.inputDirection = Vector3.Zero();

        if (this.isForward) {
            this.inputDirection.z = 1;
        } else if (this.isBackward) {
            this.inputDirection.z = -1;
        }
        if (this.isLeft) {
            this.inputDirection.x -= 1;
        } else if (this.isRight) {
            this.inputDirection.x += 1;
        }
        // this._movementComponent?.setMoveDirection(direction.normalize());
    }

    protected mouseLeft(options: InputActionEvent): void {
        if (PointerMgr.instance.isPointerLocked) {
            EventEmitter.instance.emit("MouseLeft", options.eventType);
        } else if (options.eventType === InputEventType.MOUSE_UP) {
            PointerMgr.instance.requestPointerLock();
        }
    }

    protected mouseRight(options: InputActionEvent): void {
        EventEmitter.instance.emit("MouseRight", options.eventType);
    }

    protected mouseMove(): void {
        if (PointerMgr.instance.isPointerLocked) {
            EventEmitter.instance.emit("MouseMove", {
                delta: InputSystem.instance.mouseDelta,
            });
        }
    }

    protected onMouseWheel(): void {
        EventEmitter.instance.emit("MouseWheel", {
            delta: InputSystem.instance.wheelDelta,
        });
    }
}
