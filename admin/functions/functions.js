const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

admin.initializeApp();

mercadopago.configure({
  access_token: "TEST-1907809625769077-062112-f84e9a016b5fd2a682b9b2c192be9acf-216626985"
});

// Gera QR Code para pagamento PIX
exports.gerarPix = functions.https.onRequest(async (req, res) => {
  const { uid, email } = req.body;

  try {
    const pagamento = await mercadopago.payment.create({
      transaction_amount: 220,
      description: "Acesso ao sistema - Plano Mensal",
      payment_method_id: "pix",
      payer: { email },
      external_reference: uid
    });

    const qrBase64 = pagamento.body.point_of_interaction.transaction_data.qr_code_base64;
    res.json({ qrCode: qrBase64 });
  } catch (error) {
    console.error("Erro ao gerar pagamento:", error);
    res.status(500).send("Erro ao gerar pagamento");
  }
});

// Webhook para liberar acesso após pagamento aprovado
exports.webhookMercadoPago = functions.https.onRequest(async (req, res) => {
  const paymentId = req.body.data?.id;
  if (!paymentId) return res.status(400).send("Faltando ID");

  try {
    const response = await mercadopago.payment.get(paymentId);
    const payment = response.body;

    if (payment.status === "approved") {
      const uid = payment.external_reference;
      const mesAtual = new Date().toISOString().slice(0, 7); // ex: 2025-06

      await admin.firestore().collection("usuarios").doc(uid).set({
        acessoLiberadoMes: mesAtual
      }, { merge: true });

      return res.status(200).send("Acesso liberado.");
    }

    res.status(200).send("Pagamento ainda não aprovado.");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).send("Erro no webhook");
  }
});
