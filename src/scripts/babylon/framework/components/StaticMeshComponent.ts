import type { Mesh, Scene } from "@babylonjs/core";
import type { IGameEntity } from "../interface/IGameEntity";
import { BaseComponent } from "./BaseComponent";
import { ResMgr } from "../mgr/ResMgr";
import { GLBAsset } from "../asset/GLBAsset";

/**
 * 静态网格组件 / Static Mesh Component
 * 用于加载和显示静态3D模型 / Used for loading and displaying static 3D models
 */
export class StaticMeshComponent extends BaseComponent {
    // 实例化容器 / Instantiated container
    private instancedContainer: BABYLON.InstantiatedEntries | undefined;
    // 网格资源 / Mesh asset
    private meshAssets: GLBAsset | undefined;
    // 是否已绑定 / Whether the mesh is bound
    private isBind: boolean = false;

    /**
     * 附加到游戏实体 / Attach to game entity
     * @param gameEntity 游戏实体 / Game entity
     */
    attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        if(!this.isBind){
            this.bindMesh();
            this.isBind = true;
        }
    }

    /**
     * 分离组件 / Detach component
     */
    detach(): void {
    }

    /**
     * 更新组件 / Update component
     * @param deltaTime 时间增量 / Time delta
     */
    update(deltaTime: number): void {
    }

    /**
     * 释放资源 / Dispose resources
     */
    dispose(): void {
        if(this.meshAssets &&this.instancedContainer){
            this.instancedContainer.dispose();
            this.meshAssets.refCount--;
        }
    }

    /**
     * 添加网格模型 / Add mesh model
     * @param url 模型资源URL / Model resource URL
     * @param scene 场景引用 / Scene reference
     */
    public addMesh(url:string, scene?:Scene){
        ResMgr.instance.loadResource(url, GLBAsset,undefined,scene).then((mesh: GLBAsset) => {
                if(!mesh) return;
                this.meshAssets = mesh;
                const container = this.meshAssets.data;
                if(container){
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
     * 绑定网格到实体 / Bind mesh to entity
     */
    private bindMesh(){
        if(!this.instancedContainer) return;
        for(let i = 0; i < this.instancedContainer.rootNodes.length; i++){
            const node = this.instancedContainer.rootNodes[i];
            // @ts-ignore
            node.parent = this.entity?.transform;
        }
    }
}