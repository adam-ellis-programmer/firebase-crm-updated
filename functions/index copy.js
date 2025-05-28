// const functions = require('firebase-functions')
// const { admin, db } = require('./firebase.config')

// // context is ...
// // this can be done on sign up too
// //  see custom clains in nav onAuthStateChanged
// // onAuthStateChanged can be checkd anywhere
// exports.addAdminRole = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then((user) => {
//       console.log(user)
//       return admin.auth().setCustomUserClaims(user.uid, {
//         admin: data.admin,
//         manager: data.manager,
//         ceo: data.ceo,
//         sales: data.sales,
//         reportsTo: data.reportsTo,
//       })
//     })
//     .then(() => {
//       // re-fetch the user to get updated usr info
//       return admin.auth().getUserByEmail(data.email)
//     })
//     .then((updatedUser) => {
//       console.log('Updated user custom claims:', updatedUser.customClaims)
//       return {
//         message: `${data.email} has been assigned these roles.`,
//         customClaims: updatedUser.customClaims,
//         user: updatedUser,
//         status: 'ok',
//       }
//     })
//     .catch((err) => {
//       console.log(err)
//       return { error: err.message, status: 'error' }
//     })
// })

// exports.getUser = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then((data) => {
//       return data
//     })
// })

// exports.makeNewUser = functions.https.onCall((data, context) => {
//   console.log(context)
//   console.log(data)

//   return admin
//     .auth()
//     .createUser({
//       email: data.email,
//       password: data.password,
//       displayName: data.name,
//     })
//     .then((userRecord) => {
//       console.log(userRecord)
//       console.log('Successfully created new user:', userRecord.uid)
//       // this return get returned to the outer function
//       return {
//         data: userRecord,
//         msg: `Successfully created new user ${userRecord.displayName}: whos id is ${userRecord.uid} `,
//       }
//       // See the UserRecord reference doc for the contents of userRecord.
//     })
//     .catch((error) => {
//       console.log('Error creating new user:', error)
//     })
// })

// exports.globalArray = []

// exports.deleteAgent = functions.https.onCall((data, context) => {
//   return admin
//     .auth()
//     .getUserByEmail(data.email)
//     .then((user) => {
//       admin.auth().deleteUser(user.uid)
//       return user
//     })
//     .then((user) => {
//       console.log('Successfully deleted user')
//       exports.globalArray.push({
//         userData: user,
//         status: 'ok',
//         msg: `success ${user.uid} has been deleted`,
//       })
//       return {
//         userData: user,
//         msg: `success ${user.displayName} has been deleted`,
//       }
//     })
//     .catch((error) => {
//       console.log('Error deleting user:', error)
//       return {
//         status: 'error',
//       }
//     })
// })

// exports.updateDBPermissions = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     console.log('context===>', context)
//     throw new functions.https.HttpsError(
//       'unauthenticated',
//       'User must be authenticated to perform this operation.'
//     )
//   }

//   const { oldId, newId } = data

//   if (!oldId || !newId) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'The function must be called with "oldId" and "newId" arguments.'
//     )
//   }

//   const customersRef = db.collection('customers')
//   const q = customersRef.where('reportsTo.id', '==', oldId)

//   try {
//     const querySnapshot = await q.get()
//     if (querySnapshot.empty) {
//       return { message: 'No matching documents found.' }
//     }

//     const batch = db.batch()

//     querySnapshot.forEach((doc) => {
//       const customerRef = doc.ref
//       batch.update(customerRef, { 'reportsTo.id': newId })
//     })

//     await batch.commit()
//     return { message: 'Batch update committed successfully.' }
//   } catch (error) {
//     console.error('Error updating documents:', error)
//     throw new functions.https.HttpsError('internal', 'Unable to complete batch update.')
//   }
// })

// // prettier-ignore
// exports.listAllUsers = functions.https.onCall((data, context) => {
//   const users = [];

//   const listAllUsers = (nextPageToken) => {
//     // this initial return returns the 
//     // users array that is on line 115 to exports.listAllUsers
//     return admin.auth().listUsers(1000, nextPageToken)
//       .then((listUsersResult) => {

//         listUsersResult.users.forEach((userRecord) => {
//           users.push(userRecord.toJSON());
//         });
//         if (listUsersResult.pageToken) {
//           return listAllUsers(listUsersResult.pageToken);
//         }
//         return users;
//       })
//       .catch((error) => {
//         throw new functions.https.HttpsError('unknown', 'Failed to list users', error);
//       });
//   };

//   return listAllUsers()
//     .then((fetchedUsers) => {
//       console.log('Successfully fetched all users:', fetchedUsers.length);
//       return { users: fetchedUsers };
//     })
//     .catch((error) => {
//       console.error('Error in listAllUsers:', error);
//       throw new functions.https.HttpsError('unknown', 'Failed to list users', error);
//     });
// });

// exports.testFunctionForBe = functions.https.onCall(async (data, context) => {
//   return { message: 'Batch update committed successfully.' }
// })
