class Curve {
	constructor(position, color, width, limit) {
		this.points = [position];
		this.limit = limit;
		this.scenes = new Set();

		this.geometry = new THREE.BufferGeometry();
		this.object = new THREE.Mesh(
			new MeshLine(),
			new MeshLineMaterial({color: color, lineWidth: width})
		);
	}

	get head() {
		return this.points[this.points.length-1];
	}

	move(point) {
		if (this.points.length < this.limit) {
			this.points.push(point.clone());
		} else {
			for (let i = 0; i < this.points.length-1; i++) {
				this.points[i].copy(this.points[i+1]);
			}
			this.points[this.points.length-1].copy(point);
		}
	}

	dispose() {
		this.scenes.forEach(scene => {
			scene.remove(this.object);
		})
		this.scenes.clear();

		this.object.geometry.dispose();
		this.object.material.dispose();
		this.geometry.dispose();
		this.object = null;
	}

	update(scene) {
		if (this.points.length < 2 || this.object === null) {
			return;
		}

		scene.remove(this.object);
		this.object.geometry.dispose();

		this.geometry.setFromPoints(this.points);
		this.object.geometry.setGeometry(this.geometry);
		scene.add(this.object);

		this.scenes.add(scene);
	}
}

class Attractor {
	constructor(
		time_step = 0.8, curves_amount = 50, curve_length = 50, curve_width = 0.3,
		{sigma = 10, beta = 8/3, rho = 28} = {},
		region = new THREE.Sphere(new THREE.Vector3(0, 0, 30), 60)
	) {

		// DEBUG: Sphere showing where the attractor is bounded
		//this.enclosing = new THREE.Mesh(
		//	new THREE.SphereGeometry(region.radius, 64, 32),
		//	new THREE.MeshBasicMaterial({color: 0xb04343, wireframe: true})
		//);
		//this.enclosing.position.copy(region.center);
		//scene.add(this.enclosing);

		this.sigma = sigma;
		this.beta = beta;
		this.rho = rho;
		this.delta_t = time_step;
		this.region = region;

		this.curves = [];
		for (let i = 0; i < curves_amount; i++) {
			let color = new THREE.Color();
			color.setHSL(
				Math.random(),
				Math.random() * 0.65 + 0.25,
				Math.random() * 0.10 + 0.80
			);

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
			position.add(region.center);	// Offset the point inside the region

			this.curves.push(
				new Curve(position, color, curve_width, curve_length)
			);
		}
	}

	step() {
		for (let i = 0; i < this.curves.length; i++) {
			let point = this.curves[i].head.clone();

			let delta = new THREE.Vector3(
				this.sigma * (point.y - point.x),
				point.x * (this.rho - point.z) - point.y,
				point.x * point.y - this.beta * point.z
			);

			let distance = delta.length();	// Modulus of the vector
			delta.divideScalar(distance / this.delta_t);	// Scale down every component
			point.add(delta);	// Offset the components by their respective deltas

			if (!this.region.containsPoint(point)) {
				this.curves[i].dispose();
				this.curves.splice(i, 1);
				i--;
			} else {
				this.curves[i].move(point);
			}
		}
	}

	update(scene) {
		for (let i = 0; i < this.curves.length; i++) {
			this.curves[i].update(scene);
		}

		this.step();
	}
}
