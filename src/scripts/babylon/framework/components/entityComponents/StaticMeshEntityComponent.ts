import { GLBAsset } from "../../asset/GLBAsset";
import type { IGameEntity } from "../../interface/IGameEntity";
import { BaseEntityComponent } from "./BaseEntityComponent";
import type { Scene } from "@babylonjs/core";
import { ResMgr } from "../../mgr/ResMgr";

/**
 * Component for handling static mesh entities in the game
 * This component manages the loading, instantiation, and lifecycle of static mesh assets
 * 
 * 用于处理游戏中静态网格实体的组件
 * 该组件管理静态网格资源的加载、实例化和生命周期
 */
export class StaticMeshEntityComponent extends BaseEntityComponent {
    // Instance container for the mesh - stores the instantiated mesh data
    // Used to manage multiple instances of the same mesh efficiently
    // 网格的实例容器 - 存储实例化后的网格数据
    // 用于高效管理同一网格的多个实例
    private instancedContainer: BABYLON.InstantiatedEntries | undefined;
    
    // Mesh asset reference - holds the loaded GLB asset data
    // Contains the original mesh data and metadata
    // 网格资源引用 - 保存加载的GLB资源数据
    // 包含原始网格数据和元数据
    private meshAssets: GLBAsset | undefined;
    
    // Flag indicating if mesh is bound to entity - prevents duplicate binding
    // Ensures proper initialization and prevents memory leaks
    // 标记网格是否已绑定到实体 - 防止重复绑定
    // 确保正确初始化并防止内存泄漏
    private isBind: boolean = false;

    /**
     * Attaches component to game entity and binds mesh if not already bound
     * This method ensures the mesh is properly connected to the entity's transform
     * and maintains proper component hierarchy
     * 
     * 将组件附加到游戏实体，如果尚未绑定则绑定网格
     * 此方法确保网格正确连接到实体的变换
     * 并维护正确的组件层次结构
     * 
     * @param gameEntity - The game entity to attach to - 要附加的游戏实体
     */
    attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        if(!this.isBind){
            this.bindMesh();
            this.isBind = true;
        }
    }

    /**
     * Cleans up resources and decrements reference count
     * This method is called when the component is disposed to prevent memory leaks
     * and properly release mesh resources
     * 
     * 清理资源并减少引用计数
     * 当组件被销毁时调用此方法以防止内存泄漏
     * 并正确释放网格资源
     */
    dispose(): void {
        super.dispose();
        if(this.meshAssets &&this.instancedContainer){
            this.instancedContainer.dispose();
            this.meshAssets.refCount--;
        }
    }

    /**
     * Adds a mesh to the component by loading from URL
     * This method handles the asynchronous loading and instantiation of mesh assets
     * and manages the resource lifecycle
     * 
     * 通过从URL加载向组件添加网格
     * 此方法处理网格资源的异步加载和实例化
     * 并管理资源生命周期
     * 
     * @param url - URL of the mesh asset - 网格资源的URL
     * @param scene - Optional scene reference - 可选的场景引用
     */
    public addMesh(url:string, scene?:Scene){
        ResMgr.instance.loadResource(url, GLBAsset,undefined,scene).then((mesh: GLBAsset) => {
                if(!mesh) return;
                this.meshAssets = mesh;
                const container = this.meshAssets.data;
                if(container){
                    // Instantiate the mesh and add to scene
                    // This creates a new instance of the mesh in the scene
                    // and sets up proper resource management
                    // 
                    // 实例化网格并添加到场景
                    // 在场景中创建网格的新实例
                    // 并设置适当的资源管理
                    this.instancedContainer = container.instantiateModelsToScene();
                    this.meshAssets.refCount++;
                    if(this.entity){
                        this.bindMesh();
                        this.isBind = true;
                    }
                }
        });
    }

    /**
     * Binds mesh to entity's transform for proper positioning and rotation
     * This method sets up the parent-child relationship between the mesh and entity
     * and ensures proper transform hierarchy
     * 
     * 将网格绑定到实体的变换以实现正确的定位和旋转
     * 此方法设置网格和实体之间的父子关系
     * 并确保正确的变换层次结构
     */
    private bindMesh(){
        if(!this.instancedContainer) return;
        for(let i = 0; i < this.instancedContainer.rootNodes.length; i++){
            const node = this.instancedContainer.rootNodes[i];
            // @ts-ignore
            node.parent = this.transform;
        }
    }
}