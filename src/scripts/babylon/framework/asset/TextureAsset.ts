import type { Texture } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * TextureAsset class for texture resources
 * 纹理资源的 TextureAsset 类
 */
export class TextureAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.Texture;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: Texture;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 