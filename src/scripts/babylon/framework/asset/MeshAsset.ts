import type { AbstractMesh } from "babylonjs";
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";

/**
 * MeshAsset class for mesh resources
 * 网格资源的 MeshAsset 类
 */
export class MeshAsset implements IGameAsset {
    id: string = '';
    name: string = '';
    type: ResourceType = ResourceType.Mesh;
    url: string = '';
    status: ResourceStatus = ResourceStatus.NotLoaded;
    refCount: number = 0;
    data?: AbstractMesh[];
    error?: string;
    tags?: string[];
    dependencies?: string[];
}