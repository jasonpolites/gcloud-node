/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * @module compute/autoscaler
 */

'use strict';

var nodeutil = require('util');

/**
 * @type {module:common/serviceObject}
 * @private
 */
var ServiceObject = require('../common/service-object.js');

/**
 * @type {module:common/util}
 * @private
 */
var util = require('../common/util.js');

/*! Developer Documentation
 *
 * @param {module:compute/zone} zone - Zone object this autoscaler belongs to.
 * @param {string} name - Name of the autoscaler.
 */
/**
 * Autoscalers allow you to automatically scale virtual machine instances in
 * managed instance groups according to an autoscaling policy that you define.
 *
 * @resource [Autoscaling Groups of Instances]{@link https://cloud.google.com/compute/docs/autoscaler}
 *
 * @constructor
 * @alias module:compute/autoscaler
 *
 * @example
 * var gcloud = require('gcloud')({
 *   keyFilename: '/path/to/keyfile.json',
 *   projectId: 'grape-spaceship-123'
 * });
 *
 * var gce = gcloud.compute();
 *
 * var zone = gce.zone('us-central1-a');
 *
 * var autoscaler = zone.autoscaler('autoscaler-name');
 */
function Autoscaler(zone, name) {
  var methods = {
    /**
     * Create an autoscaler.
     *
     * @param {object} config - See {module:compute/zone#createAutoscaler}.
     *
     * @example
     * autoscaler.create({
     *   coolDown: 30,
     *   cpu: 80,
     *   loadBalance: 40,
     *   maxReplicas: 5,
     *   minReplicas: 0,
     *   target: 'instance-group-1'
     * }, function(err, autoscaler, operation, apiResponse) {
     *   // `autoscaler` is an Autoscaler object.
     *
     *   // `operation` is an Operation object that can be used to check the
     *   // of the request.
     * });
     */
    create: true,

    /**
     * Check if the autoscaler exists.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this
     *     request.
     * @param {boolean} callback.exists - Whether the autoscaler exists or not.
     *
     * @example
     * autoscaler.exists(function(err, exists) {});
     */
    exists: true,

    /**
     * Get an autoscaler if it exists.
     *
     * You may optionally use this to "get or create" an object by providing an
     * object with `autoCreate` set to `true`. Any extra configuration that is
     * normally required for the `create` method must be contained within this
     * object as well.
     *
     * @param {options=} options - Configuration object.
     * @param {boolean} options.autoCreate - Automatically create the object if
     *     it does not exist. Default: `false`
     *
     * @example
     * autoscaler.get(function(err, autoscaler, apiResponse) {
     *   // `autoscaler` is an Autoscaler object.
     * });
     */
    get: true,

    /**
     * Get the metadata of this autoscaler.
     *
     * @resource [Autoscaler Resource]{@link https://cloud.google.com/compute/docs/reference/v1/autoscalers}
     * @resource [Autoscalers: get API Documentation]{@link https://cloud.google.com/compute/docs/reference/v1/autoscalers/get}
     *
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this
     *     request.
     * @param {object} callback.metadata - The autoscaler's metadata.
     * @param {object} callback.apiResponse - The full API response.
     *
     * @example
     * autoscaler.getMetadata(function(err, metadata, apiResponse) {});
     */
    getMetadata: true
  };

  ServiceObject.call(this, {
    parent: zone,
    baseUrl: '/autoscalers',
    id: name,
    createMethod: zone.createAutoscaler.bind(zone),
    methods: methods
  });

  this.name = name;
  this.zone = zone;
}

nodeutil.inherits(Autoscaler, ServiceObject);

/**
 * Delete the autoscaler.
 *
 * @resource [Autoscalers: delete API Documentation]{@link https://cloud.google.com/compute/docs/reference/v1/autoscalers/delete}
 *
 * @param {function=} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {module:compute/operation} callback.operation - An operation object
 *     that can be used to check the status of the request.
 * @param {object} callback.apiResponse - The full API response.
 *
 * @example
 * autoscaler.delete(function(err, operation, apiResponse) {
 *   // `operation` is an Operation object that can be used to check the status
 *   // of the request.
 * });
 */
Autoscaler.prototype.delete = function(callback) {
  callback = callback || util.noop;

  var zone = this.zone;

  ServiceObject.prototype.delete.call(this, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    var operation = zone.operation(resp.name);
    operation.metadata = resp;

    callback(null, operation, resp);
  });
};

/**
 * Set the autoscaler's metadata.
 *
 * @resource [Autoscaler Resource]{@link https://cloud.google.com/compute/docs/reference/v1/autoscalers}
 *
 * @param {object} metadata - See a
 *     [Firewall resource](https://cloud.google.com/compute/docs/reference/v1/autoscalers).
 * @param {function=} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {module:compute/operation} callback.operation - An operation object
 *     that can be used to check the status of the request.
 * @param {object} callback.apiResponse - The full API response.
 *
 * @example
 * var metadata = {
 *   description: 'New description'
 * };
 *
 * autoscaler.setMetadata(metadata, function(err, operation, apiResponse) {
 *   // `operation` is an Operation object that can be used to check the status
 *   // of the request.
 * });
 */
Autoscaler.prototype.setMetadata = function(metadata, callback) {
  var zone = this.zone;

  callback = callback || util.noop;

  metadata = metadata || {};
  metadata.name = this.name;
  metadata.zone = this.zone.name;

  zone.request({
    method: 'PATCH',
    uri: '/autoscalers',
    qs: {
      autoscaler: this.name
    },
    json: metadata
  }, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    var operation = zone.operation(resp.name);
    operation.metadata = resp;

    callback(null, operation, resp);
  });
};

module.exports = Autoscaler;
