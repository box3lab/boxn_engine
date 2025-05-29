import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Singleton } from "../common/Singleton";
import type { UINode } from "../ui/UINode";
import { UIContainer } from "../ui/UIContainer";
import { Scene } from "@babylonjs/core";
import type { Nullable } from "babylonjs";
import * as GUI from "@babylonjs/gui";

/**
 * 场景UI状态 / Scene UI State
 */
export interface SceneUIState {
    advancedTexture: AdvancedDynamicTexture;  // 高级动态纹理 / Advanced Dynamic Texture
    rootContainer: UIContainer;               // 根容器 / Root Container
    elements: Map<string, UINode>;            // 按名称存储的UI元素 / UI elements stored by name
}

/**
 * UIMgr - UI Manager class that handles UI elements
 * 界面管理器类，用于处理界面元素
 */
export class UIMgr extends Singleton<UIMgr>(){
    private _currentScene: Scene | null = null;                                    // 当前场景 / Current scene
    private _sceneStates: Map<Scene, SceneUIState> = new Map();                   // 场景状态映射 / Scene state mapping
    
    /**
     * 初始化场景UI / Initialize scene UI
     * @param scene 目标场景 / Target scene
     */
    public initializeForScene(scene: Scene): void {
        if (this._sceneStates.has(scene)) return;
        
        // 创建全屏UI / Create fullscreen UI
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI_" + scene.uid, true, scene);
        const rootContainer = new UIContainer("RootContainer_" + scene.uid, scene);
        if (rootContainer.control) {
            advancedTexture.addControl(rootContainer.control);
        }
        
        this._sceneStates.set(scene, {
            advancedTexture,
            rootContainer,
            elements: new Map()
        });
        
        // 场景销毁时清理UI / Clean up UI when scene is disposed
        scene.onDisposeObservable.add(() => {
            this.cleanupScene(scene);
        });
    }
    
    /**
     * 清理场景UI / Clean up scene UI
     * @param scene 目标场景 / Target scene
     */
    public cleanupScene(scene: Scene): void {
        const state = this._sceneStates.get(scene);
        if (state) {
            state.rootContainer.dispose();
            state.advancedTexture.dispose();
            state.elements.clear();
            this._sceneStates.delete(scene);
        }
        
        if (this._currentScene === scene) {
            this._currentScene = null;
        }
    }

    /**
     * 获取场景UI状态 / Get scene UI state
     * @param scene 目标场景 / Target scene
     * @returns 场景UI状态 / Scene UI state
     */
    public getSceneUIState(scene: Scene): Nullable<SceneUIState> {
        return this._sceneStates.get(scene) || null;
    }
    
    /**
     * 设置当前场景 / Set current scene
     * @param scene 目标场景 / Target scene
     */
    public setCurrentScene(scene: Scene): void {
        if (!this._sceneStates.has(scene)) {
            this.initializeForScene(scene);
        }
        this._currentScene = scene;
    }
    
    /**
     * 获取当前场景的根容器 / Get root container of current scene
     * @returns 根容器或null / Root container or null
     */
    public get root(): UIContainer | null {
        if (!this._currentScene) return null;
        return this._sceneStates.get(this._currentScene)?.rootContainer || null;
    }
    
    /**
     * 添加UI元素到当前场景 / Add UI element to current scene
     * @param element UI元素 / UI element
     * @param scene 目标场景（可选）/ Target scene (optional)
     * @returns 是否添加成功 / Whether the addition was successful
     */
    public addElement(element: UINode, scene?: Scene): boolean {
        const targetScene = scene || this._currentScene;
        if (!targetScene) return false;
        
        const state = this._sceneStates.get(targetScene);
        if (!state) return false;
        
        if (state.elements.has(element.name)) {
            console.warn(`UI element with name '${element.name}' already exists in scene`);
            return false;
        }
        
        state.rootContainer.addChild(element);
        state.elements.set(element.name, element);
        return true;
    }
    
    /**
     * 从当前场景移除UI元素 / Remove UI element from current scene
     * @param element UI元素 / UI element
     * @param scene 目标场景（可选）/ Target scene (optional)
     * @returns 是否移除成功 / Whether the removal was successful
     */
    public removeElement(element: UINode, scene?: Scene): boolean {
        const targetScene = scene || this._currentScene;
        if (!targetScene) return false;
        
        const state = this._sceneStates.get(targetScene);
        if (!state) return false;
        
        if (state.rootContainer.removeChild(element)) {
            state.elements.delete(element.name);
            return true;
        }
        return false;
    }
    
    /**
     * 通过名称查找UI元素 / Find UI element by name
     * @param name 元素名称 / Element name
     * @param scene 目标场景（可选）/ Target scene (optional)
     * @returns 找到的UI元素或null / Found UI element or null
     */
    public findElementByName(name: string, scene?: Scene): UINode | null {
        const targetScene = scene || this._currentScene;
        if (!targetScene) return null;
        
        const state = this._sceneStates.get(targetScene);
        if (!state) return null;
        
        // 先在缓存中查找 / First search in cache
        const cached = state.elements.get(name);
        if (cached) return cached;
        
        // 递归查找 / Recursive search
        return state.rootContainer.findChildByName(name, true);
    }
    
    /**
     * 清空当前场景的所有UI元素 / Clear all UI elements of current scene
     * @param scene 目标场景（可选）/ Target scene (optional)
     */
    public clear(scene?: Scene): void {
        const targetScene = scene || this._currentScene;
        if (!targetScene) return;
        
        const state = this._sceneStates.get(targetScene);
        if (state) {
            state.rootContainer.clearChildren();
            state.elements.clear();
        }
    }
    
    /**
     * 显示/隐藏整个场景的UI / Show/hide UI of entire scene
     * @param visible 是否可见 / Whether to show
     * @param scene 目标场景（可选）/ Target scene (optional)
     */
    public setUIVisible(visible: boolean, scene?: Scene): void {
        const targetScene = scene || this._currentScene;
        if (!targetScene) return;
        
        const state = this._sceneStates.get(targetScene);
        if (state) {
            state.rootContainer.isVisible = visible;
        }
    }
}