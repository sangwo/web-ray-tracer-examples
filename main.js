const { vec3 } = glMatrix;
import { Ray } from "./Ray.js";
import { Sphere } from "./Sphere.js";
import { Light } from "./Light.js";

const nx = 500; // canvas width
const ny = 500; // canvas height
const l = -2;   // position of the left edge of the image
const r = 2;    // position of the right edge of the image
const b = -2;   // position of the bottom edge of the image
const t = 2;    // position of the top edge of the image
const d = 8;    // distance from origin to the image
const backgroundColor = [255, 255, 255];
const light = new Light(
  0, 5, 0,      // position
  255, 255, 255 // color
);
const ambientLightIntensity = [130, 130, 130];

function computeDiffuse(color, normal, lightDirection) {
  let diffuse = [];
  for (let c = 0; c < 3; c++) {
    diffuse[c] = (color[c] / 255) * (light.color[c] / 255) *
        Math.max(0, vec3.dot(normal, lightDirection));
  }
  return diffuse;
}

function computeAmbient(ambientColor) {
  let ambient = [];
  for (let c = 0; c < 3; c++) {
    ambient[c] = (ambientColor[c] / 255) * (ambientLightIntensity[c] / 255);
  }
  return ambient;
}

function render() {
  // add spheres
  let objects = [
    new Sphere(0, 0, 0, 1, 255, 0, 0),
    new Sphere(1, 1, -3, 1, 0, 0, 255)
  ];

  const canvas = document.getElementById("rendered-image");
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      // generate a ray
      const u = l + (r - l) * (i + 0.5) / nx;
      const v = b + (t - b) * (j + 0.5) / ny;
      const rayOrigin = vec3.fromValues(0, 0, 15);
      let rayDirection = vec3.fromValues(u, v, -d);
      vec3.normalize(rayDirection, rayDirection);
      const ray = new Ray(rayOrigin, rayDirection);

      // find the closest object
      let tMin = Infinity;
      let closest = null;
      for (let k = 0; k < objects.length; k++) {
        const t = objects[k].intersects(ray);
        if (t != null && t > 0 && t < tMin) {
          closest = objects[k];
          tMin = t;
        }
      }

      // color the pixel
      let color = [];
      if (closest != null) {
        // pre-computations
        const surfaceColor = closest.color;
        const point = ray.pointAtParameter(tMin);
        const normal = closest.normal(point);
        let lightDirection = vec3.subtract(vec3.create(), light.position, point);
        vec3.normalize(lightDirection, lightDirection);

        // compute diffuse, ambient
        const diffuse = computeDiffuse(surfaceColor, normal, lightDirection);
        const ambient = computeAmbient(surfaceColor);

        // compute final color
        for (let c = 0; c < 3; c++) {
          color[c] = ambient[c] + diffuse[c];
          // clamp between 0 and 1, then multiply by 255
          color[c] = Math.min(1, Math.max(0, color[c])) * 255;
        }
      } else {
        color = backgroundColor;
      }

      ctx.fillStyle = "rgb(" +
        color[0] + ", " +
        color[1] + ", " +
        color[2] +
      ")";
      ctx.fillRect(i, ny - 1 - j, 1, 1);
    }
  }
}

$(document).ready(function() {
  render();
});
