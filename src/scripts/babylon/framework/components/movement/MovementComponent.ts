import { BaseComponent } from "../BaseComponent";
import { Vector3, Ray, type Scene } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";
import { ColliderComponentV2 } from "../collider/ColliderComponentV2";

/**
 * 移动组件 / Movement Component
 * 处理实体的移动逻辑，包括行走、跳跃等 / Handles entity movement logic including walking, jumping etc.
 */
export class MovementComponent extends BaseComponent {
    /**
     * 移动速度 / Movement speed
     */
    private _moveSpeed: number = 5.0;

    /**
     * 跳跃力度 / Jump force
     */
    private _jumpForce: number = 8.0;

    /**
     * 是否在地面上 / Whether on ground
     */
    private _isGrounded: boolean = false;

    /**
     * 移动方向 / Movement direction
     */
    private _moveDirection: Vector3 = Vector3.Zero();

    /**
     * 碰撞器组件 / Collider component
     */
    private _collider: ColliderComponentV2 | null = null;

    /**
     * 获取移动速度 / Get movement speed
     */
    public get moveSpeed(): number {
        return this._moveSpeed;
    }

    /**
     * 设置移动速度 / Set movement speed
     */
    public set moveSpeed(value: number) {
        this._moveSpeed = value;
    }

    /**
     * 获取跳跃力度 / Get jump force
     */
    public get jumpForce(): number {
        return this._jumpForce;
    }

    /**
     * 设置跳跃力度 / Set jump force
     */
    public set jumpForce(value: number) {
        this._jumpForce = value;
    }

    /**
     * 获取是否在地面上 / Get whether on ground
     */
    public get isGrounded(): boolean {
        return this._isGrounded;
    }

    /**
     * 构造函数 / Constructor
     * @param name 组件名称 / Component name
     */
    constructor(name: string = "MovementComponent") {
        super(name);
    }

    /**
     * 将组件附加到实体 / Attach component to entity
     * @param gameEntity 游戏实体 / Game entity
     */
    public override attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        
        // 获取胶囊体碰撞器组件 / Get capsule collider component
        const collider = this.entity?.getComponentByClass(ColliderComponentV2);
        this._collider = collider || null;
        if (!this._collider) {
            console.warn("MovementComponent requires ColliderComponentV2");
        }
    }

    /**
     * 设置移动方向 / Set movement direction
     * @param direction 移动方向 / Movement direction
     */
    public setMoveDirection(direction: Vector3): void {
        this._moveDirection = direction.normalize();
    }

    /**
     * 跳跃 / Jump
     */
    public jump(): void {
        if (this._isGrounded && this._collider && this.entity?.physicsBody) {
            const jumpVector = new Vector3(0, this._jumpForce, 0);
            this.entity.physicsBody.applyImpulse(jumpVector, this.entity.getRoot().root.position);
            this._isGrounded = false;
        }
    }

    public stopMove(): void {
        this._moveDirection = Vector3.Zero();
        if (this.entity?.physicsBody) {
            this.entity.physicsBody.setLinearVelocity(new Vector3(0, this.entity.physicsBody.getLinearVelocity().y, 0));
        }
    }

    /**
     * 更新组件 / Update component
     * @param deltaTime 时间增量 / Delta time
     */
    public override update(deltaTime: number): void {
        if (!this.entity?.physicsBody || !this._collider) return;

        // 应用移动力 / Apply movement force
        if (!this._moveDirection.equals(Vector3.Zero())) {
            const moveVector = this._moveDirection.scale(this._moveSpeed * deltaTime);
            this.entity.physicsBody.setLinearVelocity(new Vector3(
                moveVector.x,
                this.entity.physicsBody.getLinearVelocity().y, // 保持当前的Y轴速度 / Keep current Y-axis velocity
                moveVector.z
            ));
        }

        // 检测是否在地面上 / Check if on ground
        const rayStart = this.entity.getRoot().root.position;
        const rayDirection = new Vector3(0, -1, 0);
        const ray = new Ray(rayStart, rayDirection, 1.1);
        
        const raycastHit = this.entity.scene?.scene?.pickWithRay(ray);
        this._isGrounded = raycastHit?.hit ?? false;
    }

    /**
     * 释放组件资源 / Dispose component resources
     */
    public override dispose(): void {
        this._collider = null;
        super.dispose();
    }
}
