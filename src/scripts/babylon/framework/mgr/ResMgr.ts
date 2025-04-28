import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { type IGameAsset, ResourceStatus, ResourceType } from "../interface/IGameAsset";
import type { Scene } from '@babylonjs/core';
import { Singleton} from '../common/Singleton';

/**
 * LoadingOptions interface for resource loading
 * 资源加载的选项接口
 */
export interface LoadingOptions {
    onProgress?: (progress: number) => void;
    onError?: (error: string) => void;
}

// 资源类型映射
export interface ResourceConstructor<T extends IGameAsset> {
    new(): T;
}

/**
 * ResMgr - Resource Manager class for loading and managing game assets
 * 资源管理器类，用于加载和管理游戏资产
 */
export class ResMgr extends Singleton<ResMgr>(){
    /**
     * 当前场景
     */
    private scene: Scene | null = null;
    /**
     * 资源列表
     */
    private resources: Map<string, IGameAsset> = new Map();

    
    /**
     * Initialize the Resource Manager with a scene
     * 使用场景初始化资源管理器
     * @param scene Babylon.js scene / Babylon.js 场景
     */
    public setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * Load a resource by its URL and type
     * 通过 URL 和类型加载资源
     * @param url Resource URL to load / 要加载的资源 URL
     * @param type Resource type / 资源类型
     * @param options Loading options / 加载选项
     * @param scene Babylon.js scene / Babylon.js 场景
     * @returns Promise resolving to the loaded resource / 解析为加载的资源的 Promise
     */
    public async loadResource<T extends IGameAsset>(
        url: string, 
        type: ResourceConstructor<T>,
        options?: LoadingOptions,
        scene?: Scene
    ): Promise<T> {
        const tempAsset = this.getResource(url);
        if(tempAsset){
            return tempAsset as T;
        }

        // Create the appropriate asset based on type
        const asset = new type();
        asset.url = url;
        asset.status = ResourceStatus.Loading;

        try {
            // Perform the actual loading based on the resource type
            switch (asset.type) {
                case ResourceType.Mesh:
                case ResourceType.GLB:
                case ResourceType.OBJ:
                case ResourceType.BABYLON:
                    return await this.loadMesh(asset, options, scene);
                case ResourceType.Texture:
                    return await this.loadTexture(asset, options, scene);
                case ResourceType.CubeTexture:
                    return await this.loadCubeTexture(asset, options, scene);
                case ResourceType.Material:
                    return await this.loadMaterial(asset, options, scene);
                case ResourceType.Sound:
                    return await this.loadSound(asset, options, scene);
                case ResourceType.Animation:
                    return await this.loadAnimation(asset, options, scene);
                default:
                    throw new Error(`Unsupported resource type: ${asset.type}`);
            }
        } catch (error) {
            asset.status = ResourceStatus.Error;
            asset.error = error instanceof Error ? error.message : String(error);
            options?.onError?.(asset.error);
            throw error;
        }
    }

    /**
     * Get a resource by its ID
     * 通过 ID 获取资源
     * @param id Resource ID to get / 要获取的资源 ID
     * @returns The resource or undefined if not found / 资源或 undefined（如果未找到）
     */
    public getResource<T extends IGameAsset>(id: string): T | undefined {
        return this.resources.get(id) as T | undefined;
    }

    /**
     * Load a mesh resource
     * 加载网格资源
     * @param asset Mesh asset to load / 要加载的网格资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded mesh asset / 解析为加载的网格资源的 Promise
     */
    private async loadMesh<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {
        try {
            const fileExtension = asset.url.split('.').pop()?.toLowerCase();
            let rootUrl = asset.url.substring(0, asset.url.lastIndexOf('/') + 1);
            let filename = asset.url.split('/').pop() || '';

            // Handle direct URLs
            if (!rootUrl) {
                rootUrl = "./";
            }

            // Use the provided scene or the manager's scene
            const currentScene = scene || this.scene!;

            // Load the asset container
            const container = await BABYLON.SceneLoader.LoadAssetContainerAsync(
                rootUrl,
                filename,
                currentScene as any, // Type assertion to resolve compatibility issues
                (progress) => {
                    if (options?.onProgress && progress.lengthComputable) {
                        const progressValue = progress.loaded / progress.total;
                        options.onProgress(progressValue);
                    }
                }
            );

            // Add all meshes to the scene
            // container.addAllToScene();

            // Store the container and meshes in the asset
            asset.data = container;

            asset.status = ResourceStatus.Loaded;
            this.resources.set(asset.id || asset.url, asset);
            return asset;

        } catch (error) {
            asset.status = ResourceStatus.Error;
            asset.error = error instanceof Error ? error.message : String(error);
            options?.onError?.(asset.error);
            throw error;
        }
    }

    /**
     * Load a texture resource
     * 加载纹理资源
     * @param asset Texture asset to load / 要加载的纹理资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded texture asset / 解析为加载的纹理资源的 Promise
     */
    private async loadTexture<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {

        return new Promise((resolve, reject) => {
            try {
              
                const texture = new BABYLON.Texture(
                    asset.url,
                    // @ts-ignore
                    scene?scene:this.scene!,
                    false,
                    true,
                    undefined,
                    () => {
                        asset.data = texture;
                        asset.status = ResourceStatus.Loaded;
                        this.resources.set(asset.id || asset.url, asset);
                        resolve(asset);
                    },
                    (message?: string) => {
                        asset.status = ResourceStatus.Error;
                        asset.error = message || "Unknown texture loading error";
                        options?.onError?.(asset.error);
                        reject(new Error(asset.error));
                    }
                );
                
                // Handle progress through the observable if available
                if (options?.onProgress) {
                    texture.onLoadObservable.add(() => {
                        options.onProgress!(1); // Complete
                    });
                }
            } catch (error) {
                asset.status = ResourceStatus.Error;
                asset.error = error instanceof Error ? error.message : String(error);
                options?.onError?.(asset.error);
                reject(error);
            }
        });
    }

    /**
     * Load a cube texture resource
     * 加载立方体纹理资源
     * @param asset Cube texture asset to load / 要加载的立方体纹理资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded cube texture asset / 解析为加载的立方体纹理资源的 Promise
     */
    private async loadCubeTexture<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {

        return new Promise((resolve, reject) => {
            try {
                const texture = new BABYLON.CubeTexture(
                    asset.url,
                    // @ts-ignore
                    scene?scene:this.scene!,
                    undefined,
                    undefined,
                    undefined,
                    () => {
                        asset.data = texture;
                        asset.status = ResourceStatus.Loaded;
                        this.resources.set(asset.id || asset.url, asset);
                        resolve(asset);
                    },
                    (message?: string) => {
                        asset.status = ResourceStatus.Error;
                        asset.error = message || "Unknown cube texture loading error";
                        options?.onError?.(asset.error);
                        reject(new Error(asset.error));
                    }
                );
            } catch (error) {
                asset.status = ResourceStatus.Error;
                asset.error = error instanceof Error ? error.message : String(error);
                options?.onError?.(asset.error);
                reject(error);
            }
        });
    }

    /**
     * Load a material resource
     * 加载材质资源
     * @param asset Material asset to load / 要加载的材质资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded material asset / 解析为加载的材质资源的 Promise
     */
    private async loadMaterial<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                // 使用当前场景或提供的场景
                // @ts-ignore: 忽略类型不匹配错误
                const currentScene = scene ? scene : this.scene!;
                
                // 获取文件扩展名
                const fileExtension = asset.url.split('.').pop()?.toLowerCase();
                
                if (fileExtension === 'json') {
                    // 加载JSON格式的材质定义
                    fetch(asset.url)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Network response was not ok: ${response.statusText}`);
                            }
                            return response.json();
                        })
                        .then(materialData => {
                            // @ts-ignore: 忽略类型不匹配错误
                            const material = this.createMaterialFromData(materialData, currentScene);
                            
                            asset.data = material;
                            asset.status = ResourceStatus.Loaded;
                            this.resources.set(asset.id || asset.url, asset);
                            
                            if (options?.onProgress) {
                                options.onProgress(1);
                            }
                            
                            resolve(asset);
                        })
                        .catch(error => {
                            asset.status = ResourceStatus.Error;
                            asset.error = error instanceof Error ? error.message : String(error);
                            options?.onError?.(asset.error);
                            reject(error);
                        });
                } else if (fileExtension === 'babylon') {
                    // 加载.babylon文件中的材质
                    // @ts-ignore: 忽略类型不匹配错误
                    BABYLON.SceneLoader.Load("", asset.url, currentScene, () => {
                        // 场景加载完成后，查找具有指定名称的材质
                        const materialName = asset.name || asset.id;
                        const material = currentScene.getMaterialByName(materialName);
                        
                        if (material) {
                            asset.data = material;
                            asset.status = ResourceStatus.Loaded;
                            this.resources.set(asset.id || asset.url, asset);
                            resolve(asset);
                        } else {
                            const error = `Material '${materialName}' not found in '${asset.url}'`;
                            asset.status = ResourceStatus.Error;
                            asset.error = error;
                            options?.onError?.(error);
                            reject(new Error(error));
                        }
                    }, progress => {
                        if (options?.onProgress) {
                            options.onProgress(progress.loaded / progress.total);
                        }
                    }, (scene, message, exception) => {
                        asset.status = ResourceStatus.Error;
                        asset.error = message;
                        options?.onError?.(message);
                        reject(new Error(message));
                    });
                } else {
                    // 直接创建一个标准材质或PBR材质
                    // 基于URL判断材质类型，例如URL包含'pbr'表示PBR材质
                    const isPBR = asset.url.toLowerCase().includes('pbr');
                    
                    let material: BABYLON.Material;
                    if (isPBR) {
                        // @ts-ignore: 忽略类型不匹配错误
                        material = new BABYLON.PBRMaterial(asset.name || "pbr-material", currentScene);
                    } else {
                        // @ts-ignore: 忽略类型不匹配错误
                        material = new BABYLON.StandardMaterial(asset.name || "standard-material", currentScene);
                    }
                    
                    // 尝试加载纹理，如果URL是纹理路径的话
                    if (fileExtension && ["png", "jpg", "jpeg", "bmp", "tga", "tif", "tiff", "dds"].includes(fileExtension)) {
                        // @ts-ignore: 忽略类型不匹配错误
                        const texture = new BABYLON.Texture(asset.url, currentScene, false, true, undefined,
                            () => {
                                // 纹理加载完成后设置材质属性
                                if (isPBR) {
                                    const pbrMaterial = material as BABYLON.PBRMaterial;
                                    pbrMaterial.albedoTexture = texture;
                                } else {
                                    const stdMaterial = material as BABYLON.StandardMaterial;
                                    stdMaterial.diffuseTexture = texture;
                                }
                                
                                asset.data = material;
                                asset.status = ResourceStatus.Loaded;
                                this.resources.set(asset.id || asset.url, asset);
                                
                                if (options?.onProgress) {
                                    options.onProgress(1);
                                }
                                
                                resolve(asset);
                            },
                            (message?: string) => {
                                asset.status = ResourceStatus.Error;
                                asset.error = message || "Unknown texture loading error";
                                options?.onError?.(asset.error);
                                reject(new Error(asset.error));
                            }
                        );
                        
                        // 处理进度
                        if (options?.onProgress) {
                            texture.onLoadObservable.add(() => {
                                // @ts-ignore: 忽略类型不匹配错误
                                options.onProgress(1); // 完成
                            });
                        }
                    } else {
                        // 没有纹理情况下直接返回材质
                        asset.data = material;
                        asset.status = ResourceStatus.Loaded;
                        this.resources.set(asset.id || asset.url, asset);
                        
                        if (options?.onProgress) {
                            options.onProgress(1);
                        }
                        
                        resolve(asset);
                    }
                }
            } catch (error) {
                asset.status = ResourceStatus.Error;
                asset.error = error instanceof Error ? error.message : String(error);
                options?.onError?.(asset.error);
                reject(error);
            }
        });
    }
    
    /**
     * Create material from data object
     * 从数据对象创建材质
     * @param data Material data object / 材质数据对象
     * @param scene Babylon.js scene / Babylon.js 场景
     * @returns Created material / 创建的材质
     */
    // @ts-ignore: 忽略类型不匹配错误
    private createMaterialFromData(data: any, scene: BABYLON.Scene): BABYLON.Material {
        // 根据数据中的类型创建相应的材质
        const materialType = data.type || "standard";
        let material: BABYLON.Material;
        
        if (materialType.toLowerCase() === "pbr") {
            // 创建PBR材质
            // @ts-ignore: 忽略类型不匹配错误
            const pbrMaterial = new BABYLON.PBRMaterial(data.name || "pbr-material", scene);
            
            // 设置PBR材质基本属性
            if (data.albedo) pbrMaterial.albedoColor = BABYLON.Color3.FromArray(data.albedo);
            if (data.metallic !== undefined) pbrMaterial.metallic = data.metallic;
            if (data.roughness !== undefined) pbrMaterial.roughness = data.roughness;
            if (data.alpha !== undefined) pbrMaterial.alpha = data.alpha;
            
            // 加载PBR材质纹理
            // @ts-ignore: 忽略类型不匹配错误
            if (data.albedoTexture) pbrMaterial.albedoTexture = new BABYLON.Texture(data.albedoTexture, scene);
            // @ts-ignore: 忽略类型不匹配错误
            if (data.bumpTexture) pbrMaterial.bumpTexture = new BABYLON.Texture(data.bumpTexture, scene);
            // @ts-ignore: 忽略类型不匹配错误
            if (data.metallicTexture) pbrMaterial.metallicTexture = new BABYLON.Texture(data.metallicTexture, scene);
            
            // 注意: PBRMaterial在某些版本中可能使用不同的属性名称
            // 对于roughnessTexture可能需要使用metallicRoughnessTexture
            if (data.roughnessTexture) {
                // @ts-ignore: PBRMaterial属性兼容性问题
                pbrMaterial.metallicRoughnessTexture = new BABYLON.Texture(data.roughnessTexture, scene);
            }
            
            // @ts-ignore: 忽略类型不匹配错误
            if (data.ambientTexture) pbrMaterial.ambientTexture = new BABYLON.Texture(data.ambientTexture, scene);
            
            // 环境纹理和反射纹理
            if (data.environmentTexture) {
                // @ts-ignore: 忽略类型不匹配错误
                const envTex = data.environmentTexture.isCube 
                    // @ts-ignore: 忽略类型不匹配错误
                    ? new BABYLON.CubeTexture(data.environmentTexture.url, scene)
                    // @ts-ignore: 忽略类型不匹配错误
                    : new BABYLON.Texture(data.environmentTexture.url, scene);
                
                // @ts-ignore: PBRMaterial属性兼容性问题
                pbrMaterial.environmentTexture = envTex;
            }
            
            material = pbrMaterial;
        } else {
            // 创建标准材质
            // @ts-ignore: 忽略类型不匹配错误
            const stdMaterial = new BABYLON.StandardMaterial(data.name || "standard-material", scene);
            
            // 设置标准材质基本属性
            if (data.diffuse) stdMaterial.diffuseColor = BABYLON.Color3.FromArray(data.diffuse);
            if (data.specular) stdMaterial.specularColor = BABYLON.Color3.FromArray(data.specular);
            if (data.emissive) stdMaterial.emissiveColor = BABYLON.Color3.FromArray(data.emissive);
            if (data.ambient) stdMaterial.ambientColor = BABYLON.Color3.FromArray(data.ambient);
            if (data.specularPower !== undefined) stdMaterial.specularPower = data.specularPower;
            if (data.alpha !== undefined) stdMaterial.alpha = data.alpha;
            
            // 加载标准材质纹理
            if (data.diffuseTexture) {
                // @ts-ignore: 忽略类型不匹配错误
                stdMaterial.diffuseTexture = new BABYLON.Texture(data.diffuseTexture.url || data.diffuseTexture, scene);
                if (data.diffuseTexture.hasAlpha) {
                    // @ts-ignore: 忽略类型不匹配错误
                    stdMaterial.diffuseTexture.hasAlpha = true;
                }
            }
            
            if (data.specularTexture) stdMaterial.specularTexture = new BABYLON.Texture(data.specularTexture, scene);
            if (data.bumpTexture) stdMaterial.bumpTexture = new BABYLON.Texture(data.bumpTexture, scene);
            if (data.emissiveTexture) stdMaterial.emissiveTexture = new BABYLON.Texture(data.emissiveTexture, scene);
            if (data.ambientTexture) stdMaterial.ambientTexture = new BABYLON.Texture(data.ambientTexture, scene);
            if (data.opacityTexture) stdMaterial.opacityTexture = new BABYLON.Texture(data.opacityTexture, scene);
            
            // 反射纹理
            if (data.reflectionTexture) {
                if (data.reflectionTexture.isCube) {
                    // @ts-ignore: 忽略类型不匹配错误
                    stdMaterial.reflectionTexture = new BABYLON.CubeTexture(data.reflectionTexture.url, scene);
                } else {
                    // @ts-ignore: 忽略类型不匹配错误
                    stdMaterial.reflectionTexture = new BABYLON.Texture(data.reflectionTexture.url, scene);
                    // 设置坐标模式
                    if (data.reflectionTexture.coordinatesMode && stdMaterial.reflectionTexture) {
                        const mode = data.reflectionTexture.coordinatesMode.toUpperCase();
                        if (mode === "SPHERICAL" && stdMaterial.reflectionTexture) stdMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
                        else if (mode === "PLANAR" && stdMaterial.reflectionTexture) stdMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
                        else if (mode === "CUBIC" && stdMaterial.reflectionTexture) stdMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.CUBIC_MODE;
                        else if (mode === "PROJECTION" && stdMaterial.reflectionTexture) stdMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PROJECTION_MODE;
                    }
                }
            }
            
            // 其他属性
            if (data.wireframe !== undefined) stdMaterial.wireframe = data.wireframe;
            if (data.backFaceCulling !== undefined) stdMaterial.backFaceCulling = data.backFaceCulling;
            
            material = stdMaterial;
        }
        
        return material;
    }

    /**
     * Load a sound resource
     * 加载声音资源
     * @param asset Sound asset to load / 要加载的声音资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded sound asset / 解析为加载的声音资源的 Promise
     */
    private async loadSound<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {

        return new Promise((resolve, reject) => {
            try {
                // Check if audio engine is unlocked
                const audioEngine = BABYLON.Engine.audioEngine;
                if (audioEngine && !audioEngine.unlocked) {
                    audioEngine.unlock();
                }

                // Create the sound
                const sound = new BABYLON.Sound(
                    asset.name || "sound",
                    asset.url,
                    // @ts-ignore
                    scene?scene:this.scene!,
                    () => {
                        // On ready callback
                        asset.data = sound;
                        asset.status = ResourceStatus.Loaded;
                        this.resources.set(asset.id || asset.url, asset);
                        resolve(asset);
                    },
                    {
                        autoplay: false,
                        loop: false
                    }
                );

                // Register for unlocked observable if needed
                if (audioEngine && !audioEngine.unlocked) {
                    audioEngine.onAudioUnlockedObservable.addOnce(() => {
                        if (asset.status !== ResourceStatus.Loaded) {
                            asset.data = sound;
                            asset.status = ResourceStatus.Loaded;
                            resolve(asset);
                        }
                    });
                }
            } catch (error) {
                asset.status = ResourceStatus.Error;
                asset.error = error instanceof Error ? error.message : String(error);
                options?.onError?.(asset.error);
                reject(error);
            }
        });
    }

    /**
     * Load an animation resource
     * 加载动画资源
     * @param asset Animation asset to load / 要加载的动画资源
     * @param options Loading options / 加载选项
     * @returns Promise resolving to the loaded animation asset / 解析为加载的动画资源的 Promise
     */
    private async loadAnimation<T extends IGameAsset>(asset: T, options?: LoadingOptions, scene?: Scene): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                // 判断文件类型
                const fileExtension = asset.url.split('.').pop()?.toLowerCase();
                
                // 使用当前场景或提供的场景
                // @ts-ignore: 忽略类型不匹配错误
                const currentScene = scene ? scene : this.scene!;
                
                // 处理不同类型的动画文件
                if (fileExtension === 'json') {
                    // 使用 Animation.ParseFromFileAsync 加载 JSON 格式的动画文件
                    // @ts-ignore: 忽略类型不匹配错误
                    BABYLON.Animation.ParseFromFileAsync("", asset.url)
                        .then((animations) => {
                            // 保存解析出的动画数据
                            asset.data = animations;
                            asset.status = ResourceStatus.Loaded;
                            this.resources.set(asset.id || asset.url, asset);
                            resolve(asset);
                        })
                        .catch((error) => {
                            asset.status = ResourceStatus.Error;
                            asset.error = error instanceof Error ? error.message : String(error);
                            options?.onError?.(asset.error);
                            reject(error);
                        });
                } else if (fileExtension === 'glb' || fileExtension === 'gltf') {
                    // 对于 glb/gltf 文件，使用 SceneLoader.ImportMesh 加载，然后提取动画组
                    let rootUrl = asset.url.substring(0, asset.url.lastIndexOf('/') + 1);
                    let filename = asset.url.split('/').pop() || '';

                    // 处理直接 URL
                    if (!rootUrl) {
                        rootUrl = "./";
                    }

                    // @ts-ignore: 忽略类型不匹配错误
                    BABYLON.SceneLoader.ImportMesh(
                        "",
                        rootUrl,
                        filename,
                        // @ts-ignore: 忽略类型不匹配错误
                        currentScene,
                        (meshes, particleSystems, skeletons, animationGroups) => {
                            // 保存动画组数据
                            asset.data = animationGroups;
                            asset.status = ResourceStatus.Loaded;
                            this.resources.set(asset.id || asset.url, asset);
                            resolve(asset);
                        },
                        undefined,
                        (scene, message) => {
                            asset.status = ResourceStatus.Error;
                            asset.error = message;
                            options?.onError?.(message);
                            reject(new Error(message));
                        }
                    );
                } else {
                    // 不支持的文件类型
                    throw new Error(`Unsupported animation file type: ${fileExtension}`);
                }
            } catch (error) {
                asset.status = ResourceStatus.Error;
                asset.error = error instanceof Error ? error.message : String(error);
                options?.onError?.(asset.error);
                reject(error);
            }
        });
    }

   
    /**
     * Unload a resource, freeing its memory
     * 卸载资源，释放其内存
     * @param id Resource ID to unload / 要卸载的资源 ID
     */
    public unloadResource(id: string): void {
        const resource = this.resources.get(id);
        if (!resource) {
            console.warn(`Resource with ID ${id} not found.`);
            return;
        }

        if (resource.data) {
            if (typeof resource.data.dispose === 'function') {
                resource.data.dispose();
            }
            resource.data = undefined;
        }

        resource.status = ResourceStatus.NotLoaded;
        console.log(`Resource '${resource.name}' unloaded.`);
    }

    /**
     * Dispose the Resource Manager and all resources
     * 销毁资源管理器和所有资源
     */
    public dispose(): void {
        // Unload all resources
        for (const [id, _] of this.resources) {
            this.unloadResource(id);
        }

        // Clear resources map
        this.resources.clear();
        this.scene = null;

        console.log("Resource Manager disposed.");
    }
}
