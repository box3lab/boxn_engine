import type { Mesh, Scene } from "@babylonjs/core";
import type { IGameEntity } from "../interface/IGameEntity";
import { BaseComponent } from "./BaseComponent";
import { ResMgr } from "../mgr/ResMgr";
import { GLBAsset } from "../asset/GLBAsset";

export class StaticMeshComponent extends BaseComponent {
    private instancedContainer: BABYLON.InstantiatedEntries | undefined;
    private meshAssets: GLBAsset | undefined;
    private isBind: boolean = false;

    attachTo(gameEntity: IGameEntity): void {
        super.attachTo(gameEntity);
        if(!this.isBind){
            this.bindMesh();
            this.isBind = true;
        }
    }
    detach(): void {
    }
    update?(deltaTime: number): void {
    }
    dispose(): void {
        if(this.meshAssets &&this.instancedContainer){
            this.instancedContainer.dispose();
            this.meshAssets.refCount--;
        }
    }

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

    private bindMesh(){
        if(!this.instancedContainer) return;
        for(let i = 0; i < this.instancedContainer.rootNodes.length; i++){
            const node = this.instancedContainer.rootNodes[i];
            // @ts-ignore
            node.parent = this.entity?.transform;
        }
    }
}