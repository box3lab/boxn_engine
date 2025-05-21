import type { SkeletonMeshComponent } from "../mesh/SkeletonMeshComponent";
import { AnimationGroup, Vector2 } from "@babylonjs/core";
import { BaseAnimState } from "./BaseAnimState";

/**
 * 混合树节点接口 / Blend Tree Node Interface
 */
export interface IBlendTreeNode {
    /**
     * 节点名称 / Node Name
     */
    name: string;
    /**
     * 动画片段名称 / Animation Clip Name
     */
    clip: string;
    /**
     * 一维混合位置 / 1D Blend Position
     */
    position?: number;
    /**
     * 二维混合位置 / 2D Blend Position
     */
    position2D?: { x: number; y: number };

    /**
     * 混合权重 / Blend Weight
     */
    weight?: number;

    /**
     * 影响半径 / Influence Radius
     */
    influenceRadius?: number;
}

/**
 * 一维混合树配置 / 1D Blend Tree Configuration
 */
export interface IBlendTree1D {
    /**
     * 混合树名称 / Blend Tree Name 
     */
    name: string;
    /**
     * 混合树节点 / Blend Tree Nodes
     */
    nodes: IBlendTreeNode[];
    /**
     * 最小值 / Minimum Value
     */
    minValue: number;
    /**
     * 最大值 / Maximum Value
     */
    maxValue: number;
}   

/**
 * 二维混合树配置 / 2D Blend Tree Configuration
 */
export interface IBlendTree2D {
    /** 
     * 混合树名称 / Blend Tree Name
     */
    name: string;
    /**
     * 混合树节点 / Blend Tree Nodes
     */
    nodes: IBlendTreeNode[];
    /**
     * 最小值 / Minimum Value
     */
    xMinValue: number;
    /**
     * X轴最大值 / X-axis Maximum Value
     */
    xMaxValue: number;
    /**
     * Y轴最小值 / Y-axis Minimum Value
     */
    yMinValue: number;
    /**
     * Y轴最大值 / Y-axis Maximum Value
     */
    yMaxValue: number;
    
}

/**
 * 混合树状态 / Blend Tree State
 */
export class BlendTreeState extends BaseAnimState {
    /**
     * 激活的动画 / Active Animations
     */
    private activeAnimations: Map<string, AnimationGroup> = new Map();
    /**
     * 混合树 / Blend Tree
     */
    private blendTree: IBlendTree1D | IBlendTree2D | undefined;
    /**
     * 是否为1D混合树 / Whether the blend tree is 1D
     */
    private is1D: boolean = true;
    /**
     * 混合参数 / Blend Parameter
     */
    public blendParameter: number = 0;
    /**
     * 混合参数2D / Blend Parameter 2D
     */
    public blendParameter2D: Vector2 = new Vector2(0, 0);
    /**
     * 是否循环 / Whether to loop
     */
    private isLoop: boolean = true;

    constructor(
        name: string,
        blendTree: IBlendTree1D | IBlendTree2D,
        skeletonMeshComponent: SkeletonMeshComponent,
        is1D: boolean = true,
        isHasExitTime: boolean = false
    ) {
        super(name, skeletonMeshComponent, isHasExitTime);
        this.name = name;
        this.blendTree = blendTree;
        this.skeletonMeshComponent = skeletonMeshComponent;
        this.is1D = is1D;
        
        if (!this.skeletonMeshComponent.isLoaded) {
            this.skeletonMeshComponent.onLoaded(() => {
                this.initializeBlendTree();
            });
        } else {
            this.initializeBlendTree();
        }
    }

    public onEnter(prevState: string): void {
        this.updateBlendWeights();
    }

    public onExit(nextState: string): void {
        this.stopAllAnimations();
    }

    public onUpdate(deltaTime: number): void {
        this.updateBlendWeights();
    }

    /**
     * 初始化混合树 / Initialize blend tree
     */
    private initializeBlendTree(): void {
        if(this.blendTree){
            for (const node of this.blendTree.nodes) {
                const animationGroup = this.skeletonMeshComponent.animationGroups.get(node.name);
                animationGroup && this.activeAnimations.set(node.name, animationGroup);
                animationGroup && animationGroup.play(this.isLoop);
            }
        }
    }

    /**
     * 更新混合权重 / Update blend weights
     */
    private updateBlendWeights(): void {
        if (this.is1D) {
            this.updateBlend1D();
        } else {
            this.updateBlend2D();
        }
    }

    /**
     * 更新一维混合权重 / Update 1D blend weights
     */
    private updateBlend1D(): void {
        if(!this.blendTree){
            return;
        }
        const blendTree = this.blendTree as IBlendTree1D;
        const normalizedValue = Math.max(blendTree.minValue, Math.min(blendTree.maxValue, this.blendParameter));
        const scaledValue = (normalizedValue - blendTree.minValue) / (blendTree.maxValue - blendTree.minValue);
    
        const nodes = blendTree.nodes;
        const nodeCount = nodes.length;
        
        // 重置所有权重
        nodes.forEach(node => node.weight = 0);
    
        if (nodeCount === 0) return;
        
        // 单节点特殊情况
        if (nodeCount === 1) {
            nodes[0].weight = 1;
            this.updateActiveClips(nodes);
            return;
        }
    
        // 确保节点按position排序
        nodes.sort((a, b) => (a.position || 0) - (b.position || 0));
    
        // 边界情况处理
        if (scaledValue <= nodes[0].position!) {
            nodes[0].weight = 1;
            this.updateActiveClips(nodes);
            return;
        }
        
        if (scaledValue >= nodes[nodeCount-1].position!) {
            nodes[nodeCount-1].weight = 1;
            this.updateActiveClips(nodes);
            return;
        }
    
        // 找到当前参数值所在的区间
        let lowerIndex = 0;
        let upperIndex = nodeCount - 1;
        
        for (let i = 0; i < nodeCount - 1; i++) {
            if (scaledValue >= nodes[i].position! && scaledValue <= nodes[i+1].position!) {
                lowerIndex = i;
                upperIndex = i + 1;
                break;
            }
        }
    
        // 计算混合权重
        const lowerNode = nodes[lowerIndex];
        const upperNode = nodes[upperIndex];
        const segmentLength = upperNode.position! - lowerNode.position!;
        const segmentProgress = (scaledValue - lowerNode.position!) / segmentLength;

        lowerNode.weight = 1 - segmentProgress;
        upperNode.weight = segmentProgress;

        this.normalizeWeights(nodes);
        this.updateActiveClips(blendTree.nodes);
    }

    /**
     * 更新二维混合权重 / Update 2D blend weights
     */
    private updateBlend2D(): void {
        if(!this.blendTree){
            return;
        }
        const blendTree = this.blendTree as IBlendTree2D;
        
        // 归一化参数值
        const normalizedX = (this.blendParameter2D.x - blendTree.xMinValue) / (blendTree.xMaxValue - blendTree.xMinValue);
        const normalizedY = (this.blendParameter2D.y - blendTree.yMinValue) / (blendTree.yMaxValue - blendTree.yMinValue);
        
        const currentPos = { x: normalizedX, y: normalizedY };
        // console.log("this.blendParameter2D", this.blendParameter2D);

        // 重置所有权重
        blendTree.nodes.forEach(node => node.weight = 0);
        
        // 计算每个节点的权重
        blendTree.nodes.forEach(node => {
            if (!node.position2D) {
                return;
            }
            const nodePos = {
                x: (node.position2D.x - blendTree.xMinValue) / (blendTree.xMaxValue - blendTree.xMinValue),
                y: (node.position2D.y - blendTree.yMinValue) / (blendTree.yMaxValue - blendTree.yMinValue)
            };
            
            const distance = Math.sqrt(
                Math.pow(currentPos.x - nodePos.x, 2) + 
                Math.pow(currentPos.y - nodePos.y, 2)
            );
            // console.log("node.distance", node.name, distance);
            // 使用影响半径计算权重
            const radius = node.influenceRadius || 0.5;
            node.weight = Math.max(0, 1 - (distance / radius));
        });
   
        // 归一化权重
        this.normalizeWeights(blendTree.nodes);
        this.updateActiveClips(blendTree.nodes);
    }

    /**
     * 归一化权重 / Normalize weights
     */
    private normalizeWeights(nodes: IBlendTreeNode[]): void {
        // 计算当前权重总和
        const totalWeight = nodes.reduce((sum, node) => sum + node.weight!, 0);
        
        // 如果总和为0或非常接近0，则平均分配权重
        if (totalWeight <= 0.0001) {
            const equalWeight = 1 / nodes.length;
            nodes.forEach(node => node.weight = equalWeight);
            return;
        }
        
        // 归一化权重
        nodes.forEach(node => {
            node.weight! /= totalWeight;
        });
    }

    /**
     * 专门为2D混合树优化的权重归一化 / Optimized weight normalization for 2D blend trees
     */
    private normalizeWeights2D(
        nodes: IBlendTreeNode[],
        maxActiveNodes: number = 4
    ): void {
        // 1. 按权重降序排序
        nodes.sort((a, b) => (b.weight! - a.weight!));
        
        // 2. 只保留权重最大的几个节点
        let totalWeight = 0;
        let activeCount = 0;
        
        for (let i = 0; i < nodes.length; i++) {
            if (i < maxActiveNodes && nodes[i].weight! > 0.001) {
                totalWeight += nodes[i].weight!;
                activeCount++;
            } else {
                nodes[i].weight = 0;
            }
        }
        
        // 3. 处理无有效权重的情况
        if (totalWeight <= 0.0001) {
            const equalWeight = 1 / Math.min(maxActiveNodes, nodes.length);
            for (let i = 0; i < Math.min(maxActiveNodes, nodes.length); i++) {
                nodes[i].weight = equalWeight;
            }
            return;
        }
        
        // 4. 归一化有效权重
        for (let i = 0; i < activeCount; i++) {
            nodes[i].weight! /= totalWeight;
        }
        
        // 5. 确保总和精确为1
        const finalTotal = nodes.reduce((sum, node) => sum + node.weight!, 0);
        if (Math.abs(1 - finalTotal) > 0.0001 && activeCount > 0) {
            const correction = 1 / finalTotal;
            for (let i = 0; i < activeCount; i++) {
                nodes[i].weight! *= correction;
            }
        }
    }

    /**
     * 更新激活的动画 / Update active clips
     */
    private updateActiveClips(nodes: IBlendTreeNode[]): void {
        for (const node of nodes) {
            const animationGroup = this.activeAnimations.get(node.name);
            animationGroup && animationGroup.setWeightForAllAnimatables(node.weight || 0);
        }
    }

    /**
     * 停止所有动画 / Stop all animations
     */
    private stopAllAnimations(): void {
        for (const animationGroup  of this.activeAnimations.values()) {
            animationGroup.stop();
        }
        this.activeAnimations.clear();
    }
} 