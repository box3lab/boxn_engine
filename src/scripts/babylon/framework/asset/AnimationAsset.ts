import type { Animation } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * AnimationAsset class for animation resources
 * 动画资源的 AnimationAsset 类
 */
export class AnimationAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.Animation;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: Animation[];
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 