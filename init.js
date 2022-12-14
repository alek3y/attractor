let scene = new THREE.Scene();
scene.background = new THREE.Color(0x151416);

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let attractor = new Attractor({
	rotation: new THREE.Vector3(0, 0, Math.PI/10)
});

// DEBUG: Sphere showing where the attractor is bounded
//let enclosing = new THREE.Mesh(
//	new THREE.SphereGeometry(attractor.region.radius, 64, 32),
//	new THREE.MeshBasicMaterial({color: 0xb04343, wireframe: true})
//);
//enclosing.position.copy(attractor.region.center);
//scene.add(enclosing);

let camera = new THREE.PerspectiveCamera(
	80, window.innerWidth / window.innerHeight,
	0.1, 1000
);
camera.position.set(-12.29, -1.91, 63.08);

let orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.target.copy(attractor.region.center);
orbit.autoRotate = true;
orbit.autoRotateSpeed = 1;

function update() {
	requestAnimationFrame(update);

	attractor.update(scene);

	orbit.update();
	renderer.render(scene, camera);
}

update();
