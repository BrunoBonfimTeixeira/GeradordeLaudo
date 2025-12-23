const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.removerCampoPlano = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("usuarios").get();

    const batch = db.batch();

    snapshot.forEach(doc => {
      const ref = db.collection("usuarios").doc(doc.id);
      batch.update(ref, { plano: admin.firestore.FieldValue.delete() });
    });

    await batch.commit();

    res.status(200).send("✅ Campo 'plano' removido com sucesso de todos os usuários.");
  } catch (error) {
    console.error("Erro ao remover campo:", error);
    res.status(500).send("❌ Erro ao remover campo.");
  }
});
