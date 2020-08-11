const { vec3 } = glMatrix;
import { Ray } from "./Ray.js";
import { Sphere } from "./Sphere.js";

const nx = 500; // canvas width
const ny = 500; // canvas height
const l = -2;   // position of the left edge of the image
const r = 2;    // position of the right edge of the image
const b = -2;   // position of the bottom edge of the image
const t = 2;    // position of the top edge of the image
const d = 8;    // distance from origin to the image
const backgroundColor = [255, 255, 255];

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
      let color = backgroundColor;
      if (closest != null) {
        color = closest.color;
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
