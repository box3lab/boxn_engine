import type { IBlendTree1D } from "../components/animation/BlendTreeState";
import { Vector2 } from "@babylonjs/core";
import type { BlendTreeState, IBlendTree2D } from "../components/animation/BlendTreeState";
import type { PlayerEntity } from "../entity/PlayerEntity";
import type { IGameEntity } from "../interface/IGameEntity";
import { BaseController } from "./BaseController";

/**
 * 玩家控制器 / Player controller
 */
export class PlayerController extends BaseController {

    private playerEntity: PlayerEntity;
    private motionState: BlendTreeState | undefined;
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
    }
    
    public dispose(): void {
        super.dispose();
    }
    
    /**
     * 初始化 / Initialize
     */
    public initialize(): void {
        this.initAnimator();
    }
    
    /**
     * 初始化动画器 / Initialize animator
     */
    public initAnimator(): void {
        // const motionBlendTree: IBlendTree2D = {
        //     name: "motion",
        //     nodes: [
        //         { name: "Idle", clip: "Idle", position2D: { x: 0, y: 0 } ,weight: 0,influenceRadius: 0.2},
        //         { name: "Walking", clip: "Walking", position2D: { x: 1, y: 0 } ,weight: 0,influenceRadius: 0.2},
        //         { name: "WalkingBack", clip: "WalkingBack", position2D: { x: -1, y: 0 } ,weight: 0,influenceRadius: 0.2}
        //     ],
        //     xMinValue: -1,
        //     xMaxValue: 1,
        //     yMinValue: -1,
        //     yMaxValue: 1
        // }
        // this.playerEntity.animatorComponent?.initStateMachine({
        //     initialState: "motion",
        //     transitions: {
        //         motion: {
        //             Idle: [{ check: () => true, priority: 1 }],
        //         }
        //     }
        // });
        // this.motionState = this.playerEntity.animatorComponent?.addBlendTreeState("motion", motionBlendTree, false);
        const motionBlendTree: IBlendTree1D = {
            name: "motion",
            nodes: [
                { name: "Idle", clip: "Idle", position: 0 ,weight: 0,influenceRadius: 0},
                { name: "Walking", clip: "Walking", position: 0.1 ,weight: 0,influenceRadius: 0.1},
                { name: "Running", clip: "Running", position: 0.6 ,weight: 0,influenceRadius: 0}
            ],
            minValue: 0,
            maxValue: 1
        }
        this.playerEntity.animatorComponent?.initStateMachine({
            initialState: "motion",
            transitions: {
                motion: {
                }

            }
        });
        this.motionState = this.playerEntity.animatorComponent?.addBlendTreeState("motion", motionBlendTree, true);
    }
    public updateMesh(deltaTime: number): void {
        const movementComponent = this.playerEntity.movementComponent;
        if (movementComponent && this.playerEntity.skeletonMeshComponent?.meshRoot) {
            const moveDirection = movementComponent.getMoveDirection();
            if(moveDirection.length() > 0){
                // 规范化移动方向向量
                const normalizedDirection = moveDirection.normalize();
                
                // 计算目标角度(弧度)，使用Math.atan2计算方向角度
                const targetAngle = Math.atan2(normalizedDirection.x, normalizedDirection.z);

                // 获取当前旋转角度
                const currentRotation = this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y;
                // 计算角度差值，确保在-π到π范围内
                let angleDiff = targetAngle - currentRotation;
                angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
    
                // 使用线性插值平滑旋转
                const rotationStep = angleDiff * this.rotationSpeed * deltaTime;
                
                // 应用旋转
                this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y += rotationStep;
                
                // 规范化旋转角度到-π到π范围
                this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y = ((this.playerEntity.skeletonMeshComponent.meshRoot.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;
            }
        }
    }

    /**
     * 更新动画器 / Update animator
     */
    public updateAnimator(): void {
        const movementComponent = this.playerEntity.movementComponent;
        if (this.motionState && movementComponent) {
            this.motionState.blendParameter = (movementComponent.moveSpeed / movementComponent.maxMoveSpeed) * 
                movementComponent.getMoveDirection().length();
        }
    }
}