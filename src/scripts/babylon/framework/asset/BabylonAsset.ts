import type { AbstractMesh } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * BabylonAsset class for Babylon model resources
 * Babylon 模型资源的 BabylonAsset 类
 */
export class BabylonAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.BABYLON;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: AbstractMesh[];
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 