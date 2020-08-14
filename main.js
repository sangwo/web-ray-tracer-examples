const { vec3 } = glMatrix;
import { Ray } from "./Ray.js";
import { Sphere } from "./Sphere.js";
import { Triangle } from "./Triangle.js";
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

function intersection(ray, objects, tMin) {
  let closest = null;
  for (let k = 0; k < objects.length; k++) {
    const t = objects[k].intersects(ray);
    if (t != null && t > 0 && t < tMin) {
      closest = objects[k];
      tMin = t;
    }
  }
  return { obj: closest, tVal: tMin };
}

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

function computeSpecular(specularColor, normal, halfVector, shininess) {
  let specular = [];
  for (let c = 0; c < 3; c++) {
    specular[c] = (specularColor[c] / 255) * (light.color[c] / 255) *
        Math.pow(Math.max(0, vec3.dot(normal, halfVector)), shininess);
  }
  return specular;
}

function isInShadow(shadowRay, objects, tLight) {
  const shadowIntersect = intersection(shadowRay, objects, tLight);
  return shadowIntersect.obj == null;
}

function findColor(ray, objects) {
  // find the intersection
  const intersectData = intersection(ray, objects, Infinity);
  const closest = intersectData.obj;
  const tVal = intersectData.tVal;

  // find color of the pixel
  if (closest != null) {
    // pre-computations
    const point = ray.pointAtParameter(tVal);
    const normal = closest.normal(point, ray.direction);
    let lightDirection = vec3.subtract(vec3.create(), light.position, point);
    vec3.normalize(lightDirection, lightDirection);
    let viewDirection = vec3.subtract(vec3.create(), ray.origin, point);
    vec3.normalize(viewDirection, viewDirection);
    let halfVector = vec3.add(vec3.create(), viewDirection, lightDirection);
    vec3.normalize(halfVector, halfVector);
    const diffuseColor = closest.color;
    const ambientColor = closest.ambientColor;
    const specularColor = closest.specularColor;
    const shininess = closest.shininess;

    // compute diffuse, ambient, specular
    const diffuse = computeDiffuse(diffuseColor, normal, lightDirection);
    const ambient = computeAmbient(ambientColor);
    const specular = computeSpecular(specularColor, normal, halfVector, shininess)

    // compute shadow
    const overPoint = vec3.add(vec3.create(), point,
        vec3.scale(vec3.create(), normal, Math.pow(10, -4)));
    const shadowRay = new Ray(overPoint, lightDirection);
    const lightDistance = vec3.distance(point, light.position);
    const shadow = isInShadow(shadowRay, objects, lightDistance);

    // compute final color
    let color = [];
    for (let c = 0; c < 3; c++) {
      color[c] = ambient[c] + (diffuse[c] + specular[c]) * shadow;
      // clamp between 0 and 1, then multiply by 255
      color[c] = Math.min(1, Math.max(0, color[c])) * 255;
    }
    return color;
  }
  return backgroundColor;
}

function render() {
  // add objects
  let objects = [
    new Triangle(
      vec3.fromValues(-5, -1, 10),
      vec3.fromValues(-5, -1, -10),
      vec3.fromValues(5, -1, 10),
      0, 0, 255
    ),
    new Triangle(
      vec3.fromValues(-5, -1, -10),
      vec3.fromValues(5, -1, -10),
      vec3.fromValues(5, -1, 10),
      0, 0, 255
    ),
    new Sphere(0, 1, 0, 1, 255, 0, 0)
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

      // color the pixel
      const color = findColor(ray, objects);
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
