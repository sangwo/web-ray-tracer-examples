const { vec3 } = glMatrix;

export class Light {
  constructor(x, y, z, r, g, b) {
    this.position = vec3.fromValues(x, y, z);
    this.color = [r, g, b];
  }
}
