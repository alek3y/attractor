class Attractor {
	constructor(
		scene,
		{sigma = 10, beta = 8/3, rho = 28} = {},
		region = new THREE.Sphere(new THREE.Vector3(0, 0, 30), 60),
		time_step = 0.01, amount_points = 10
	) {
		this.scene = scene;
		this.region = region;

		// TODO: Remove in favor of lines
		this.geometry = new THREE.SphereGeometry(0.25, 10, 5);
		this.material = new THREE.MeshBasicMaterial({color: 0x5555ff});

		// Sphere showing where the attractor is bounded
		this.enclosing = new THREE.Mesh(
			new THREE.SphereGeometry(region.radius, 64, 32),
			new THREE.MeshBasicMaterial({color: 0xb04343, wireframe: true})
		);
		this.enclosing.position.copy(region.center);
		scene.add(this.enclosing);

		this.sigma = sigma;
		this.beta = beta;
		this.rho = rho;
		this.delta_t = time_step;

		this.points = [];
		for (let i = 0; i < amount_points; i++) {
			let color = Math.round(Math.random() * 0xffffff);

			// Generate a point in the 2D xz-plane
			let xz_angle = Math.random() * 2*Math.PI;
			let xz_radius = Math.random() * region.radius;
			let [x, z] = [
				Math.cos(xz_angle) * xz_radius,
				Math.sin(xz_angle) * xz_radius
			];

			// Rotate the point in the 2D xy-plane
			let yx_angle = Math.random() * 2*Math.PI;
			let yx_radius = x;
			let y = Math.sin(yx_angle) * yx_radius;
			x = Math.cos(yx_angle) * yx_radius;

			let position = new THREE.Vector3(x, y, z);
			position.add(region.center);	// Offset the point location inside the region

			this.points.push([position, color]);
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
