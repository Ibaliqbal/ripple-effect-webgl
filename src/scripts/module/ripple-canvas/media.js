import * as THREE from "three";
import fragmentShader from "../../shaders/fragment.glsl";
import vertexShader from "../../shaders/vertex.glsl";

class RippleMedia {
  constructor({ element, viewport, scene }) {
    this.element = element;
    this.viewport = viewport;
    this.scene = scene;

    this.image = this.element.querySelector("img");
    this.bounds = this.element.getBoundingClientRect();

    this.meshPosition = {
      x: this.bounds.left - this.viewport.width / 2 + this.bounds.width / 2,
      y: -this.bounds.top + this.viewport.height / 2 - this.bounds.height / 2,
    };

    // Media mesh
    this.createGeometry();
    this.createMesh();
    this.createTexture();

    this.updateScale();

    this.setMeshPosition();
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  }

  createMesh() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(this.bounds.width, this.bounds.height),
        },
        uImageResolution: {
          value: new THREE.Vector2(1, 1),
        },
        uTexture: {
          value: null,
        },
        uDisp: {
          value: null,
        },
        uScreenResolution: {
          value: new THREE.Vector2(this.viewport.width, this.viewport.height),
        },
        uPositionMaterial: {
          value: new THREE.Vector2(this.meshPosition.x, this.meshPosition.y),
        },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  createTexture() {
    this.texture = new THREE.TextureLoader().load(
      this.image.src,
      ({ image }) => {
        const material = this.mesh.material;
        if (material) {
          material.uniforms.uImageResolution.value.set(
            image.naturalWidth,
            image.naturalHeight,
          );
        }
      },
    );

    this.material.uniforms.uTexture.value = this.texture;
  }

  updateScale() {
    this.material.uniforms.uResolution.value.set(
      this.bounds.width,
      this.bounds.height,
    );
    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);
    this.material.uniforms.uScreenResolution.value.set(
      this.viewport.width,
      this.viewport.height,
    );
  }

  setMeshPosition() {
    this.mesh.position.x = this.meshPosition.x;
    this.mesh.position.y = this.meshPosition.y;
  }

  onResize(viewport) {
    this.viewport = viewport;
    this.bounds = this.element.getBoundingClientRect();
    this.meshPosition.x =
      this.bounds.left - this.viewport.width / 2 + this.bounds.width / 2;
    this.meshPosition.y =
      -this.bounds.top + this.viewport.height / 2 - this.bounds.height / 2;
      
    this.updateScale();
  }
}

export default RippleMedia;
