import { BaseComponent } from "../BaseComponent";
import { Vector3, Ray, type Scene, ShapeCastResult } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";
import { ColliderComponentV2 } from "../collider/ColliderComponentV2";
import { PhyMgrV2 } from "../../mgr/PhyMgrV2";

/**
 * 移动组件 / Movement Component
 * 处理实体的移动逻辑，包括行走、跳跃等 / Handles entity movement logic including walking, jumping etc.
 */
export class MovementComponent extends BaseComponent {
    /**
     * 当前移动速度 / Current movement speed
     */
    private _moveSpeed: number = 0.0;

    /**
     * 最大移动速度 / Maximum movement speed
     */
    private _maxMoveSpeed: number = 6.0;

    /**
     * 加速度 / Acceleration
     */
    private _acceleration: number = 2.0;

    /**
     * 减速度 / Deceleration
     */
    private _deceleration: number = 3.0;

    /**
     * 跳跃力度 / Jump force
     */
    private _jumpForce: number = 6.0;

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
     * 获取当前移动速度 / Get current movement speed
     */
    public get moveSpeed(): number {
        return this._moveSpeed;
    }

    /**
     * 设置当前移动速度 / Set current movement speed
     */
    public set moveSpeed(value: number) {
        this._moveSpeed = value;
    }

    /**
     * 获取最大移动速度 / Get maximum movement speed
     */
    public get maxMoveSpeed(): number {
        return this._maxMoveSpeed;
    }

    /**
     * 设置最大移动速度 / Set maximum movement speed
     */
    public set maxMoveSpeed(value: number) {
        this._maxMoveSpeed = value;
    }

    /**
     * 获取加速度 / Get acceleration
     */
    public get acceleration(): number {
        return this._acceleration;
    }

    /**
     * 设置加速度 / Set acceleration
     */
    public set acceleration(value: number) {
        this._acceleration = value;
    }

    /**
     * 获取减速度 / Get deceleration
     */
    public get deceleration(): number {
        return this._deceleration;
    }

    /**
     * 设置减速度 / Set deceleration
     */
    public set deceleration(value: number) {
        this._deceleration = value;
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
     * 获取移动方向 / Get movement direction
     */
    public getMoveDirection(): Vector3 {
        return this._moveDirection;
    }

    /**
     * 跳跃 / Jump  
     */
    public jump(): void {
        if (this._isGrounded && this._collider && this.entity?.physicsBody) {
            // const jumpVector = new Vector3(0, this._jumpForce, 0);
            // this.entity.physicsBody.applyImpulse(jumpVector, this.entity.getRoot().root.position);
            this.entity.physicsBody.setLinearVelocity(new Vector3(
                this.entity.physicsBody.getLinearVelocity().x,
                this._jumpForce,
                this.entity.physicsBody.getLinearVelocity().z
            ));
            this._isGrounded = false;
        }
    }

    /**
     * 停止移动 / Stop movement
     */
    public stopMove(): void {
        this._moveDirection = Vector3.Zero();
        this._moveSpeed = 0;
        if (this.entity?.physicsBody) {
            this.entity.physicsBody.setLinearVelocity(
                new Vector3(0, this.entity.physicsBody.getLinearVelocity().y, 0));
        }
    }

    /**
     * 更新组件 / Update component
     * @param deltaTime 时间增量 / Delta time
     */
    public override update(deltaTime: number): void {
        if (!this.entity?.physicsBody || !this._collider) return;

        // // 检测是否在地面上 / Check if on ground
        // const rayStart = this.entity.getRoot().root.position;
        // const rayDirection = new Vector3(0, -1, 0);
        // const ray = new Ray(rayStart, rayDirection, 1);
        
        // const raycastHit = this.entity.scene?.scene?.pickWithRay(ray);
        // this._isGrounded = raycastHit?.hit ?? false;

        const hitWorldResult = new ShapeCastResult();
        const shapeLocalResult = new ShapeCastResult();
        PhyMgrV2.instance.getPhysicsPlugin().shapeCast({shape: this.entity.physicsBody.shape!,
            rotation: this.entity.root.root.rotationQuaternion!,
            startPosition: this.entity.root.root.position,
            endPosition: new Vector3(this.entity.root.root.position.x, 
                this.entity.root.root.position.y-1, this.entity.root.root.position.z),
            shouldHitTriggers: false,
        }, shapeLocalResult, hitWorldResult);

        this._isGrounded = (this.entity.root.root.position.y - hitWorldResult.hitPoint.y) < 0.05; // 0.9 + little margin


        // 应用移动力 / Apply movement force
        if (!this._moveDirection.equals(Vector3.Zero())) {
            if(this._isGrounded){   
                // 加速 / Accelerate
                this._moveSpeed = Math.min(
                    this._moveSpeed + this._acceleration * deltaTime,
                    this._maxMoveSpeed
                );
            }else{
                // 减速 / Decelerate
                this._moveSpeed *= 0.99;
            }
        } 
        else {
            // 减速 / Decelerate
            this._moveSpeed = Math.max(
                this._moveSpeed - this._deceleration * deltaTime,
                0
            );
        }

        
        // 应用速度 / Apply velocity
        if (this._moveSpeed > 0) {
            const moveVector = this._moveDirection.scale(this._moveSpeed);
            this.entity.physicsBody.setLinearVelocity(new Vector3(
                moveVector.x,
                this.entity.physicsBody.getLinearVelocity().y,
                moveVector.z
            ));
        }

 

    }

    /**
     * 释放组件资源 / Dispose component resources
     */
    public override dispose(): void {
        this._collider = null;
        super.dispose();
    }
}
