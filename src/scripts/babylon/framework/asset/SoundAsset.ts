import type { Sound } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * SoundAsset class for sound resources
 * 声音资源的 SoundAsset 类
 */
export class SoundAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.Sound;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: Sound;
    error?: string;
    tags?: string[];
    dependencies?: string[];
} 