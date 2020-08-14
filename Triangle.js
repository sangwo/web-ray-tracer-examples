const { vec3 } = glMatrix;

export class Triangle {
  constructor(v0, v1, v2, r, g, b, shininess=100) {
    // vertices
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.color = [r, g, b];
    this.ambientColor = [r, g, b];
    this.specularColor = [255, 255, 255];
    this.shininess = shininess;
  }

  normal(point, rayDirection) {
    const v0v1 = vec3.subtract(vec3.create(), this.v1, this.v0);
    const v0v2 = vec3.subtract(vec3.create(), this.v2, this.v0);
    let normal = vec3.cross(vec3.create(), v0v1, v0v2);
    vec3.normalize(normal, normal);
    const negNormal = vec3.negate(vec3.create(), normal);
    const negRayDirection = vec3.negate(vec3.create(), rayDirection);
    const normalAngle = vec3.angle(normal, negRayDirection);
    const negNormalAngle = vec3.angle(negNormal, negRayDirection);
    if (normalAngle < negNormalAngle) {
      return normal;
    }
    return negNormal;
  }

  intersects(ray) {
    const E = ray.origin;
    const D = ray.direction;
    const a = this.v0[0] - this.v1[0];
    const b = this.v0[1] - this.v1[1];
    const c = this.v0[2] - this.v1[2];
    const d = this.v0[0] - this.v2[0];
    const e = this.v0[1] - this.v2[1];
    const f = this.v0[2] - this.v2[2];
    const g = D[0];
    const h = D[1];
    const i = D[2];
    const j = this.v0[0] - E[0];
    const k = this.v0[1] - E[1];
    const l = this.v0[2] - E[2];

    const ei_hf = e*i - h*f;
    const gf_di = g*f - d*i;
    const dh_eg = d*h - e*g;
    const ak_jb = a*k - j*b;
    const jc_al = j*c - a*l;
    const bl_kc = b*l - k*c;
    const M = a*ei_hf + b*gf_di + c*dh_eg;

    const beta = (j*ei_hf + k*gf_di + l*dh_eg) / M;
    const gamma = (i*ak_jb + h*jc_al + g*bl_kc) / M;

    // ray doesn't intersect with triangle
    if (beta < 0 || gamma < 0 || beta + gamma > 1) {
      return null;
    }

    // ray intersects with triangle
    const t = - (f*ak_jb + e*jc_al + d*bl_kc) / M;
    return t;
  }
}
