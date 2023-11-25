const firebase = require('firebase-admin')
const serviceAccount = require('../keys/firebase.json')

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
   });

const db = firebase.firestore();

async function get(collection, id){
    let resp = await db.collection(collection).doc(id.trim()).get()
    return resp.data()
}

async function getCollection(collection){
    let resp = await db.collection(collection).get()

    if(resp.empty)
    return []

    let data = []

    resp.forEach(doc=> data.push({id: doc.id, ...doc.data()}))
    return data
}

async function deleteDoc(collection, id){
    await db.collection(collection).doc(id).delete();
}

async function set(collection, id, data){
    await db.collection(collection).doc(id).set({...data})
}


async function addToArray(collection, id, fieldName, newItem) {
    
      const docRef = db.collection(collection).doc(id);
      const doc = await docRef.get();
  
      if (!doc.exists) {
        console.log(`Document with ID ${id} does not exist`);
        return;
      }
  
      const existingArray = doc.data()[fieldName] || [];
      existingArray.push(newItem);
      await docRef.update({ [fieldName]: existingArray });
  }


module.exports = {get, getCollection, addToArray}