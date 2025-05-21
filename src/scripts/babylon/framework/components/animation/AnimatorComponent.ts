import { BaseComponent } from "../BaseComponent";
import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";
import { StateMachine } from "../../common/state/StateMachine";
import type { IStateConfig } from "../../common/state/StateMachine";
import type { ITransitionCondition } from "../../common/state/StateMachine";
import { AnimationState } from "./AnimationState";
import { BlendTreeState } from "./BlendTreeState";

/**
 * 动画器组件 / Animator Component
 * 用于管理动画状态机 / Used for managing animation state machine
 */
export class AnimatorComponent extends BaseComponent {
    private stateMachine: StateMachine | null = null;
    private skeletonMeshComponent!: SkeletonMeshComponent;
    private parameters: Map<string, number> = new Map();

    constructor(name: string) {
        super(name);
    }

    /**
     * 设置骨骼网格组件 / Set skeleton mesh component
     * @param component 骨骼网格组件 / Skeleton mesh component
     */
    public setSkeletonMeshComponent(component: SkeletonMeshComponent): void {
        this.skeletonMeshComponent = component;
    }

    public initStateMachine(config: IStateConfig): void {
        this.stateMachine = new StateMachine(config);
    }

    /**
     * 添加动画状态 / Add animation state
     * @param name 状态名称 / State name
     * @param clip 动画片段名称 / Animation clip name
     * @returns 动画状态 / Animation state
     */
    public addAnimationState(name: string, clip: string,speed: number = 1,isLoop: boolean = true,
        isHasExitTime: boolean = false, exitTime: number = 0): AnimationState {
        const state = new AnimationState(name, clip, this.skeletonMeshComponent,speed,isLoop,isHasExitTime,exitTime);
        this.stateMachine && this.stateMachine.addState(state);

        return state;
    }

    /**
     * 添加混合树状态 / Add blend tree state
     * @param name 状态名称 / State name
     * @param blendTree 混合树配置 / Blend tree configuration
     * @returns 混合树状态 / Blend tree state
     */
    public addBlendTreeState(name: string, blendTree: any,
        is1D: boolean = false,isHasExitTime: boolean = false, exitTime: number = 0): BlendTreeState {
        const state = new BlendTreeState(name, blendTree, this.skeletonMeshComponent,is1D,isHasExitTime,exitTime);
        this.stateMachine && this.stateMachine.addState(state);

        return state;
    }

    /**
     * 添加状态转换 / Add state transition
     * @param fromState 起始状态 / From state
     * @param toState 目标状态 / To state
     * @param conditions 转换条件 / Transition conditions
     */
    public addTransition(
        fromState: string,
        toState: string,
        conditions: ITransitionCondition[]
    ): void {
        for (const condition of conditions) {
            this.stateMachine && this.stateMachine.addTransitionCondition(fromState, toState, condition);
        }
    }

    /**
     * 设置参数值 / Set parameter value
     * @param name 参数名称 / Parameter name
     * @param value 参数值 / Parameter value
     */
    public setParameter(name: string, value: number): void {
        this.parameters.set(name, value);
    }

    /**
     * 获取参数值 / Get parameter value
     * @param name 参数名称 / Parameter name
     * @returns 参数值 / Parameter value
     */
    public getParameter(name: string): number {
        return this.parameters.get(name) ?? 0;
    }

    /**
     * 设置当前状态 / Set current state
     * @param stateName 状态名称 / State name
     */
    public setState(stateName: string): void {
        this.stateMachine && this.stateMachine.transitionTo(stateName, true);
    }

    /**
     * 获取当前状态 / Get current state
     * @returns 当前状态名称 / Current state name
     */
    public getCurrentState(): string {
        return this.stateMachine && this.stateMachine.getCurrentStateName() || "";
    }

    public update(deltaTime: number): void {
        this.stateMachine && this.stateMachine.update(deltaTime);
    }

    public dispose(): void {
        this.parameters.clear();
        super.dispose();
    }
}
