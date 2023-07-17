import { Component, Node, UITransform, _decorator, misc } from "cc";

import { Player } from "./Player";

const { ccclass, property } = _decorator;

@ccclass("Camera")
export class Camera extends Component {
  @property({
    type: Node,
  })
  player: Node;

  start() {}

  update(deltaTime: number) {
    const targetPos = this.player.getPosition();
    const currentPos = this.node.getPosition();

    targetPos.y = misc.clampf(targetPos.y, 0, 0);
    targetPos.x = misc.clampf(targetPos.x, 0, 1280);
    currentPos.lerp(targetPos, 0.1);

    this.node.setPosition(currentPos);
  }
}
