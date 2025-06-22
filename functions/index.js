const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Payment } = require("mercadopago");

admin.initializeApp();

// ✅ Configuração correta com a nova SDK (v2.8.0)
const client = new MercadoPagoConfig({
  accessToken: "TEST-1907809625769077-062112-f84e9a016b5fd2a682b9b2c192be9acf-216626985"
});

// Gera QR Code PIX
exports.gerarPix = functions.https.onRequest(async (req, res) => {
  const { uid, email } = req.body;

  if (!uid || !email) {
    return res.status(400).send("uid ou email ausente.");
  }

  try {
    const pagamento = await new Payment(client).create({
      transaction_amount: 220,
      description: "Acesso ao sistema - Plano Mensal",
      payment_method_id: "pix",
      payer: { email },
      external_reference: uid
    });

    const qrBase64 = pagamento.point_of_interaction.transaction_data.qr_code_base64;
    res.json({ qrCode: qrBase64 });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    res.status(500).send("Erro ao gerar QR Code.");
  }
});

// Webhook do Mercado Pago
exports.webhookMercadoPago = functions.https.onRequest(async (req, res) => {
  const paymentId = req.body?.data?.id;

  if (!paymentId) return res.status(400).send("ID de pagamento ausente.");

  try {
    const pagamento = await new Payment(client).get({ id: paymentId });

    const status = pagamento.status;
    const uid = pagamento.external_reference;

    if (status === "approved") {
      const mesAtual = new Date().toISOString().slice(0, 7);

      await admin.firestore().collection("usuarios").doc(uid).set({
        acessoLiberadoMes: mesAtual
      }, { merge: true });

      return res.status(200).send("Acesso liberado.");
    }

    return res.status(200).send("Pagamento não aprovado.");
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).send("Erro ao processar webhook.");
  }
});
