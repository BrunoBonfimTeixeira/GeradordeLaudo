// admin/admin.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exemplo: Listar usuários
admin.auth().listUsers()
  .then((listUsersResult) => {
    listUsersResult.users.forEach((userRecord) => {
      console.log(userRecord.toJSON());
    });
  })
  .catch((error) => {
    console.error("Erro ao listar usuários:", error);
  });
