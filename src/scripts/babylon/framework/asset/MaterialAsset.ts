import type { Material } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * MaterialAsset class for material resources
 * 材质资源的 MaterialAsset 类
 */
export class MaterialAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.Material;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: Material;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 