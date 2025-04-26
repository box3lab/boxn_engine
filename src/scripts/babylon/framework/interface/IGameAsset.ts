/**
 * Resource type enum for different types of resources
 * 资源类型枚举，用于不同类型的资源
 */
export enum ResourceType {
    Mesh = "mesh",
    Texture = "texture",
    CubeTexture = "cubeTexture",
    Material = "material",
    Sound = "sound",
    Animation = "animation",
    GLB = "glb",
    OBJ = "obj",
    BABYLON = "babylon"
}

/**
 * Resource status enum
 * 资源状态枚举
 */
export enum ResourceStatus {
    NotLoaded = "notLoaded",
    Loading = "loading",
    Loaded = "loaded",
    Error = "error",
    NONE = "NONE"
}

/**
 * Interface for resource metadata
 * 资源元数据接口
 */
export interface IGameAsset {
    id: string;                   // Unique resource identifier / 唯一资源标识符
    name: string;                 // Display name / 显示名称
    type: ResourceType;           // Resource type / 资源类型
    url: string;                  // Resource URL / 资源URL
    status: ResourceStatus;       // Current status / 当前状态
    refCount: number;             // Reference count / 引用计数
    data?: any;                   // The loaded resource / 加载的资源
    error?: string;               // Error message if loading failed / 加载失败时的错误消息
    tags?: string[];              // Optional tags for grouping resources / 用于对资源进行分组的可选标签
    dependencies?: string[];      // Optional dependencies (other resource IDs) / 可选依赖项（其他资源ID）
}
