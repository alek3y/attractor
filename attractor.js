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
	constructor({
		sigma = 10, beta = 8/3, rho = 28,
		timeStep = 0.8, curvesAmount = 50, curveLength = 50, curveWidth = 0.3,
		region = new THREE.Sphere(new THREE.Vector3(0, 0, 30), 60),
		rotation = new THREE.Vector3()
	} = {}) {
		this.sigma = sigma;
		this.beta = beta;
		this.rho = rho;
		this.deltaTime = timeStep;
		this.region = region;

		// Set up rotation transformations
		this.rotation = new THREE.Euler().setFromVector3(rotation);
		this.invertRotation = new THREE.Euler().setFromVector3(rotation.negate());

		this.curves = [];
		for (let i = 0; i < curvesAmount; i++) {
			let color = new THREE.Color();
			color.setHSL(
				Math.random(),
				Math.random() * 0.65 + 0.25,
				Math.random() * 0.10 + 0.80
			);

			// Generate a point in the 2D xz-plane
			let xzAngle = Math.random() * 2*Math.PI;
			let xzRadius = Math.random() * region.radius;
			let [x, z] = [
				Math.cos(xzAngle) * xzRadius,
				Math.sin(xzAngle) * xzRadius
			];

			// Rotate the point in the 2D xy-plane
			let yxAngle = Math.random() * 2*Math.PI;
			let yxRadius = x;
			let y = Math.sin(yxAngle) * yxRadius;
			x = Math.cos(yxAngle) * yxRadius;

			let position = new THREE.Vector3(x, y, z);
			position.add(region.center);	// Offset the point inside the region

			this.curves.push(
				new Curve(position, color, curveWidth, curveLength)
			);
		}
	}

	step() {
		for (let i = 0; i < this.curves.length; i++) {
			let rotatedPoint = this.curves[i].head;

			let point = rotatedPoint.clone()
				.applyEuler(this.invertRotation);	// Restore the non-rotated position

			let delta = new THREE.Vector3(
				this.sigma * (point.y - point.x),
				point.x * (this.rho - point.z) - point.y,
				point.x * point.y - this.beta * point.z
			);

			let distance = delta.length();	// Modulus of the vector
			delta.divideScalar(distance / this.deltaTime);	// Scale down every component
			point.add(delta);	// Offset the components by their respective deltas
			point.applyEuler(this.rotation);	// Rotate the point visually

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
