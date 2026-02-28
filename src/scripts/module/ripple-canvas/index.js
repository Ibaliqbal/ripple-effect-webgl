import * as THREE from "three";
import RippleMedia from "./media";

class RippleCanvas {
  constructor() {
    this.dom = document.querySelector(".content");
    this.items = [];

    this.cameraZ = 100;

    this.maxRipples = 50;

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      aspect: window.innerWidth / window.innerHeight,
    };

    this.mouse = new THREE.Vector2(0, 0);
    this.prevMouse = new THREE.Vector2(0, 0);

    this.currentWave = 0;

    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createRipplesMesh();
    this.createMedias();

    this.addEvents();

    this.onResize();

    this.render();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.baseTexture = new THREE.WebGLRenderTarget(
      this.screen.width,
      this.screen.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    );
    this.rippleScene = new THREE.Scene();
  }

  createCamera() {
    const fov =
      2 * Math.atan(this.screen.height / 2 / this.cameraZ) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.scene.add(this.camera);

    this.camera.position.z = this.cameraZ;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });

    this.dom.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = "webgl";

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setPixelRatio(this.screen.pixelRatio);
  }

  createMedias() {
    const medias = [...document.querySelectorAll(".item")];
    this.items = medias.map(
      (media) =>
        new RippleMedia({
          element: media,
          viewport: this.screen,
          scene: this.scene,
        }),
    );
  }

  createRipplesMesh() {
    this.rippleGeometry = new THREE.PlaneGeometry(80, 80, 1, 1);
    this.ripplesMesh = [];
    for (let index = 0; index < this.maxRipples; index++) {
      let material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("/images/brush3.png"),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });

      let mesh = new THREE.Mesh(this.rippleGeometry, material);
      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();
      this.rippleScene.add(mesh);
      this.ripplesMesh.push(mesh);
    }
  }

  setNewWave(x, y, index) {
    let mesh = this.ripplesMesh[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.material.opacity = 1;
    mesh.scale.x = mesh.scale.y = 1;
  }

  trackMousePos() {
    if (
      !(
        Math.abs(this.mouse.x - this.prevMouse.x) < 4 &&
        Math.abs(this.mouse.y - this.prevMouse.y) < 4
      )
    ) {
      this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave);

      this.currentWave = (this.currentWave + 1) % this.maxRipples;
    }

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  onResize() {
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    this.screen.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.screen.aspect = window.innerWidth / window.innerHeight;

    // Resize camera
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.fov =
      2 * Math.atan(this.screen.height / 2 / this.cameraZ) * (180 / Math.PI);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setPixelRatio(this.screen.pixelRatio);

    this.items.forEach((item) => {
      item.onResize(this.screen);
    });
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX - this.screen.width / 2;
    this.mouse.y = this.screen.height / 2 - e.clientY;
  }

  addEvents() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  render() {
    this.trackMousePos();
    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.rippleScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.items.forEach((item) => {
      item.material.uniforms.uDisp.value = this.baseTexture.texture;
    });

    this.ripplesMesh.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.01;
        mesh.material.opacity *= 0.96;

        mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
        // mesh.scale.y = 0.98 * mesh.scale.y + 0.1;
        mesh.scale.y = mesh.scale.x;

        if (mesh.material.opacity < 0.002) {
          mesh.visible = false;
        }
      }
    });

    requestAnimationFrame(this.render.bind(this));
  }
}

export default RippleCanvas;
