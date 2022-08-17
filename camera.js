class CameraDebug {
	constructor(
		camera, canvas,
		movementSpeed = 10, rollSpeed = Math.PI/12,
		dragToLook = true, queryKey = "g"
	) {
		this.camera = camera;
		this.clock = new THREE.Clock();

		this.controls = new THREE.FlyControls(this.camera, canvas);
		this.controls.movementSpeed = movementSpeed;
		this.controls.rollSpeed = rollSpeed;
		this.controls.dragToLook = dragToLook;

		document.addEventListener("keypress", (e) => {
			if (e.key === "g") {
				console.info("Camera:",
					JSON.stringify(this.query()).replace(/,/g, ", ")
				);
			}
		});
	}

	query() {
		let position = this.camera.position.toArray();
		let rotation = this.camera.rotation.toArray().splice(0, 3);

		return [
			position.map(coord => coord.toFixed(2)/1),
			rotation.map(angle => angle.toFixed(2)/1)
		];
	}

	update() {
		this.controls.update(this.clock.getDelta());
	}
}

class CameraPath {
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

		let stopsOrigins = [], stopsDirections = [];
		if (stops[0] instanceof THREE.Ray) {
			stops.forEach(stop => {
				stopsOrigins.push(stop.origin);
				stopsDirections.push(stop.direction);
			})
		} else {
			stops.forEach(([origin, direction]) => {
				stopsOrigins.push(new THREE.Vector3().fromArray(origin));
				stopsDirections.push(new THREE.Vector3().fromArray(direction));
			})
		}

		// Interpolate the points and rotations to make them smoother
		let interpolatedPoints = new THREE.CatmullRomCurve3(stopsOrigins).getPoints(detail);
		let interpolatedRotations = new THREE.CatmullRomCurve3(stopsDirections).getPoints(detail);

		this.stops = [];
		for (let i = 0; i < interpolatedPoints.length; i++) {
			this.stops.push(new THREE.Ray(
				interpolatedPoints[i], interpolatedRotations[i]
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
