import type { IBlendTree1D } from "../components/animation/BlendTreeState";
import {
    Color3,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeSphere,
    StandardMaterial,
    Vector2,
    Vector3,
} from "@babylonjs/core";
import type {
    BlendTreeState,
    IBlendTree2D,
} from "../components/animation/BlendTreeState";
import type { PlayerEntity } from "../entity/PlayerEntity";
import type { IGameEntity } from "../interface/IGameEntity";
import { BaseController } from "./BaseController";
import { AnimationState } from "../components/animation/AnimationState";
import { EventEmitter } from "../common/EventEmitter";
import { InputEventType } from "../input/InputAction";
import type { FollowCameraComponent } from "../components/camera/FollowCameraComponent";
/**
 * 玩家控制器 / Player controller
 */
export class PlayerController extends BaseController {
    private playerEntity: PlayerEntity;
    private motionState: BlendTreeState | undefined;
    private jumpUpState: AnimationState | undefined;
    private jumpDownState: AnimationState | undefined;
    private jumpFloatingState: AnimationState | undefined;
    private attack1State: AnimationState | undefined;
    private magicAtkState: AnimationState | undefined;

    /**
     * 旋转速度 / Rotation speed
     */
    public rotationSpeed: number = 10;

    constructor(entity: IGameEntity) {
        super(entity);
        this.playerEntity = entity as PlayerEntity;
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
        this.updateMesh(deltaTime);
        this.updateAnimator();
        this.updateMovement();
    }

    public dispose(): void {
        super.dispose();
        this.unbindEvent();
    }

    /**
     * 初始化 / Initialize
     */
    public initialize(): void {
        this.initAnimator();
        this.bindEvent();
    }

    /**
     * 初始化动画器 / Initialize animator
     */
    public initAnimator(): void {
        this.playerEntity.animatorComponent?.initStateMachine({
            initialState: "motion",
            transitions: {
                motion: {
                    jumpUp: [
                        {
                            check: () => {
                                const linearVelocity =
                                    this.playerEntity.movementComponent?.getLinearVelocity();
                                if (linearVelocity) {
                                    return linearVelocity._y > 3;
                                }
                                return false;
                            },
                        },
                    ],
                    jumpFloating: [
                        {
                            check: () => {
                                const linearVelocity =
                                    this.playerEntity.movementComponent?.getLinearVelocity();
                                if (linearVelocity) {
                                    return linearVelocity._y < -15;
                                }
                                return false;
                            },
                        },
                    ],
                },
                jumpUp: {
                    // "jumpDown": [
                    //     {
                    //         check: () => {
                    //             return this.playerEntity.movementComponent?.isGrounded!;
                    //         }
                    //     }
                    // ],
                    jumpFloating: [
                        {
                            check: () => {
                                return (
                                    this.jumpUpState?.exitTimeCounter! >=
                                    this.jumpUpState?.exitTime!
                                );
                            },
                        },
                        {
                            check: () => {
                                const linearVelocity =
                                    this.playerEntity.movementComponent?.getLinearVelocity();
                                if (linearVelocity) {
                                    return linearVelocity._y < -1;
                                }
                                return false;
                            },
                        },
                    ],
                },
                jumpFloating: {
                    jumpDown: [
                        {
                            check: () => {
                                return (
                                    this.playerEntity.movementComponent
                                        ?.groundDistance! <= 0.2
                                );
                            },
                        },
                    ],
                },
                jumpDown: {
                    motion: [
                        {
                            check: () => {
                                return this.playerEntity.movementComponent
                                    ?.isGrounded!;
                            },
                        },
                    ],
                },
                attack1: {
                    motion: [
                        {
                            check: () => {
                                return !this.attack1State?.isPlaying!;
                            },
                        },
                    ],
                },
                magicAtk: {
                    motion: [
                        {
                            check: () => {
                                return !this.magicAtkState?.isPlaying!;
                            },
                        },
                    ],
                },
            },
        });

        const motionBlendTree: IBlendTree1D = {
            name: "motion",
            nodes: [
                {
                    name: "Idle",
                    clip: "Idle",
                    position: 0,
                    weight: 0,
                    influenceRadius: 0,
                },
                {
                    name: "Walking",
                    clip: "Walking",
                    position: 0.1,
                    weight: 0,
                    influenceRadius: 0.1,
                },
                {
                    name: "Running",
                    clip: "Running",
                    position: 0.6,
                    weight: 0,
                    influenceRadius: 0.2,
                },
            ],
            minValue: 0,
            maxValue: 1,
        };

        this.motionState =
            this.playerEntity.animatorComponent?.addBlendTreeState(
                "motion",
                motionBlendTree,
                true,
            );
        this.jumpUpState =
            this.playerEntity.animatorComponent?.addAnimationState(
                "jumpUp",
                "JumpUp",
                2,
                false,
                true,
                0.2,
            );
        this.jumpDownState =
            this.playerEntity.animatorComponent?.addAnimationState(
                "jumpDown",
                "JumpDown",
                1,
                false,
                true,
                0.2,
            );
        this.jumpFloatingState =
            this.playerEntity.animatorComponent?.addAnimationState(
                "jumpFloating",
                "JumpFloating",
            );
        this.attack1State =
            this.playerEntity.animatorComponent?.addAnimationState(
                "attack1",
                "Punch_1",
                1,
                false,
            );
        this.magicAtkState =
            this.playerEntity.animatorComponent?.addAnimationState(
                "magicAtk",
                "MagicAtk_1",
                1,
                false,
            );
    }

    private isAttack: boolean = false;

    /**
     * 鼠标左键事件 / Mouse left button event
     * @param eventType - The type of the input event / 输入事件类型
     */
    public onMouseLeft(eventType: InputEventType): void {
        if (this.isAttack) return;
        if (!this.playerEntity.movementComponent?.isGrounded) return;
        if (eventType === InputEventType.MOUSE_DOWN) {
            this.isAttack = true;
            this.playerEntity.animatorComponent?.setState("attack1");
            setTimeout(() => {
                this.isAttack = false;
                console.log("attack2", this.isAttack);
            }, 1000);
        } else if (eventType === InputEventType.MOUSE_UP) {
        }
    }

    /**
     * 鼠标右键事件 / Mouse right button event
     * @param eventType - The type of the input event / 输入事件类型
     */
    public onMouseRight(eventType: InputEventType): void {
        if (this.isAttack) return;
        if (!this.playerEntity.movementComponent?.isGrounded!) return;
        this.isAttack = true;
        if (eventType === InputEventType.MOUSE_DOWN) {
            this.playerEntity.animatorComponent?.setState("magicAtk");

            setTimeout(() => {
                this.createMagBullet();
                this.isAttack = false;
            }, 2000);
        } else if (eventType === InputEventType.MOUSE_UP) {
        }
    }

    private createMagBullet(): void {
        const forward =
            this.playerEntity.skeletonMeshComponent?.meshRoot?.forward;
        if (forward) {
            const ball = MeshBuilder.CreateSphere(
                "ball",
                { diameter: 0.2 },
                this.playerEntity.scene?.scene,
            );
            ball.position = this.playerEntity.root.root.position
                .clone()
                .add(forward.scale(0.7));
            ball.position.y += 1.3;

            const material = new StandardMaterial(
                "ballMaterial",
                this.playerEntity.scene?.scene,
            );
            material.diffuseColor = new Color3(0.5, 0.5, 0.5);
            ball.material = material;

            const shape = new PhysicsShapeSphere(
                new Vector3(0, 0, 0),
                0.2,
                this.playerEntity.scene?.scene!,
            );

            const physicsAggregate = new PhysicsAggregate(
                ball,
                shape,
                {
                    mass: 10,
                    restitution: 0.5,
                    friction: 0.7,
                },
                this.playerEntity.scene?.scene,
            );

            physicsAggregate.body.applyImpulse(
                forward.scale(500),
                ball.position,
            );
        }
    }

    /**
     * 绑定事件 / Bind event
     */
    public bindEvent(): void {
        EventEmitter.instance.on("MouseLeft", (eventType) => {
            this.onMouseLeft(eventType);
        });
        EventEmitter.instance.on("MouseRight", (eventType) => {
            this.onMouseRight(eventType);
        });
        EventEmitter.instance.on("MouseMove", (event) => {
            const delta = event.delta as Vector2;
            if (!delta) return;
            (
                this.playerEntity.cameraComponent as FollowCameraComponent
            ).updateCameraForward(delta);
        });
        EventEmitter.instance.on("MouseWheel", (event) => {
            const delta = event.delta as Vector3;
            if (!delta) return;
            (
                this.playerEntity.cameraComponent as FollowCameraComponent
            ).updateCameraRadius(delta.y);
        });
    }

    /**
     * 解绑事件 / Unbind event
     */
    public unbindEvent(): void {
        EventEmitter.instance.off("MouseLeft");
        EventEmitter.instance.off("MouseRight");
        EventEmitter.instance.off("MouseMove");
    }

    /**
     * 更新骨骼网格 / Update skeleton mesh
     * @param deltaTime - The time since the last frame / 自上一帧以来的时间
     */
    public updateMesh(deltaTime: number): void {
        const movementComponent = this.playerEntity.movementComponent;
        if (
            movementComponent &&
            this.playerEntity.skeletonMeshComponent?.meshRoot
        ) {
            const moveDirection = movementComponent.getMoveDirection();
            if (moveDirection.length() > 0) {
                // 规范化移动方向向量
                const normalizedDirection = moveDirection.normalize();

                // 计算目标角度(弧度)，使用Math.atan2计算方向角度
                const targetAngle = Math.atan2(
                    normalizedDirection.x,
                    normalizedDirection.z,
                );

                // 获取当前旋转角度
                const currentRotation =
                    this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y;
                // 计算角度差值，确保在-π到π范围内
                let angleDiff = targetAngle - currentRotation;
                angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

                // 使用线性插值平滑旋转
                const rotationStep = angleDiff * this.rotationSpeed * deltaTime;

                // 应用旋转
                this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y +=
                    rotationStep;

                // 规范化旋转角度到-π到π范围
                this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y =
                    ((this.playerEntity.skeletonMeshComponent.meshRoot.rotation
                        .y +
                        Math.PI) %
                        (2 * Math.PI)) -
                    Math.PI;
            }
        }
    }

    /**
     * 更新动画器 / Update animator
     */
    public updateAnimator(): void {
        const movementComponent = this.playerEntity.movementComponent;
        if (this.motionState && movementComponent) {
            this.motionState.blendParameter =
                (movementComponent.moveSpeed / movementComponent.maxMoveSpeed) *
                movementComponent.getMoveDirection().length();
        }
    }

    /**
     * 更新移动 / Update movement
     */
    public updateMovement(): void {
        const direction =
            this.playerEntity.playerInputComponent?.inputDirection;
        const camera = this.playerEntity.cameraComponent?.getCamera();
        if (camera && direction) {
            const moveDirection = camera
                .getDirection(Vector3.Forward())
                .scale(direction.z)
                .add(camera.getDirection(Vector3.Right()).scale(direction.x));
            // 设置移动方向的y轴为0，去除移动方向的y轴 remove the y axis of the move direction
            moveDirection.y = 0;
            this.playerEntity.movementComponent?.setMoveDirection(
                moveDirection.normalize(),
            );
        }
    }
}
