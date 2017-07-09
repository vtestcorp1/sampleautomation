/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 *
 * @author Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview: A class to control camera in a webgl scene. Adapted from THREE.js's OrbitControls
 * Changes include:
 *
 * 1. A 'destroy' method to clean up event listeners.
 * 2. Removal of code not used by us (e.g. support for Orthographic camera, keyboard handling)
 * 3. Customization of mouse handling behavior (left click for rotate as well as pan depending on flags).
 * 4. Restricting event listeners to the root DOM node provided.
 */

'use strict';

blink.app.factory('WebGLCameraControls', [function(){

    var EPS = 0.000001;
    var Default = {
        ZOOM_SPEED: 1.0,
        ROTATE_SPEED: 1.0,
        MIN_POLAR_ANGLE: 0,
        MAX_POLAR_ANGLE: Math.PI,
        MIN_AZIMUTH_ANGLE: -Infinity,
        MAX_AZIMUTH_ANGLE: +Infinity,
        MIN_DISTANCE: 0,
        MAX_DISTANCE: +Infinity,
        MIN_ZOOM: 0,
        MAX_ZOOM: +Infinity
    };
    var EVENT_NAMESPACE = 'webgl-camera-controls';
    var ControlState = {
        NONE : -1,
        ROTATE : 0,
        DOLLY : 1,
        PAN : 2,
        TOUCH_ROTATE : 3,
        TOUCH_DOLLY : 4,
        TOUCH_PAN : 5
    };
    var ControlEvent = {
        CHANGE: {
            type: 'change'
        },
        START: {
            type: 'start'
        },
        END: {
            type: 'end'
        }
    };

    function WebGLCameraControls(camera, canvas) {

        this.camera = camera;
        this.canvas = canvas;

        this.canvasWidth = this.canvasHeight = 0;

        this.enabled = true;

        this.target = new THREE.Vector3();

        this.noZoom = false;
        this.zoomSpeed = Default.ZOOM_SPEED;

        this.minDistance = Default.MIN_DISTANCE;
        this.maxDistance = Default.MAX_DISTANCE;

        this.minZoom = Default.MIN_ZOOM;
        this.maxZoom = Default.MAX_ZOOM;

        this.noRotate = false;
        this.rotateSpeed = Default.ROTATE_SPEED;

        this.noPan = false;

        this.minPolarAngle = Default.MIN_POLAR_ANGLE;
        this.maxPolarAngle = Default.MAX_POLAR_ANGLE;

        this.minAzimuthAngle = Default.MIN_AZIMUTH_ANGLE;
        this.maxAzimuthAngle = Default.MAX_AZIMUTH_ANGLE;

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();
        this.panOffset = new THREE.Vector3();

        this.offset = new THREE.Vector3();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();

        this.theta = 0;
        this.phi = 0;
        this.phiDelta = 0;
        this.thetaDelta = 0;
        this.scale = 1;
        this.pan = new THREE.Vector3();

        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();

        this.state = ControlState.NONE;

        this.initialTarget = this.target.clone();
        this.initialPosition = this.camera.position.clone();
        this.initialZoom = this.camera.zoom;


        this.quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
        this.quatInverse = this.quat.clone().inverse();

        updateCanvasSize(this);
        setUpEventListeners(this);
        update(this);
    }

    WebGLCameraControls.prototype.setRotateOnDrag = function (rotateOnDrag) {
        this.noRotate = !rotateOnDrag;
        this.noPan = rotateOnDrag;
    };

    WebGLCameraControls.prototype.destroy = function () {
        if (this.canvas) {
            $(this.canvas).off(getNameSpacedEventName(''));
        }
    };

    WebGLCameraControls.prototype.reset = function () {
        reset(this);
    };

    WebGLCameraControls.prototype.update = function () {
        update(this);
    };

    WebGLCameraControls.prototype.dispatchEvent = function (event) {
        //console.log('WebGLCameraControls event', event.type);
    };

    WebGLCameraControls.prototype.handleResize = function () {
        updateCanvasSize(this);
    };

    WebGLCameraControls.prototype.setTarget = function (x, y, z) {
        this.target.set(x, y, z);
    };

    function getNameSpacedEventName(baseEventName) {
        return baseEventName + '.' + EVENT_NAMESPACE;
    }

    function updateCanvasSize(cameraControls) {
        cameraControls.canvasWidth = $(cameraControls.canvas).width();
        cameraControls.canvasHeight = $(cameraControls.canvas).height();
    }

    function rotateLeft(cameraControls, angle) {
        cameraControls.thetaDelta -= angle;
    }

    function rotateUp(cameraControls, angle) {
        cameraControls.phiDelta -= angle;
    }

    function panLeft(cameraControls, distance) {
        var te = cameraControls.camera.matrix.elements;

        cameraControls.panOffset.set(te[0], te[1], te[2]);
        cameraControls.panOffset.multiplyScalar(-distance);

        cameraControls.pan.add(cameraControls.panOffset);
    }

    function panUp(cameraControls, distance) {
        var te = cameraControls.camera.matrix.elements;

        cameraControls.panOffset.set(te[4], te[5], te[6]);
        cameraControls.panOffset.multiplyScalar(distance);

        cameraControls.pan.add(cameraControls.panOffset);
    }

    function pan(cameraControls, deltaX, deltaY) {
        var position = cameraControls.camera.position;
        var offset = position.clone().sub(cameraControls.target);
        var targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan((cameraControls.camera.fov/2) * Math.PI/180.0);

        panLeft(cameraControls, 2 * deltaX * targetDistance/cameraControls.canvasHeight);
        panUp(cameraControls, 2 * deltaY * targetDistance /cameraControls.canvasHeight);
    }

    function getZoomScale(cameraControls) {
        return Math.pow(0.95, cameraControls.zoomSpeed);
    }

    function dollyIn(cameraControls) {
        cameraControls.scale /= getZoomScale(cameraControls);
    }

    function dollyOut(cameraControls) {
        cameraControls.scale *= getZoomScale(cameraControls);
    }

    function update(cameraControls) {
        var position = cameraControls.camera.position;
        var offset = cameraControls.offset;

        offset.copy(position).sub(cameraControls.target);
        offset.applyQuaternion(cameraControls.quat);

        cameraControls.theta = Math.atan2(offset.x, offset.z);
        cameraControls.phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

        cameraControls.theta += cameraControls.thetaDelta;
        cameraControls.phi += cameraControls.phiDelta;

        cameraControls.theta = Math.max(
            cameraControls.minAzimuthAngle,
            Math.min(cameraControls.maxAzimuthAngle, cameraControls.theta)
        );

        cameraControls.phi = Math.max(
            cameraControls.minPolarAngle,
            Math.min( cameraControls.maxPolarAngle, cameraControls.phi)
        );

        cameraControls.phi = Math.max(EPS, Math.min(Math.PI - EPS, cameraControls.phi));

        var radius = offset.length() * cameraControls.scale;
        radius = Math.max(cameraControls.minDistance, Math.min(cameraControls.maxDistance, radius));

        cameraControls.target.add(cameraControls.pan);

        offset.x = radius * Math.sin(cameraControls.phi) * Math.sin(cameraControls.theta);
        offset.y = radius * Math.cos(cameraControls.phi);
        offset.z = radius * Math.sin(cameraControls.phi) * Math.cos(cameraControls.theta);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(cameraControls.quatInverse);

        position.copy(cameraControls.target).add(offset);

        cameraControls.camera.lookAt(cameraControls.target);

        cameraControls.thetaDelta = cameraControls.phiDelta = 0;
        cameraControls.scale = 1;
        cameraControls.pan.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if (cameraControls.lastPosition.distanceToSquared( cameraControls.camera.position ) > EPS
            || 8 * (1 - cameraControls.lastQuaternion.dot(cameraControls.camera.quaternion)) > EPS ) {

            cameraControls.dispatchEvent(ControlEvent.CHANGE);

            cameraControls.lastPosition.copy(cameraControls.camera.position);
            cameraControls.lastQuaternion.copy(cameraControls.camera.quaternion);
        }
    }

    function reset(cameraControls) {
        cameraControls.state = ControlState.NONE;

        cameraControls.target.copy(cameraControls.initialTarget);
        cameraControls.camera.position.copy(cameraControls.initialPosition);
        cameraControls.camera.zoom = cameraControls.initialZoom;

        cameraControls.camera.updateProjectionMatrix();
        cameraControls.dispatchEvent(ControlEvent.CHANGE);

        cameraControls.zoomSpeed = Default.ZOOM_SPEED;
        cameraControls.minDistance = Default.MIN_DISTANCE;
        cameraControls.maxDistance = Default.MAX_DISTANCE;
        cameraControls.minZoom = Default.MIN_ZOOM;
        cameraControls.maxZoom = Default.MAX_ZOOM;
        cameraControls.rotateSpeed = Default.ROTATE_SPEED;
        cameraControls.minPolarAngle = Default.MIN_POLAR_ANGLE;
        cameraControls.maxPolarAngle = Default.MAX_POLAR_ANGLE;
        cameraControls.minAzimuthAngle = Default.MIN_AZIMUTH_ANGLE;
        cameraControls.maxAzimuthAngle = Default.MAX_AZIMUTH_ANGLE;

        update(cameraControls);
    }

    function handleRotation(cameraControls, eventX, eventY) {
        cameraControls.rotateEnd.set(eventX, eventY);
        cameraControls.rotateDelta.subVectors(cameraControls.rotateEnd, cameraControls.rotateStart);

        var xRotationFraction = cameraControls.rotateDelta.x /cameraControls.canvasWidth;
        rotateLeft(cameraControls, 2 * Math.PI * xRotationFraction * cameraControls.rotateSpeed);

        var yRotationFraction = cameraControls.rotateDelta.y / cameraControls.canvasHeight;
        rotateUp(cameraControls, 2 * Math.PI * yRotationFraction * cameraControls.rotateSpeed);

        cameraControls.rotateStart.copy(cameraControls.rotateEnd);
        update(cameraControls);
    }

    function handleDollyEnd(cameraControls) {
        cameraControls.dollyDelta.subVectors(cameraControls.dollyEnd, cameraControls.dollyStart);

        if (cameraControls.dollyDelta.y > 0) {
            dollyIn(cameraControls);
        } else if(cameraControls.dollyDelta.y < 0) {
            dollyOut(cameraControls);
        }

        cameraControls.dollyStart.copy(cameraControls.dollyEnd);
        update(cameraControls);
    }

    function handlePanEnd(cameraControls) {
        cameraControls.panDelta.subVectors(cameraControls.panEnd, cameraControls.panStart);
        pan(cameraControls, cameraControls.panDelta.x, cameraControls.panDelta.y);
        cameraControls.panStart.copy(cameraControls.panEnd);
        update(cameraControls);
    }


    function onMouseDown(cameraControls, event) {
        if (!cameraControls.enabled) {
            return;
        }

        event.preventDefault();

        if (event.button === THREE.MOUSE.LEFT) {
            if (!cameraControls.noPan) {
                cameraControls.state = ControlState.PAN;
                cameraControls.panStart.set(event.clientX, event.clientY);
            } else if (!cameraControls.noRotate) {
                cameraControls.state = ControlState.ROTATE;
                cameraControls.rotateStart.set(event.clientX, event.clientY);
            }
        } else if (event.button === THREE.MOUSE.MIDDLE) {
            if (cameraControls.noZoom) {
                return;
            }
            cameraControls.state = ControlState.DOLLY;
            cameraControls.dollyStart.set(event.clientX, event.clientY);
        }

        if (cameraControls.state !== ControlState.NONE ) {
            // mouse up events can happen outside the canvas as well
            $(window.document).on(getNameSpacedEventName('mousemove'), onMouseMove.bind(null, cameraControls));
            $(window.document).on(getNameSpacedEventName('mouseup'), onMouseUp.bind(null, cameraControls));
            cameraControls.dispatchEvent(ControlEvent.START);
        }
    }

    function onMouseMove(cameraControls, event) {
        if (!cameraControls.enabled) {
            return;
        }

        event.preventDefault();

        if (cameraControls.state === ControlState.ROTATE) {

            if (cameraControls.noRotate) {
                return;
            }
            handleRotation(cameraControls, event.clientX, event.clientY);

        } else if (cameraControls.state === ControlState.DOLLY) {

            if (cameraControls.noZoom) {
                return;
            }

            cameraControls.dollyEnd.set(event.clientX, event.clientY);
            handleDollyEnd(cameraControls);

        } else if (cameraControls.state === ControlState.PAN) {

            if (cameraControls.noPan) {
                return;
            }

            cameraControls.panEnd.set(event.clientX, event.clientY);
            handlePanEnd(cameraControls);
        }
    }

    function onMouseUp(cameraControls, event) {
        $(window.document)
            .off(getNameSpacedEventName('mousemove'))
            .off(getNameSpacedEventName('mouseup'));

        if (!cameraControls.enabled) {
            return;
        }

        cameraControls.dispatchEvent(ControlEvent.END);
        cameraControls.state = ControlState.NONE;
    }

    function onMouseWheel(cameraControls, event) {

        if (!cameraControls.enabled || cameraControls.noZoom || cameraControls.state !== ControlState.NONE ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var delta = 0;
        if (event.wheelDelta !== void 0) {
            delta = event.wheelDelta;
        } else if (event.detail !== void 0) {
            delta = -event.detail;
        }

        if (delta > 0) {
            dollyOut(cameraControls);
        } else if (delta < 0) {
            dollyIn(cameraControls);
        }

        update(cameraControls);
        cameraControls.dispatchEvent(ControlEvent.START);
        cameraControls.dispatchEvent(ControlEvent.END);
    }

    function getTouchDistance(touchEvent) {
        var dx = touchEvent.touches[0].pageX - touchEvent.touches[1].pageX;
        var dy = touchEvent.touches[0].pageY - touchEvent.touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(cameraControls, event) {

        if (!cameraControls.enabled) {
            return;
        }

        switch ( event.touches.length ) {
            case 1:	// one-fingered touch: rotate

                if (cameraControls.noRotate) {
                    return;
                }

                cameraControls.state = ControlState.TOUCH_ROTATE;
                cameraControls.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

                break;

            case 2:	// two-fingered touch: dolly
                if (cameraControls.noZoom) {
                    return;
                }

                cameraControls.state = ControlState.TOUCH_DOLLY;

                var distance = getTouchDistance(event);
                cameraControls.dollyStart.set(0, distance);
                break;

            case 3:// three-fingered touch: pan
                if (cameraControls.noPan) {
                    return;
                }

                cameraControls.state = ControlState.TOUCH_PAN;
                cameraControls.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;

            default:
                cameraControls.state = ControlState.NONE;

        }

        if (cameraControls.state !== ControlState.NONE) {
            cameraControls.dispatchEvent(ControlEvent.START);
        }
    }

    function onTouchMove(cameraControls, event) {

        if (!cameraControls.enabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {
            case 1:// one-fingered touch: rotate

                if (cameraControls.noRotate || cameraControls.state !== ControlState.TOUCH_ROTATE) {
                    return;
                }
                handleRotation(cameraControls, event.touches[0].pageX, event.touches[0].pageY);
                update(cameraControls);
                break;

            case 2:// two-fingered touch: dolly

                if (cameraControls.noZoom || cameraControls.state !== ControlState.TOUCH_DOLLY) {
                    return;
                }

                var distance = getTouchDistance(event);
                cameraControls.dollyEnd.set(0, distance);
                handleDollyEnd(cameraControls);
                break;

            case 3:// three-fingered touch: pan
                if (cameraControls.noPan || cameraControls.state !== ControlState.TOUCH_PAN) {
                    return;
                }

                cameraControls.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                handlePanEnd(cameraControls);
                break;

            default:
                cameraControls.state = ControlState.NONE;

        }
    }

    function onTouchEnd(cameraControls, event) {

        if (!cameraControls.enabled) {
            return;
        }

        cameraControls.dispatchEvent(ControlEvent.END);
        cameraControls.state = ControlState.NONE;
    }

    function getJQueryEventHandler(eventHandler, cameraControls) {
        return function($event) {
            eventHandler.call(this, cameraControls, $event.originalEvent);
        };
    }

    function setUpEventListeners(cameraControls) {
        var mouseWheelHandler = getJQueryEventHandler(onMouseWheel, cameraControls);

        $(cameraControls.canvas)
            .on(getNameSpacedEventName('mousedown'), getJQueryEventHandler(onMouseDown, cameraControls))
            .on(getNameSpacedEventName('mousewheel'), mouseWheelHandler)
            .on(getNameSpacedEventName('DOMMouseScroll'), mouseWheelHandler) // firefox
            .on(getNameSpacedEventName('touchstart'), getJQueryEventHandler(onTouchStart, cameraControls))
            .on(getNameSpacedEventName('touchmove'), getJQueryEventHandler(onTouchMove, cameraControls))
            .on(getNameSpacedEventName('touchend'), getJQueryEventHandler(onTouchEnd, cameraControls));

        $(window.document)
            .off(getNameSpacedEventName('mousemove'))
            .off(getNameSpacedEventName('mouseup'));
    }

    return WebGLCameraControls;
}]);
