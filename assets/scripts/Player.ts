import {
  Animation,
  AnimationClip,
  CCInteger,
  Collider2D,
  Component,
  Contact2DType,
  EventKeyboard,
  IPhysics2DContact,
  Input,
  KeyCode,
  Node,
  RigidBody2D,
  SkeletalAnimationState,
  Vec2,
  Vec3,
  _decorator,
  input,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property({
    type: CCInteger,
    tooltip: "Vận tốc tối đa",
  })
  maxSpeed: number = 0;

  @property({
    type: CCInteger,
    tooltip: "Độ cao nhảy",
  })
  jumpHeight: number = 0;

  @property({
    type: CCInteger,
  })
  runForce: number = 0;

  @property({
    type: CCInteger,
    tooltip: "Hướng di chuyển",
  })
  vector: number = 0;

  anims: Animation = null;
  jumpCount: number = 0;
  rigidBody: RigidBody2D = null;

  onLoad(): void {
    this.anims = this.node.getComponent(Animation);
    this.rigidBody = this.getComponent(RigidBody2D);

    this.anims.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
    input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
    input.on(Input.EventType.KEY_UP, this.keyUp, this);

    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onAnimationFinished(
    type: Animation.EventType,
    state: SkeletalAnimationState
  ) {
    if (state.name == "throw" || state.name == "attack") {
      this.anims.crossFade("idle", 0.2);
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.tag == 1) {
      this.jumpCount = 0;
      if (this.vector != 0) {
        this.anims.crossFade("run", 0.2);
      } else {
        this.anims.crossFade("idle", 0.2);
      }
    }
  }

  keyDown(e: EventKeyboard) {
    switch (e.keyCode) {
      case KeyCode.KEY_A:
        this.vector = -1;
        this.node.scale = new Vec3(-1, 1, 0);
        this.anims.stop();
        if (this.jumpCount > 0) {
          this.anims.crossFade("jump", 0.2);
        } else {
          this.anims.crossFade("run", 0.2);
        }
        break;
      case KeyCode.KEY_D:
        this.vector = 1;
        this.node.scale = new Vec3(1, 1, 0);
        this.anims.stop();
        if (this.jumpCount > 0) {
          this.anims.crossFade("jump", 0.2);
        } else {
          this.anims.crossFade("run", 0.2);
        }
        break;
      case KeyCode.KEY_W:
        if (this.jumpCount >= 0 && this.jumpCount < 2) {
          this.rigidBody.sleep();
          this.anims.crossFade("jump", 0.2);
          if (this.jumpCount == 0) {
            this.rigidBody.applyLinearImpulse(
              new Vec2(0, this.jumpHeight),
              new Vec2(0, 0),
              true
            );
          } else if (this.jumpCount == 1) {
            this.rigidBody.applyLinearImpulse(
              new Vec2(0, this.jumpHeight * 0.8),
              new Vec2(0, 0),
              true
            );
          }
          this.jumpCount += 1;
        }
        break;
      case KeyCode.KEY_Q:
        this.vector = 0;
        if (this.vector == 0 && this.jumpCount == 0) {
          this.anims.crossFade("throw", 0.3);
          this.anims.getState("throw").speed = 1.5;
        }

        if (this.jumpCount > 0) {
          this.anims.stop();
          this.anims.crossFade("jump_throw");
        }
        break;

      case KeyCode.KEY_E:
        this.vector = 0;
        if (this.vector == 0 && this.jumpCount == 0) {
          this.anims.crossFade("attack", 0.3);
        }

        if (this.jumpCount > 0) {
          this.anims.stop();
          this.anims.crossFade("jump_throw");
        }
        break;
      default:
        break;
    }
  }

  keyUp(e: EventKeyboard) {
    switch (e.keyCode) {
      case KeyCode.KEY_A:
      case KeyCode.KEY_D:
        this.vector = 0;
        if (this.jumpCount > 0) {
          this.anims.crossFade("jump", 0.2);
        } else {
          this.anims.crossFade("idle", 0.2);
        }
        break;
      default:
        break;
    }
  }

  update(dt: number) {
    if (
      (this.vector > 0 && this.rigidBody.linearVelocity.x < this.maxSpeed) ||
      (this.vector < 0 && this.rigidBody.linearVelocity.x > -this.maxSpeed)
    ) {
      this.rigidBody.applyForceToCenter(
        new Vec2(this.vector * this.runForce, 0),
        true
      );
    }
  }
}
