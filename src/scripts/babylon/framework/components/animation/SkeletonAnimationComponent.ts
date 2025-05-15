import { BaseComponent } from "../BaseComponent";
import type { IGameEntity } from "../../interface/IGameEntity";
import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";
import type { AnimationGroup, Observable, Observer, TargetedAnimation } from "@babylonjs/core";

/**
 * 骨骼动画组件 / Skeleton Animation Component
 * 用于处理骨骼动画的3D模型 / Used for handling 3D models with skeleton animations
 */
export class SkeletonAnimationComponent extends BaseComponent {
    // 骨骼网格组件 / Skeleton mesh component
    private skeletonMeshComponent: SkeletonMeshComponent;
    // 当前播放的动画名称 / Currently playing animation name    
    private currentAnimation: string | null = null;
    // 当前播放的动画组 / Currently playing animation group
    private _currentAnimationGroup: AnimationGroup | undefined = undefined;

    public get currentAnimationGroup(): AnimationGroup | undefined {
        return this._currentAnimationGroup;
    }

    // 动画结束回调 / Animation end callback
    private onAnimationEnd: (() => void) | null = null;
    // 是否循环播放 / Whether to loop play
    private isLoop: boolean = false;
    // 动画结束回调列表 / Animation end callback list
    private animationEndObserverMap: Map<string, Observer<TargetedAnimation>> = new Map();

    constructor(name: string, skeletonMeshComponent: SkeletonMeshComponent) {
        super(name);
        this.skeletonMeshComponent = skeletonMeshComponent;
        if(this.skeletonMeshComponent.isLoaded){
            this.skeletonMeshComponent.animationGroups.forEach((animationGroup) => {
                const onAnimationEndObservable = animationGroup.onAnimationEndObservable;
                const onAnimationEndObserver = onAnimationEndObservable.add(() => {
                    this.animationEndCallback();
                });
                this.animationEndObserverMap.set(animationGroup.name, onAnimationEndObserver);
            });
        }else{
            this.skeletonMeshComponent.onLoaded(() => {
                this.skeletonMeshComponent.animationGroups.forEach((animationGroup) => {
                    const onAnimationEndObservable = animationGroup.onAnimationEndObservable;
                    const onAnimationEndObserver = onAnimationEndObservable.add(() => {
                        this.animationEndCallback();
                    });
                    this.animationEndObserverMap.set(animationGroup.name, onAnimationEndObserver);
                });
            });
        }
           
    }

    /**
     * 附加到游戏实体 / Attach to game entity
     * @param gameEntity 游戏实体 / Game entity
     */
    public attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
    }

    /**
     * 更新组件 / Update component
     * @param deltaTime 时间增量 / Time delta
     */
    public update(deltaTime: number): void {
        // 可以在这里添加每帧的动画更新逻辑 / Add per-frame animation update logic here
    }

    public initAnimation(animationName: string, isLoop: boolean = false, speedRatio: number = 1, 
        onEndCallback: (() => void) | null = null){
        if(!this.skeletonMeshComponent.isLoaded){
            this.skeletonMeshComponent.onLoaded(() => { 
                this.playAnimation(animationName, isLoop, speedRatio, onEndCallback);
            });
        }else{
            this.playAnimation(animationName, isLoop, speedRatio, onEndCallback);
        }
    }

    /**
     * 播放动画 / Play animation
     * @param animationName 动画名称 / Animation name
     * @param loopCount 循环次数 / Loop count
     * @param speedRatio 速度比率 / Speed ratio
     */
    public playAnimation(animationName: string, isLoop: boolean = false, speedRatio: number = 1, 
        onEndCallback: (() => void) | null = null): void {
      
        if(!this.skeletonMeshComponent.isLoaded)return;
        if(this.currentAnimation == animationName) return;
        this.stopAnimation();
        const animationGroup = this.skeletonMeshComponent.animationGroups.get(animationName);
        if(animationGroup){
            this.isLoop = isLoop;
            animationGroup.start(isLoop, speedRatio);
            this.currentAnimation = animationName;
            this._currentAnimationGroup = animationGroup;
            console.log("this.currentAnimation",this.currentAnimation);
            console.log("this._currentAnimationGroup",this._currentAnimationGroup);
            this.onAnimationEnd = onEndCallback;
        }
    }

    /**
     * 暂停动画 / Pause animation
     */
    public pauseAnimation(): void {
        if(!this.skeletonMeshComponent.isLoaded)return;
        if(this.currentAnimation){
            this._currentAnimationGroup?.pause();
        }
    }

    /**
     * 恢复动画 / Resume animation
     */
    public resumeAnimation(): void {
        if(!this.skeletonMeshComponent.isLoaded)return;
        if(this.currentAnimation){
            this.currentAnimationGroup?.play();
        }
    }

    /**
     * 停止动画 / Stop animation
     */
    public stopAnimation(): void {
        if(!this.skeletonMeshComponent.isLoaded)return;
        console.log("this.currentAnimation",this.currentAnimation);
        if(this.currentAnimation){
            this.currentAnimationGroup?.stop();
            this.currentAnimation = null;
            this.onAnimationEnd = null;
        }
    }

    /**
     * 是否正在播放动画 / Whether the animation is playing
     * @returns 是否正在播放动画 / Whether the animation is playing
     */
    public isPlaying(): boolean {
        return this.currentAnimationGroup?.isPlaying || false;
    }

    /**
     * 动画结束回调 / Animation end callback
     */
    private animationEndCallback(): void {
        if(!this.isLoop){
            this.stopAnimation();
            this.onAnimationEnd?.();
        }
    }

    /**
     * 释放资源 / Dispose resources
     */
    public dispose(): void {
        this.stopAnimation();
        this.currentAnimation = null;
        // 移除动画结束回调 / Remove animation end callback
        this.skeletonMeshComponent.animationGroups.forEach((animationGroup) => {
            const onAnimationEndObservable = animationGroup.onAnimationEndObservable;
            if(this.animationEndObserverMap.has(animationGroup.name)){
                onAnimationEndObservable.remove(this.animationEndObserverMap.get(animationGroup.name) as Observer<TargetedAnimation>);
            }
        });
        this.animationEndObserverMap.clear();
    }
}
