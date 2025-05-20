import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";
import type { AnimationGroup } from "@babylonjs/core";
import { BaseAnimState } from "./BaseAnimState";
/**
 * 动画状态 / Animation State
 * 用于处理单个动画片段 / Used for handling single animation clips
 */
export class AnimationState extends BaseAnimState {
    private clip: string;
    private speed: number;
    private isLoop: boolean;
    private currentAnimationGroup: AnimationGroup | undefined;

    constructor(
        name: string,
        clip: string,
        skeletonMeshComponent: SkeletonMeshComponent,
        speed: number = 1.0,
        isLoop: boolean = true,
        isHasExitTime: boolean = false
    ) {
        super(name, skeletonMeshComponent, isHasExitTime);
        this.clip = clip;
        this.speed = speed;
        this.isLoop = isLoop;
        this.skeletonMeshComponent = skeletonMeshComponent;
    }

    public onEnter(prevState: string): void {
        if (!this.skeletonMeshComponent.isLoaded) {
            this.skeletonMeshComponent.onLoaded(() => {
                this.playAnimation();
            });
        } else {
            this.playAnimation();
        }
    }

    public onExit(nextState: string): void {
        this.stopAnimation();
    }

    public onUpdate(deltaTime: number): void {
        // 可以在这里添加每帧的动画更新逻辑 / Add per-frame animation update logic here
    }

    private playAnimation(): void {
        this.stopAnimation();
        const animationGroup = this.skeletonMeshComponent.animationGroups.get(this.clip);
        if (animationGroup) {
            this.currentAnimationGroup = animationGroup;
            animationGroup.start(this.isLoop, this.speed);
        }
    }

    private stopAnimation(): void {
        if (this.currentAnimationGroup) {
            this.currentAnimationGroup.stop();
            this.currentAnimationGroup = undefined;
        }
    }
} 