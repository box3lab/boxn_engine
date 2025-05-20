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

    constructor(entity: IGameEntity) {
        super(entity);
        this.playerEntity = entity as PlayerEntity;
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
        this.updateInitAnimator();
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
        const motionBlendTree: IBlendTree2D = {
            name: "motion",
            nodes: [
                { name: "Idle", clip: "Idle", position2D: { x: 0, y: 0 } ,weight: 0,influenceRadius: 0.2},
                { name: "Walking", clip: "Walking", position2D: { x: 1, y: 0 } ,weight: 0,influenceRadius: 0.2},
                { name: "WalkingBack", clip: "WalkingBack", position2D: { x: -1, y: 0 } ,weight: 0,influenceRadius: 0.2}
            ],
            xMinValue: -1,
            xMaxValue: 1,
            yMinValue: -1,
            yMaxValue: 1
        }
        this.playerEntity.animatorComponent?.initStateMachine({
            initialState: "motion",
            transitions: {
                motion: {
                    Idle: [{ check: () => true, priority: 1 }],
                }
            }
        });
        this.motionState = this.playerEntity.animatorComponent?.addBlendTreeState("motion", motionBlendTree, false);
    }

    public updateInitAnimator(): void {
        const moveDirection = this.playerEntity.movementComponent?.getMoveDirection();
        if (this.motionState && moveDirection) {
            this.motionState.blendParameter2D = new Vector2(moveDirection.z, moveDirection.x);
        }
    }
}