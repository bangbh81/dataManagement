'use strict'

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);
let database = admin.firestore();

/* Pub|Sub trigger */
exports.pubsubDefaultTrigger = functions.pubsub.topic('default').onPublish( async (message, context) => {
  let eventMessage = {
    message: Buffer.from(message.data, 'base64').toString(),
    deviceId: message.attributes.deviceId,
    deviceNumId: message.attributes.deviceNumId,
    deviceRegistryId: message.attributes.deviceRegistryId,
    subfolder: message.attributes.subFolder,
    eventTriggeredAt: context.timestamp
  };
  try {
    //Find the device ID.
    const deviceEventSnapshot = await database.collection('dataSource').doc(message.attributes.deviceId).get();
    if(!deviceEventSnapshot.exists){
      throw new Error('No device exists');
    } else {
      const result = await deviceEventSnapshot.ref.collection('events').add(eventMessage);
      console.log('Added document with ID: ', result.id);
    }
  } catch(error) {
    console.log(error);
  }
});

exports.pubsubStateTrigger = functions.pubsub.topic('state').onPublish( async (message, context) =>{
  let stateMessage = {
    message: Buffer.from(message.data, 'base64').toString(),
    deviceId: message.attributes.deviceId,
    deviceNumId: message.attributes.deviceNumId,
    deviceRegistryId: message.attributes.deviceRegistryId,
    eventTriggeredAt: context.timestamp
  };
  try {
    //Find the device ID.
    const deviceEventSnapshot = await database.collection('dataSource').doc(message.attributes.deviceId).get();
    if(!deviceEventSnapshot.exists){
      throw new Error('No device exists');
    } else {
      const result = await deviceEventSnapshot.ref.collection('state').add(stateMessage);
      console.log('Added document with ID: ', result.id);
    }
  } catch(error) {
    console.log(error);
  }
});

/*
  try {
    //Find the device ID.
    const deviceEventSnapshot = await database.collection('dataSource').doc(message.attributes.deviceId).get();
    if(!deviceEventSnapshot.exists){ throw new Error('No device exists'); }

    const deviceSnapshotData = deviceEventSnapshot.data();
    if(deviceSnapshotData !== undefined){
      const result = await deviceSnapshotData.ref.collection('state').add(stateMessage);
      console.log('Added document with ID: ', result.id);
    } else { throw new Error('No device exists'); }
  } catch(error) {
    console.log(error);
  }
*/