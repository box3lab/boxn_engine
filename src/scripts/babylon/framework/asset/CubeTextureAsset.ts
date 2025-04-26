import type { CubeTexture } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * CubeTextureAsset class for cube texture resources
 * 立方体纹理资源的 CubeTextureAsset 类
 */
export class CubeTextureAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.CubeTexture;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: CubeTexture;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 