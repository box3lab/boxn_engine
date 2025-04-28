import type { AbstractMesh } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * GLBAsset class for GLB model resources
 * GLB 模型资源的 GLBAsset 类
 */
export class GLBAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.GLB;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: BABYLON.AssetContainer;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 