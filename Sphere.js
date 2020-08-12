const { vec3 } = glMatrix;

export class Sphere {
  constructor(x, y, z, radius, r, g, b) {
    this.center = vec3.fromValues(x, y, z);
    this.radius = radius;
    this.color = [r, g, b];
  }

  normal(point) {
    let normal = vec3.subtract(vec3.create(), point, this.center);
    vec3.normalize(normal, normal);
    return normal;
  }

  intersects(ray) {
    const oc = vec3.subtract(vec3.create(), ray.origin, this.center);
    const a = vec3.dot(ray.direction, ray.direction);
    const b = 2 * vec3.dot(ray.direction, oc);
    const c = vec3.dot(oc, oc) - this.radius * this.radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return null;
    }
    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    return t;
  }
}
