class Attractor {
	constructor(
		scene, {sigma, beta, rho},
		{time_step = 0.01, points_amount = 10, region_radius = 60} = {}
	) {
		this.scene = scene;

		// TODO: Remove in favor of lines
		this.geometry = new THREE.SphereGeometry(0.25, 10, 5);
		this.material = new THREE.MeshBasicMaterial({color: 0x5555ff});

		this.enclosing = new THREE.Mesh(
			new THREE.SphereGeometry(region_radius, 64, 32),
			new THREE.MeshBasicMaterial({color: 0xb04343, wireframe: true})
		);
		this.enclosing.position.z = 30;
		scene.add(this.enclosing);

		this.sigma = sigma;
		this.beta = beta;
		this.rho = rho;
		this.delta_t = time_step;

		this.points = [];
		for (let i = 0; i < points_amount; i++) {
			let color = Math.round(Math.random() * 0xffffff);

			// Generate a point in the 2D xz-plane
			let xz_angle = Math.random() * 2*Math.PI;
			let xz_radius = Math.random() * region_radius;
			let [x, z] = [
				Math.cos(xz_angle) * xz_radius,
				Math.sin(xz_angle) * xz_radius + 30	// TODO: Specify where 30 comes from
			];

			// Rotate the point in the 2D xy-plane
			let yx_angle = Math.random() * 2*Math.PI;
			let yx_radius = x;
			let y = Math.sin(yx_angle) * yx_radius;
			x = Math.cos(yx_angle) * yx_radius;

			this.points.push([new THREE.Vector3(x, y, z), color]);
		}
	}

	step() {
		for (let i = 0; i < this.points.length; i++) {
			let point = this.points[i][0];

			let delta = new THREE.Vector3(
				this.sigma * (point.y - point.x),
				point.x * (this.rho - point.z) - point.y,
				point.x * point.y - this.beta * point.z
			);
			delta.multiplyScalar(this.delta_t);	// Multiply every component by delta_t

			point.add(delta);	// Offset the components by their respective deltas
		}
	}

	update() {
		for (let i = 0; i < this.points.length; i++) {
			let [point, color] = this.points[i];
			let object = new THREE.Mesh(
				this.geometry,
				new THREE.MeshBasicMaterial({color: color})
			);
			object.position.copy(point);
			scene.add(object);
		}

		this.step();
	}
}
