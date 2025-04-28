import type { AbstractMesh } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * OBJAsset class for OBJ model resources
 * OBJ 模型资源的 OBJAsset 类
 */
export class OBJAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.OBJ;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: BABYLON.AssetContainer;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 