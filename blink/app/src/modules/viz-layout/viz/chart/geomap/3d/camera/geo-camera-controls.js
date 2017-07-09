/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Camera controls for 3D geo visualization.
 */

'use strict';


blink.app.factory('GeoCameraControls', ['Logger', 'blinkConstants', 'strings', 'jsonConstants', 'util', 'geoUtil',
    'WebGLCameraControls',
    function (Logger, blinkConstants, strings, jsonConstants, util, geoUtil, WebGLCameraControls) {

        var PERSPECTIVE_PLANE_ANGLE_RADIANS = 14 * Math.PI/180;
        var PERSPECTIVE_PLANE_CAMERA_DEFAULT_DISTANCE_FACTOR = 2.5;
        var MIN_CAMERA_EARTH_DISTANCE = 0.001;
        var MAX_CAMERA_EARTH_DISTANCE = 5.0;

        var logger = Logger.create('geo-camera-controls');

        function CameraRotationManager(rotationDuration, rotationDelay) {
            this.rotationDuration = rotationDuration;
            this.rotationDelay = rotationDelay;

            this.currentPosition = new THREE.Vector3();

            this.initialPosition = null;
            this.finalPosition = null;
            this.rotationAngle = 0;
            this.scale = 1;
            this.rotationPlaneNormal = new THREE.Vector3();

            this.clock = null;
            this.clockInitPending = false;
        }

        CameraRotationManager.prototype.reset = function (initialPosition, finalPosition) {
            this.initialPosition = initialPosition;
            this.finalPosition = finalPosition;

            this.rotationAngle = this.finalPosition.angleTo(this.initialPosition);
            if (isNaN(this.rotationAngle)) {
                this.rotationAngle = 0;
            }

            var initialUnit = this.initialPosition.clone();
            initialUnit.normalize();

            var finalUnit = this.finalPosition.clone();
            finalUnit.normalize();

            this.rotationPlaneNormal.crossVectors(initialUnit, finalUnit);
            if (this.rotationPlaneNormal.length() === 0) {
                this.rotationPlaneNormal = new THREE.Vector3(0, 1, 0);
            }

            this.scale = this.finalPosition.length()/this.initialPosition.length();
            if (!isFinite(this.scale)) {
                this.scale = 1;
            }
            this.clockInitPending = true;
        };

        CameraRotationManager.prototype.isIdle = function () {
            return !this.clockInitPending && !this.clock;
        };

        CameraRotationManager.prototype.getPosition = function () {
            if (this.isIdle()) {
                return this.finalPosition;
            }

            if (this.clockInitPending) {
                this.clockInitPending = false;
                this.clock = new THREE.Clock();
            }

            var elapsedTime = this.clock.getElapsedTime() * 1000;
            if (elapsedTime < this.rotationDelay) {
                return;
            }
            elapsedTime -= this.rotationDelay;

            var timeFraction = elapsedTime/this.rotationDuration;
            timeFraction = Math.min(1, Math.max(0, timeFraction));
            var rotationAngle = this.rotationAngle * timeFraction;
            var scale = this.scale * timeFraction;

            this.currentPosition.copy(this.initialPosition);
            this.currentPosition.applyAxisAngle(this.rotationPlaneNormal, rotationAngle);
            this.currentPosition.multiplyScalar(scale);

            this.currentPosition.copy(this.initialPosition);
            this.currentPosition.lerp(this.finalPosition, timeFraction);

            if (timeFraction == 1) {
                this.clock.stop();
                this.clock = null;
            }
            return this.currentPosition;
        };

        function GeoCameraControls(camera, canvas, projectionType) {
            this.camera = camera;
            this.canvas = canvas;
            this.isDestroyed = false;

            GeoCameraControls.__super.call(this, camera, canvas);

            this.cameraRotationManager = new CameraRotationManager(
            geoUtil.Constants.PROJECTION_TRANSITION_DURATION,
            2 * geoUtil.Constants.PROJECTION_TRANSITION_DURATION
        );
            this.setProjectionType(projectionType);
        }
        util.inherits(GeoCameraControls, WebGLCameraControls);

        GeoCameraControls.prototype.setProjectionType = function (projectionType) {
            var oldProjectionType = this.projectionType;
            this.projectionType = projectionType;

            updateControlDefaultConfig(this);
            updateCameraPosition(this, this.projectionType, oldProjectionType);
        };

        GeoCameraControls.prototype.update = function () {
            GeoCameraControls.__super.prototype.update.call(this);

            if (geoUtil.isProjectionGlobe(this.projectionType)) {
                var cameraDistance = this.camera.position.length();
                this.rotateSpeed = Math.pow(cameraDistance, 2)/10;
                this.zoomSpeed = Math.pow(cameraDistance, 2)/32;
            }

            if (this.cameraRotationManager.isIdle()) {
                return;
            }

            var newCameraPosition = this.cameraRotationManager.getPosition();
            if (newCameraPosition) {
                this.camera.position.copy(newCameraPosition);
            }
        };

        GeoCameraControls.prototype.zoomToFit = function (geoBounds) {
        // we assume that geo bounds rectangle is parallel to the x-y plane

            var topLeftXYZ = getXYZForGeoCoordinates(geoBounds.topLeft, this.projectionType);
            var topRightXYZ = getXYZForGeoCoordinates(geoBounds.topRight, this.projectionType);
            var bottomRightXYZ = getXYZForGeoCoordinates(geoBounds.bottomRight, this.projectionType);

            var boundsWidth = Math.abs(topRightXYZ.x - topLeftXYZ.x);
            var boundsHeight = Math.abs(bottomRightXYZ.y - topRightXYZ.y);

            var boundsCenterX = (topLeftXYZ.x + topRightXYZ.x)/2;
            var boundCenterY = (topRightXYZ.y + bottomRightXYZ.y)/2;
            var boundCenterZ = (topLeftXYZ.z + bottomRightXYZ.z)/2;

        //
        //
        //               C(camera)
        //               ..  .
        //               . .   .
        //               .  .    .
        //               .   .     .
        //               P...A.......B
        //
        //
        // angle ACB = FOV (θ)
        // angle ABC = view inclination (α) (ABC = BAC for map and globe, ABC < BAC for perspective plane)
        // angle CPA = 90 degrees
        // length(AB) = dimension of the earth in viewport
        // PAB is along +y-axis
        // PC is along +z-axis
        // length(PC) = length(AB) * (sin(α)/sin(θ)) * sin(θ + α)
        // length(PA) = length(AB) * (sin(α)/sin(θ)) * cos(θ + α)

            var biggerDimension = Math.max(boundsHeight, boundsWidth/this.camera.aspect);
        // in perspective view the camera needs to be backed up a little extra to
        // make it look good, we increase the area to be covered to get the same effect
            if (geoUtil.isProjectionPerspectivePlane(this.projectionType)) {
                biggerDimension *= PERSPECTIVE_PLANE_CAMERA_DEFAULT_DISTANCE_FACTOR;
            }

            var cameraX = boundsCenterX;
            var theta = this.camera.fov * Math.PI/180;

            var alpha = PERSPECTIVE_PLANE_ANGLE_RADIANS;
            if (!geoUtil.isProjectionPerspectivePlane(this.projectionType)) {
                alpha = (Math.PI - theta) * 0.5;
            }

            var sineQuotient = Math.sin(alpha)/Math.sin(theta);
            var cameraY = bottomRightXYZ.y - (biggerDimension * sineQuotient  * Math.cos(theta + alpha));
            var cameraZ = biggerDimension * sineQuotient * Math.sin(theta + alpha);

            var cameraPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);

            updateControlDefaultConfig(this);

            if (geoUtil.isProjectionGlobe(this.projectionType)) {
                var earthRadius = Math.sqrt(
                Math.pow(topLeftXYZ.x, 2) +
                Math.pow(topLeftXYZ.y, 2) +
                Math.pow(topLeftXYZ.z, 2)
            );

                var cameraDistanceFromTarget = cameraPosition.length();
                var scale = (cameraDistanceFromTarget + earthRadius)/cameraDistanceFromTarget;
                cameraPosition.multiplyScalar(scale);

            // camera is always looking at the origin in case of globe
                this.setTarget(0, 0, 0);

            } else {
                this.setTarget(boundsCenterX, boundCenterY, boundCenterZ);
            }

            this.cameraRotationManager.reset(this.camera.position, cameraPosition);
        };

        GeoCameraControls.prototype.destroy = function () {
            this.isDestroyed = true;
            GeoCameraControls.__super.prototype.destroy.call(this);
        };

        function updateControlDefaultConfig(cameraControls) {
            cameraControls.reset();

            cameraControls.minDistance = MIN_CAMERA_EARTH_DISTANCE;
            cameraControls.maxDistance = MAX_CAMERA_EARTH_DISTANCE;

            var projectionType = cameraControls.projectionType;

            if (geoUtil.isProjectionGlobe(projectionType)) {
                cameraControls.setRotateOnDrag(true);
                cameraControls.minDistance = geoUtil.Constants.EARTH_RADIUS + MIN_CAMERA_EARTH_DISTANCE;

            } else if (geoUtil.isProjectionMap(projectionType)) {
                cameraControls.setRotateOnDrag(false);
            } else if (geoUtil.isProjectionPerspectivePlane(projectionType)) {
                cameraControls.setRotateOnDrag(false);
            } else {
                logger.warn('unhandled projection type', projectionType);
            }
        }

        function getCameraPositionForProjection(projectionType) {
            switch (projectionType) {
                case blinkConstants.geo3dProjectionTypes.GLOBE:
                    return new THREE.Vector3(0, 0, 5);
                case blinkConstants.geo3dProjectionTypes.MAP:
                    return new THREE.Vector3(0, 0, 5);
                case blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE:
                    return new THREE.Vector3(0, -5, 3.3);
            }
            logger.warn('unhandled projection type', projectionType);
            return null;
        }

        function updateCameraPosition(cameraControls, newProjection, oldProjection) {
            var initialPosition =
            oldProjection ? getCameraPositionForProjection(oldProjection) : new THREE.Vector3(1, 1, 1);
            var finalPosition = getCameraPositionForProjection(newProjection);
            cameraControls.cameraRotationManager.reset(initialPosition, finalPosition);
            cameraControls.camera.position.copy(finalPosition);
        }

        function getXYZForGeoCoordinates(geoCoordinates, projectionType) {
            switch (projectionType) {
                case blinkConstants.geo3dProjectionTypes.GLOBE:
                    return geoUtil.convertLatLongToXYZSpherical(
                geoCoordinates.latitude,
                geoCoordinates.longitude,
                geoCoordinates.altitude
            );
                case blinkConstants.geo3dProjectionTypes.MAP:
                case blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE:
                    return geoUtil.convertLatLongToXYZMercator(
                geoCoordinates.latitude,
                geoCoordinates.longitude,
                geoCoordinates.altitude
            );
                default:
                    logger.error('unknown projection type for camera control', projectionType);
                    return null;
            }
        }

        function getCameraDistanceToFitHeight(height, cameraFov) {
            return height/(2 * Math.tan((cameraFov/2) * (Math.PI/180)));
        }

        return GeoCameraControls;
    }]);
