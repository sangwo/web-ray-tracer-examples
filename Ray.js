const { vec3 } = glMatrix;

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }


  pointAtParameter(t) {
    return vec3.add(vec3.create(), this.origin, vec3.scale(vec3.create(),
        this.direction, t));
  }
}
