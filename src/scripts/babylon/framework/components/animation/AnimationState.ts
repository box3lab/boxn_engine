import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";
import type { AnimationGroup } from "@babylonjs/core";
import { BaseAnimState } from "./BaseAnimState";
/**
 * 动画状态 / Animation State
 * 用于处理单个动画片段 / Used for handling single animation clips
 */
export class AnimationState extends BaseAnimState {
    /**
     * 动画片段名称 / Animation clip name
     */
    private clip: string;
    /**
     * 动画速度 / Animation speed
     */
    private speed: number;
    /**
     * 是否循环 / Whether to loop
     */ 
    private isLoop: boolean;
    /**
     * 当前动画组 / Current animation group
     */
    private currentAnimationGroup: AnimationGroup | undefined;

    constructor(
        name: string,
        clip: string,
        skeletonMeshComponent: SkeletonMeshComponent,
        speed: number = 1.0,
        isLoop: boolean = true,
        isHasExitTime: boolean = false,
        exitTime: number = 0
    ) {
        super(name, skeletonMeshComponent, isHasExitTime, exitTime);
        this.clip = clip;
        this.speed = speed;
        this.isLoop = isLoop;
        this.skeletonMeshComponent = skeletonMeshComponent;
    }

    public onEnter(prevState: string): void {
        super.onEnter(prevState);
        if (!this.skeletonMeshComponent.isLoaded) {
            this.skeletonMeshComponent.onLoaded(() => {
                this.playAnimation();
            });
        } else {
            this.playAnimation();
        }
    }

    public onExit(nextState: string): void {
        super.onExit(nextState);
        this.stopAnimation();
    }

    public onUpdate(deltaTime: number): void {
        super.onUpdate(deltaTime);
        // 可以在这里添加每帧的动画更新逻辑 / Add per-frame animation update logic here
    }

    /**
     * 播放动画 / Play animation
     */
    private playAnimation(): void {
        this.stopAnimation();
        const animationGroup = this.skeletonMeshComponent.animationGroups.get(this.clip);
        if (animationGroup) {
            this.currentAnimationGroup = animationGroup;
            animationGroup.start(this.isLoop, this.speed);
        }
    }

    /**
     * 停止动画 / Stop animation
     */
    private stopAnimation(): void {
        if (this.currentAnimationGroup) {
            this.currentAnimationGroup.stop();
            this.currentAnimationGroup = undefined;
        }
    }

    /**
     * 获取动画是否正在播放 / Get whether the animation is playing
     * @returns 动画是否正在播放 / Whether the animation is playing
     */
    public get isPlaying(): boolean {
        return this.currentAnimationGroup?.isPlaying ?? false;
    }
} 