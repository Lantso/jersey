const DEFAULT_MODEL_URL = "/assets/3d/logo.glb";
const GL_FLOAT = 5126;
const TYPE_COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4
};
const modelCache = new Map();

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform mat4 uModel;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    vPosition = world.xyz;
    vNormal = mat3(uModel) * aNormal;
    gl_Position = uProjection * uView * world;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 uColor;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 light = normalize(vec3(-0.35, 0.72, 0.62));
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition);
    float diffuse = max(dot(n, light), 0.0);
    float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.0);
    vec3 color = uColor * (0.34 + diffuse * 0.76) + vec3(1.0) * rim * 0.18;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export async function initRotatingLogo(target, options = {}) {
  const root = target instanceof HTMLElement ? target : document.querySelector(target);
  if (!root) return emptyController();
  const canvas = root.matches("canvas") ? root : root.querySelector("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return emptyController();

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
  if (!gl) {
    root.classList.add("is-fallback");
    return emptyController();
  }

  const renderer = new LogoRenderer(root, canvas, gl, options);
  await renderer.init();
  return renderer;
}

export function initRotatingLogos(selector = "[data-rotating-logo]", options = {}) {
  return Promise.all([...document.querySelectorAll(selector)].map((node) => initRotatingLogo(node, options)));
}

function emptyController() {
  return {
    destroy() {}
  };
}

class LogoRenderer {
  constructor(root, canvas, gl, options = {}) {
    this.root = root;
    this.canvas = canvas;
    this.gl = gl;
    this.modelUrl = root.dataset.modelUrl || options.modelUrl || DEFAULT_MODEL_URL;
    this.autoSpeed = Number(options.autoSpeed || 0.00016);
    this.rotationX = Number(options.rotationX || -0.08);
    this.rotationY = Number(options.rotationY || -0.18);
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };
    this.raf = 0;
    this.lastFrame = performance.now();
    this.pixelRatio = 1;
    this.onResize = () => this.resize();
    this.onPointerDown = (event) => this.pointerDown(event);
    this.onPointerMove = (event) => this.pointerMove(event);
    this.onPointerUp = () => this.pointerUp();
  }

  async init() {
    this.model = await loadModel(this.modelUrl);
    this.program = createProgram(this.gl, VERTEX_SHADER, FRAGMENT_SHADER);
    this.locations = {
      position: this.gl.getAttribLocation(this.program, "aPosition"),
      normal: this.gl.getAttribLocation(this.program, "aNormal"),
      projection: this.gl.getUniformLocation(this.program, "uProjection"),
      view: this.gl.getUniformLocation(this.program, "uView"),
      model: this.gl.getUniformLocation(this.program, "uModel"),
      color: this.gl.getUniformLocation(this.program, "uColor")
    };
    this.positionBuffer = createArrayBuffer(this.gl, this.model.positions);
    this.normalBuffer = createArrayBuffer(this.gl, this.model.normals);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.BLEND);
    this.canvas.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerup", this.onPointerUp, { passive: true });
    this.canvas.addEventListener("pointercancel", this.onPointerUp, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    this.resize();
    this.root.classList.add("is-ready");
    this.frame(this.lastFrame);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.pixelRatio = ratio;
    this.gl.viewport(0, 0, width, height);
  }

  frame(now) {
    const delta = Math.min(40, now - this.lastFrame);
    this.lastFrame = now;
    if (!this.dragging) this.rotationY += delta * this.autoSpeed;
    this.draw();
    this.raf = requestAnimationFrame((time) => this.frame(time));
  }

  draw() {
    const { gl } = this;
    const aspect = Math.max(0.1, this.canvas.width / Math.max(1, this.canvas.height));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    bindAttribute(gl, this.positionBuffer, this.locations.position, 3);
    bindAttribute(gl, this.normalBuffer, this.locations.normal, 3);
    gl.uniformMatrix4fv(this.locations.projection, false, perspectiveMatrix(34, aspect, 0.1, 100));
    gl.uniformMatrix4fv(this.locations.view, false, translationMatrix(0, 0, -3.4));
    gl.uniformMatrix4fv(this.locations.model, false, rotationMatrix(this.rotationX, this.rotationY));
    gl.uniform3f(this.locations.color, 0.96, 0.95, 0.9);
    gl.drawArrays(gl.TRIANGLES, 0, this.model.vertexCount);
  }

  pointerDown(event) {
    this.dragging = true;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  pointerMove(event) {
    if (!this.dragging) return;
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.rotationY += dx * 0.009;
    this.rotationX = clamp(this.rotationX + dy * 0.007, -0.85, 0.85);
  }

  pointerUp() {
    this.dragging = false;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    window.removeEventListener("resize", this.onResize);
    this.root.classList.remove("is-ready");
  }
}

async function loadModel(url) {
  if (!modelCache.has(url)) {
    modelCache.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Could not load ${url}`);
          return response.arrayBuffer();
        })
        .then(parseGlb)
    );
  }
  return modelCache.get(url);
}

function parseGlb(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (readMagic(arrayBuffer, 0, 4) !== "glTF" || view.getUint32(4, true) !== 2) {
    throw new Error("Unsupported GLB file.");
  }
  let offset = 12;
  let json = null;
  let binOffset = 0;
  let binLength = 0;

  while (offset < arrayBuffer.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkOffset = offset + 8;
    if (chunkType === 0x4e4f534a) {
      json = JSON.parse(new TextDecoder().decode(arrayBuffer.slice(chunkOffset, chunkOffset + chunkLength)));
    }
    if (chunkType === 0x004e4942) {
      binOffset = chunkOffset;
      binLength = chunkLength;
    }
    offset = chunkOffset + chunkLength;
  }

  if (!json || !binLength) throw new Error("Incomplete GLB file.");
  const primitive = json.meshes?.[0]?.primitives?.[0];
  const positionIndex = primitive?.attributes?.POSITION;
  const normalIndex = primitive?.attributes?.NORMAL;
  if (!Number.isInteger(positionIndex) || !Number.isInteger(normalIndex)) {
    throw new Error("The GLB must include positions and normals.");
  }

  const nodeMatrix = json.nodes?.find((node) => Number.isInteger(node.mesh))?.matrix || identityMatrix();
  const positions = readAccessor(json, arrayBuffer, binOffset, positionIndex);
  const normals = readAccessor(json, arrayBuffer, binOffset, normalIndex);
  return normalizeMesh(positions, normals, nodeMatrix);
}

function readAccessor(json, arrayBuffer, binOffset, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const bufferView = json.bufferViews[accessor.bufferView];
  const components = TYPE_COMPONENTS[accessor.type];
  if (accessor.componentType !== GL_FLOAT || !components) throw new Error("Unsupported GLB accessor.");
  const stride = bufferView.byteStride || components * 4;
  const start = binOffset + (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const view = new DataView(arrayBuffer, start, bufferView.byteLength);
  const output = new Float32Array(accessor.count * components);
  for (let index = 0; index < accessor.count; index += 1) {
    for (let component = 0; component < components; component += 1) {
      output[index * components + component] = view.getFloat32(index * stride + component * 4, true);
    }
  }
  return output;
}

function normalizeMesh(rawPositions, rawNormals, nodeMatrix) {
  const positions = new Float32Array(rawPositions.length);
  const normals = new Float32Array(rawNormals.length);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let index = 0; index < rawPositions.length; index += 3) {
    const point = transformPoint(nodeMatrix, rawPositions[index], rawPositions[index + 1], rawPositions[index + 2]);
    positions.set(point, index);
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], point[axis]);
      max[axis] = Math.max(max[axis], point[axis]);
    }
    const normal = normalizeVector(transformVector(nodeMatrix, rawNormals[index], rawNormals[index + 1], rawNormals[index + 2]));
    normals.set(normal, index);
  }

  const center = min.map((value, axis) => (value + max[axis]) / 2);
  const size = max.map((value, axis) => value - min[axis]);
  const scale = 1.76 / Math.max(size[0], size[1], size[2] * 2.2);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (positions[index] - center[0]) * scale;
    positions[index + 1] = (positions[index + 1] - center[1]) * scale;
    positions[index + 2] = (positions[index + 2] - center[2]) * scale;
  }

  return {
    positions,
    normals,
    vertexCount: positions.length / 3
  };
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Could not link WebGL program.");
  }
  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Could not compile WebGL shader.");
  }
  return shader;
}

function createArrayBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function bindAttribute(gl, buffer, location, size) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function perspectiveMatrix(fovDegrees, aspect, near, far) {
  const f = 1 / Math.tan((fovDegrees * Math.PI) / 360);
  const range = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * range,
    -1,
    0,
    0,
    2 * near * far * range,
    0
  ]);
}

function translationMatrix(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function rotationMatrix(x, y) {
  const cx = Math.cos(x);
  const sx = Math.sin(x);
  const cy = Math.cos(y);
  const sy = Math.sin(y);
  return new Float32Array([
    cy,
    0,
    -sy,
    0,
    sy * sx,
    cx,
    cy * sx,
    0,
    sy * cx,
    -sx,
    cy * cx,
    0,
    0,
    0,
    0,
    1
  ]);
}

function identityMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function transformPoint(matrix, x, y, z) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  ];
}

function transformVector(matrix, x, y, z) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z,
    matrix[1] * x + matrix[5] * y + matrix[9] * z,
    matrix[2] * x + matrix[6] * y + matrix[10] * z
  ];
}

function normalizeVector(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readMagic(arrayBuffer, start, end) {
  return new TextDecoder().decode(arrayBuffer.slice(start, end));
}
