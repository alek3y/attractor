let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let camera_distance = 50;
let camera_rotation = 0;

let attractor = new Attractor();

function update() {
	requestAnimationFrame(update);

	attractor.update(scene);

	camera.position.x = Math.sin(camera_rotation) * camera_distance;
	camera.position.z = Math.cos(camera_rotation) * camera_distance;
	camera.position.add(attractor.region.center);
	camera.rotation.y = camera_rotation;
	camera_rotation = (camera_rotation + 0.01) % (2*Math.PI);

	renderer.render(scene, camera);
}

update();
