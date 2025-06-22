// 👉 Substitua pelos dados reais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkT9CfMw2m5atezryS54Jn6dqc1_GxCak",
  authDomain: "ressonancia-a0e74.firebaseapp.com",
  projectId: "ressonancia-a0e74",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Você precisa estar logado.");
    return (window.location.href = "../login/login.html");
  }

  const uid = user.uid;
  const email = user.email;
  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0, 7); // Ex: "2025-06"

  document.getElementById("email").value = email;

  try {
    const doc = await db.collection("usuarios").doc(uid).get();
    if (doc.exists && doc.data().acessoLiberadoMes === mesAtual) {
      alert("Acesso já está liberado para este mês.");
      return (window.location.href = "../principal/laudo.html");
    }

    // Gerar QR Code PIX
    document.getElementById("statusMsg").textContent = "Gerando QR Code PIX...";

    const response = await fetch("https://us-central1-ressonancia-a0e74.cloudfunctions.net/gerarPix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email }),
    });

    const data = await response.json();

    if (data.qrCode) {
      document.getElementById("pixImage").src = "data:image/png;base64," + data.qrCode;
      document.getElementById("qrCodeContainer").style.display = "block";
      document.getElementById("statusMsg").textContent = "Escaneie o QR Code abaixo para concluir o pagamento.";

      // ⏱️ Inicia verificação automática
      iniciarVerificacao(uid, mesAtual);
    } else {
      document.getElementById("statusMsg").textContent = "Erro ao gerar QR Code.";
    }

  } catch (err) {
    console.error("Erro ao verificar pagamento:", err);
    document.getElementById("statusMsg").textContent = "Erro ao verificar pagamento.";
  }
});

// 🔁 Verifica a cada 30s se o pagamento foi aprovado
function iniciarVerificacao(uid, mesAtual) {
  let tentativas = 0;
  const maxTentativas = 20; // ~10 minutos

  const intervalo = setInterval(async () => {
    tentativas++;

    try {
      const doc = await firebase.firestore().collection("usuarios").doc(uid).get();
      const dados = doc.data();

      if (dados && dados.acessoLiberadoMes === mesAtual) {
        clearInterval(intervalo);
        document.getElementById("statusMsg").textContent = "Pagamento confirmado! Redirecionando...";
        setTimeout(() => window.location.href = "../principal/laudo.html", 1500);
      } else if (tentativas >= maxTentativas) {
        clearInterval(intervalo);
        document.getElementById("statusMsg").textContent = "Tempo limite atingido. Recarregue a página para tentar novamente.";
      }

    } catch (err) {
      console.error("Erro ao verificar status do pagamento:", err);
    }
  }, 30000); // 30 segundos
}
