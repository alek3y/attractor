class Attractor {
	constructor(scene, {sigma, beta, rho}) {
		this.scene = scene;
		this.sigma = sigma;
		this.beta = beta;
		this.rho = rho;

		// TODO: Add multiple points
		this.x = 0.01;
		this.y = 0.01;
		this.z = 0.01;

		// TODO: Remove in favor of lines
		this.geometry = new THREE.SphereGeometry(0.25, 10, 5);
		this.material = new THREE.MeshBasicMaterial({color: 0x5555ff});

		this.enclosing = new THREE.Mesh(
			new THREE.SphereGeometry(60, 64, 32),
			new THREE.MeshBasicMaterial({color: 0xb04343, wireframe: true})
		);
		this.enclosing.position.z = 30;
		scene.add(this.enclosing);
	}

	step(delta_t) {
		let delta_x = this.sigma * (this.y - this.x);
		let delta_y = this.x * (this.rho - this.z) - this.y;
		let delta_z = this.x * this.y - this.beta * this.z;

		this.x += delta_x * delta_t;
		this.y += delta_y * delta_t;
		this.z += delta_z * delta_t;
	}

	update() {
		let point = new THREE.Mesh(this.geometry, this.material);
		point.position.x = this.x;
		point.position.y = this.y;
		point.position.z = this.z;
		scene.add(point);

		this.step(0.01);
	}
}
