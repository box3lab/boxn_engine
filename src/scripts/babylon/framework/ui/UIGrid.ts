import { Rectangle } from "@babylonjs/gui";
import { UINode } from "./UINode";

export enum GridDirection {
    Horizontal,
    Vertical
}

export interface GridLayoutOptions {
    direction: GridDirection;
    spacing: number;
    padding: number;
    wrapEnabled: boolean;
}

export class UIGrid {
    private _rectangle: Rectangle;
    private _children: UINode[] = [];
    private _options: GridLayoutOptions = {
        direction: GridDirection.Horizontal,
        spacing: 5,
        padding: 10,
        wrapEnabled: true
    };

    constructor(name: string, options?: Partial<GridLayoutOptions>) {
        this._rectangle = new Rectangle(name);
        if (options) {
            this._options = { ...this._options, ...options };
        }
    }

    public get rectangle(): Rectangle {
        return this._rectangle;
    }

    public addChild(child: UINode): void {
        if (!child.control) return;
        this._children.push(child);
        this._rectangle.addControl(child.control);
        this.updateLayout();
    }

    public removeChild(child: UINode): void {
        if (!child.control) return;
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            this._rectangle.removeControl(child.control);
            this.updateLayout();
        }
    }

    public setOptions(options: Partial<GridLayoutOptions>): void {
        this._options = { ...this._options, ...options };
        this.updateLayout();
    }

    private updateLayout(): void {
        if (this._children.length === 0) return;

        const { direction, spacing, padding, wrapEnabled } = this._options;
        const availableWidth = this._rectangle.widthInPixels - (padding * 2);
        const availableHeight = this._rectangle.heightInPixels - (padding * 2);

        let currentX = padding;
        let currentY = padding;
        let rowHeight = 0;
        let columnWidth = 0;

        for (const child of this._children) {
            if (!child.control) continue;
            if (direction === GridDirection.Horizontal) {
                if (wrapEnabled && currentX + child.control.widthInPixels > availableWidth + padding) {
                    currentX = padding;
                    currentY += rowHeight + spacing;
                    rowHeight = 0;
                }

                child.control.left = currentX;
                child.control.top = currentY;
                currentX += child.control.widthInPixels + spacing;
                rowHeight = Math.max(rowHeight, child.control.heightInPixels);
            } else {
                if (wrapEnabled && currentY + child.control.heightInPixels > availableHeight + padding) {
                    currentY = padding;
                    currentX += columnWidth + spacing;
                    columnWidth = 0;
                }

                child.control.left = currentX;
                child.control.top = currentY;
                currentY += child.control.heightInPixels + spacing;
                columnWidth = Math.max(columnWidth, child.control.widthInPixels);
            }
        }
    }

    public get children(): UINode[] {
        return [...this._children];
    }

    public clear(): void {
        this._children.forEach(child => {
            if (child.control) {
                this._rectangle.removeControl(child.control);
            }
        });
        this._children = [];
    }
}
