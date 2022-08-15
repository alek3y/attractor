class PathCamera {
	constructor(
		camera,
		stops,	// Rays of the places where the camera will stop
		steps = 200,	// Number of steps between each point (speed)
		detail = 50,	// Number of points the final curve will be made of
		loop = true
	) {
		this.camera = camera;
		this.steps = steps;
		this.loop = loop;

		let stops_origins = [], stops_directions = [];
		if (stops[0] instanceof THREE.Ray) {
			stops.forEach(stop => {
				stops_origins.push(stop.origin);
				stops_directions.push(stop.direction);
			})
		} else {
			stops.forEach(([origin, direction]) => {
				stops_origins.push(new THREE.Vector3().fromArray(origin));
				stops_directions.push(new THREE.Vector3().fromArray(direction));
			})
		}

		// Interpolate the points and rotations to make them smoother
		let interpolated_points = new THREE.CatmullRomCurve3(stops_origins).getPoints(detail);
		let interpolated_rotations = new THREE.CatmullRomCurve3(stops_directions).getPoints(detail);

		this.stops = [];
		for (let i = 0; i < interpolated_points.length; i++) {
			this.stops.push(new THREE.Ray(
				interpolated_points[i], interpolated_rotations[i]
			));
		}

		this.reset();
	}

	setRotation(direction) {
		this.camera.rotation.x = direction.x;
		this.camera.rotation.y = direction.y;
		this.camera.rotation.z = direction.z;
	}

	getRotation() {
		return new THREE.Vector3(
			this.camera.rotation.x,
			this.camera.rotation.y,
			this.camera.rotation.z
		);
	}

	reset() {
		this.reached = 1;	// Number of the reached stops (start is reached)
		this.progress = 0;	// Count a single step progress
		this.delta = null;	// Current step distance to travel

		this.camera.position.copy(this.stops[0].origin);
		this.setRotation(this.stops[0].direction);
	}

	update() {
		if (this.reached >= this.stops.length) {
			if (!this.loop) {
				return;
			} else {
				this.reset();
			}
		}

		// Initialize steps delta for the current stop
		if (this.delta === null) {
			let next = this.stops[this.reached];
			let current = this.stops[this.reached-1];

			this.delta = new THREE.Ray(
				next.origin.clone()
					.sub(current.origin)
					.divideScalar(this.steps),
				next.direction.clone()
					.sub(current.direction)
					.divideScalar(this.steps)
			);
		}

		this.camera.position.add(this.delta.origin);
		this.setRotation(this.getRotation().add(this.delta.direction));

		this.progress += 1;
		if (this.progress >= this.steps) {
			this.delta = null;
			this.reached += 1;
			this.progress = 0;
		}
	}
}
