import { TransformNode, type AnimationGroup, type Mesh, type Scene, type Skeleton, Vector3 } from "@babylonjs/core";
import type { IGameEntity } from "../../interface/IGameEntity";
import { BaseComponent } from "../BaseComponent";
import { ResMgr } from "../../mgr/ResMgr";
import { GLBAsset } from "../../asset/GLBAsset";

/**
 * 骨骼网格组件 / Skeleton Mesh Component
 * 用于加载和显示骨骼动画的3D模型 / Used for loading and displaying 3D models with skeleton animations
 */
export class SkeletonMeshComponent extends BaseComponent {
    // 实例化容器 / Instantiated container
    private instancedContainer: BABYLON.InstantiatedEntries | undefined;
    // 网格资源 / Mesh asset
    private meshAssets: GLBAsset | undefined;
    // 是否已绑定 / Whether the mesh is bound
    private isBind: boolean = false;
    // 是否已加载 / Whether the mesh is loaded
    private _isLoaded: boolean = false;
    // 加载回调 / Load callback
    private loadedCallbacks: Array<() => void> = [];

    // 获取是否已加载 / Get whether the mesh is loaded
    public get isLoaded(): boolean {
        return this._isLoaded;
    }

    /**
     * 网格根节点 / Mesh root node
     */
    public meshRoot: TransformNode | undefined;

    private _meshs: Map<string, TransformNode> = new Map();
    // 获取网格 / Get meshes
    public get meshes(): Map<string, TransformNode> {
        return this._meshs;
    }   

    // 动画组 / Animation groups
    private _animationGroups: Map<string, AnimationGroup> = new Map();
    // 获取动画组 / Get animation groups
    public get animationGroups(): Map<string, AnimationGroup> {
        return this._animationGroups;
    }
    // 骨骼 / Skeletons
    private _skeletons: Map<string, Skeleton> = new Map();
    // 获取骨骼 / Get skeletons
    public get skeletons(): Map<string, Skeleton> {
        return this._skeletons;
    }

    // 缩放 / Scale     
    private _scale: number = 1;

    // 获取缩放 / Get scale
    public get scale(): number {
        return this._scale;
    }

    // 设置缩放 / Set scale
    public set scale(value: number) {
        this._scale = value;
        if(this.isLoaded){
            this._meshs.forEach(mesh => {
                mesh.scaling.scaleInPlace(value);
            });
        }else{
            this.onLoaded(() => {
                this._meshs.forEach(mesh => {
                    mesh.scaling.scaleInPlace(value);
                });
            });
        }
    }

    /**
     * 构造函数 / Constructor
     * @param name 名称 / Name
     * @param url 模型资源URL / Model resource URL
     * @param scene 场景引用 / Scene reference
     * @param hideOriginalMesh 是否隐藏原始网格(用于mixamo模型) / Whether to hide the original mesh(for mixamo model)
     */ 
    constructor(name: string, url?: string, scene?: Scene, hideOriginalMesh:boolean = false) {
        super(name);
        this.meshRoot = new TransformNode(name, scene);
        if(url && scene){
            this.addMesh(url, scene, hideOriginalMesh);
        }
    }

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
            this._meshs.clear();
            this._animationGroups.clear();
            this._skeletons.clear();
            this.meshAssets.refCount--;
        }
    }

    /**
     * 添加网格模型 / Add mesh model
     * @param url 模型资源URL / Model resource URL
     * @param scene 场景引用 / Scene reference
     */
    public addMesh(url:string, scene:Scene,hideOriginalMesh:boolean = false){
        ResMgr.instance.loadResource(url, GLBAsset,undefined,scene).then((mesh: GLBAsset) => {
                if(!mesh) return;
                this.meshAssets = mesh;
                const container = this.meshAssets.data;
                if(hideOriginalMesh && container){
                    container.meshes.forEach((item) => {
                        if(item.name === "Alpha_Surface" || item.name === "Alpha_Joints"){
                            item.isVisible = false;
                        }
                    });
                }
                if(container){
                    container.meshes.forEach(mesh => {
                        // @ts-ignore
                        mesh.scaling.scaleInPlace(10);
                    });

                    this.instancedContainer = container.instantiateModelsToScene();
                    this.meshAssets.refCount++;
                    if(this.entity){
                        this.bindMesh();
                        this._isLoaded = true;
                    }

                    this.instancedContainer.rootNodes.forEach(mesh => {
                        // @ts-ignore
                        this._meshs.set(mesh.name, mesh);
                    });
                    
                    this.instancedContainer.animationGroups.forEach(anim => {
                        // @ts-ignore
                        this._animationGroups.set(anim.name.replace("Clone of ",""), anim);
                    });
                    // console.log("this._animationGroups",this._animationGroups);
                    this.instancedContainer.skeletons.forEach(skeleton => {
                        // @ts-ignore
                        this._skeletons.set(skeleton.name, skeleton);
                    });

                    this.loadedCallbacks.forEach(callback => {
                        callback();
                    });
                    this.loadedCallbacks = [];
                }
        });
    }

    /**
     * 绑定网格到实体 / Bind mesh to entity
     */
    private bindMesh(){
        if(!this.instancedContainer || !this.entity) return;
        const entityRoot = this.entity.getRoot().root;
        if(entityRoot){
            this.meshRoot!.parent = entityRoot;
            this.meshRoot!.position = Vector3.Zero();
            for(let i = 0; i < this.instancedContainer.rootNodes.length; i++){
                const node = this.instancedContainer.rootNodes[i];
                //@ts-ignore
                node.parent = this.meshRoot;
            }
        }
    }

    /**
     * 加载回调 / Load callback
     * @param callback 回调 / Callback
     */
    public onLoaded(callback: () => void){
        this.loadedCallbacks.push(callback);
    }
}