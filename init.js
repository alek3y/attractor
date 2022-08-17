let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let attractor = new Attractor();
let camera = new CameraPath(
	new THREE.PerspectiveCamera(
		75, window.innerWidth / window.innerHeight,
		0.1, 1000
	),
	[
		[[0, 0, 50], [0, 0, 0]],
		[[0, 0, 50], [0, 0, 0]],
	],
	5, 50, false
);

let controls = new CameraDebug(camera.camera, renderer.domElement);

function update() {
	requestAnimationFrame(update);

	attractor.update(scene);
	camera.update();

	// DEBUG
	controls.update();

	renderer.render(scene, camera.camera);
}

update();
