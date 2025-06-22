// admin/admin.js

const admin = require("firebase-admin");
const path = require("path");

// Caminho seguro para a chave de serviço
const serviceAccount = require(path.resolve(__dirname, "serviceAccountKey.json"));

// Inicialização do Firebase Admin com a credencial do serviço
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exemplo: Listar todos os usuários do Firebase Auth
admin.auth().listUsers()
  .then((listUsersResult) => {
    console.log(`Total de usuários: ${listUsersResult.users.length}`);
    listUsersResult.users.forEach((userRecord) => {
      console.log(`Usuário: ${userRecord.email} | UID: ${userRecord.uid}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao listar usuários:", error);
  });
