const FRAME_COLOR = 0x0099ff;

const app = new PIXI.Application({
    background: "#000000",
    resizeTo: window
});

document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

const bg = new PIXI.Graphics();
bg.eventMode = "static";
bg.beginFill("#f5f5f5", 1);
bg.drawRect(0, 0, window.innerWidth, window.innerHeight);
bg.endFill();

bg.on("pointerdown", () => {
    select();
});

function select() {
    scene.children.forEach(c => {
        c.reset(false);
    });
}

container.addChild(bg);

const scene = new PIXI.Container();
container.addChild(scene);

//////////////////////////////////////////////////////////////////////////////////////////////////////

class Rect extends PIXI.Container {
    constructor(x, y, width, height, controlsSize, rectColor) {
        super();

        this.rectColor = rectColor;
        this.isOnRectDown = false;
        this.onDownPos = {};
        this.prevRectPos = {};
        this.rectPoints = [];
        this.controls = [];
        this.activeControl = null;
        this.activeControlEvent = null;

        addEventListener("pointermove", event => this.update());

        // create shapes
        this.createRect();
        this.createControl(x, y, controlsSize);
        this.createControl(x + width, y, controlsSize);
        this.createControl(x + width, y + height, controlsSize);
        this.createControl(x, y + height, controlsSize);
        this.drawRect();
    }

    reset(isActive) {
        this.onRectLeave();
    }

    createRect() {
        this.rect = new PIXI.Graphics();
        this.rect.eventMode = "static";
        this.rect.on("pointerdown", this.onRectDown);
        this.rect.on("pointerup", this.onRectUp);
        this.rect.on("pointermove", this.onRectMove);
        this.addChild(this.rect);
    }

    createControl(x, y, radius) {
        const control = new PIXI.Graphics();
        control.lineStyle(0);
        control.beginFill(FRAME_COLOR);
        control.drawCircle(0, 0, radius);
        control.cursor = "pointer";
        control.position.set(x, y);
        control.alpha = 0;

        control.on("pointerenter", this.onRectEnter);
        control.on("pointerdown", this.onControlDown, control);
        control.on("pointerup", this.onControlUp);

        this.controls.push(control);
        this.addChild(control);
    }

    drawRect(drawFrame) {
        this.rect.clear();

        // update rect points position
        for (let i = 0, j = 0; i < this.controls.length; i++, j += 2) {
            const control = this.controls[i];
            this.rectPoints[j] = control.position.x;
            this.rectPoints[j + 1] = control.position.y;
        }

        this.rect.lineStyle(drawFrame ? 1 : 0, FRAME_COLOR);
        this.rect.beginFill(this.rectColor, 1);
        this.rect.drawPolygon(this.rectPoints);
        this.rect.endFill();
    }

    onRectEnter() {
        if (!this.isOnRectDown) return;
        this.parent.drawRect(true);
        this.parent.controls.forEach(c => c.alpha = 1);
    }

    onRectDown(event) {
        this.parent.onSelect();
        this.parent.drawRect(true);
        this.parent.controls.forEach(c => {
            c.alpha = 1;
            c.eventMode = "static";
        });
        this.parent.isOnRectDown = true;
        this.parent.onDownPos = { ...event.client };
        this.parent.prevRectPos = {
            x: this.parent.position.x,
            y: this.parent.position.y
        };
    }

    onRectMove(event) {
        if (!this.parent.isOnRectDown) return;

        this.parent.position.set(
            this.parent.prevRectPos.x + (event.client.x - this.parent.onDownPos.x),
            this.parent.prevRectPos.y + (event.client.y - this.parent.onDownPos.y)
        );
    }

    onRectUp() {
        this.parent.isOnRectDown = false;
    }

    onRectLeave() {
        this.isOnRectDown = false;
        this.drawRect(false);

        if (this.activeControl) return;

        this.controls.forEach(c => {
            c.alpha = 0;
            c.eventMode = "none";
        });
    }

    onControlDown(activeControlEvent) {
        this.parent.activeControl = this;
        this.parent.activeControlEvent = activeControlEvent;
    }

    update() {
        if (!(this.activeControl || this.activeControlEvent)) return;

        this.drawRect(true)

        this.activeControl.position.set(this.activeControlEvent.client.x - this.position.x,
            this.activeControlEvent.client.y - this.position.y);

        let id = null;

        for (let i = 0; i < this.controls.length; i++) {
            if (this.controls[i] === this.activeControl) {
                id = i;
                break;
            }
        }

        switch (id) {
            case 0:
                this.controls[1].position.set(this.controls[1].position.x,
                    this.activeControlEvent.client.y - this.position.y);
                this.controls[3].position.set(this.activeControlEvent.client.x - this.position.x,
                    this.controls[3].position.y);
                break;

            case 1:
                this.controls[0].position.set(this.controls[0].position.x,
                    this.activeControlEvent.client.y - this.position.y);
                this.controls[2].position.set(this.activeControlEvent.client.x - this.position.x,
                    this.controls[2].position.y);
                break;

            case 2:
                this.controls[3].position.set(this.controls[3].position.x,
                    this.activeControlEvent.client.y - this.position.y);
                this.controls[1].position.set(this.activeControlEvent.client.x - this.position.x,
                    this.controls[1].position.y);
                break;

            case 3:
                this.controls[2].position.set(this.controls[2].position.x,
                    this.activeControlEvent.client.y - this.position.y);
                this.controls[0].position.set(this.activeControlEvent.client.x - this.position.x,
                    this.controls[0].position.y);
                break;

            default:
                break;
        }
    }

    onControlUp() {
        this.parent.update();
        this.parent.activeControl = null;
        this.parent.activeControlEvent = null;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

const rect = new Rect(50, 50, 100, 100, 6, 0xffaaaa);
rect.onSelect = select;
scene.addChild(rect);

const rect2 = new Rect(100, 100, 100, 100, 6, 0xaaffaa);
rect2.onSelect = select;
scene.addChild(rect2);

const rect3 = new Rect(150, 150, 100, 100, 6, 0xaaaaff);
rect3.onSelect = select;
scene.addChild(rect3);