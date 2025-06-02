import type { Scene } from "@babylonjs/core";
import { UINode } from "./UINode";
import { Container } from "@babylonjs/gui";
export class UIContainer extends UINode {
    protected _children: UINode[] = [];
    protected _containerControl: Container;
    protected _scene: Scene;

    constructor(name: string, scene: Scene) {
        super(name);
        this._containerControl = new Container();
        this._containerControl.name = name;
        this._control = this._containerControl;
        this._scene = scene;
    }

    // 添加子元素
    addChild(child: UINode): void {
        if (child.parent === this) return;
        
        // 从原父容器移除
        if (child.parent) {
            child.parent = null;
        }
        
        this._children.push(child);
        (child as any)._parent = this;
        if (child.control) {
            this._containerControl.addControl(child.control);
        }
        this.onChildAdded(child);
    }

    // 移除子元素
    removeChild(child: UINode): boolean {
        const index = this._children.indexOf(child);
        if (index >= 0) {
            this._children.splice(index, 1);
            (child as any)._parent = null;
            if (child.control) {
                this._containerControl.removeControl(child.control);
            }
            this.onChildRemoved(child);
            return true;
        }
        return false;
    }

    // 通过名称查找子元素
    findChildByName(name: string, recursive: boolean = false): UINode | null {
        for (const child of this._children) {
            if (child.name === name) {
                return child;
            }
            
            if (recursive && child instanceof UIContainer) {
                const found = child.findChildByName(name, true);
                if (found) return found;
            }
        }
        return null;
    }

    // 获取所有子元素
    get children(): ReadonlyArray<UINode> {
        return this._children;
    }

    // 清空所有子元素
    clearChildren(): void {
        while (this._children.length > 0) {
            this.removeChild(this._children[0]);
        }
    }

    // 设置背景颜色
    setBackground(color: string): void {
        this._containerControl.background = color;
    }

    // 设置透明度
    setAlpha(alpha: number): void {
        this._containerControl.alpha = alpha;
    }

    // 重写dispose方法
    dispose(): void {
        this.clearChildren();
        this._containerControl.dispose();
    }

    // 子类可以重写这些方法
    protected onChildAdded(child: UINode): void {}
    protected onChildRemoved(child: UINode): void {}
}