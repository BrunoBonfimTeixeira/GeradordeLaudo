// 👉 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkT9CfMw2m5atezryS54Jn6dqc1_GxCak",
  authDomain: "ressonancia-a0e74.firebaseapp.com",
  projectId: "ressonancia-a0e74",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Verifica estado de autenticação
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    return (window.location.href = "../login/login.html");
  }

  const uid = user.uid;
  const email = user.email;
  const mesAtual = new Date().toISOString().slice(0, 7); // Ex: "2025-06"
  document.getElementById("email").value = email;

  try {
    const doc = await db.collection("usuarios").doc(uid).get();
    const dados = doc.data();

    if (doc.exists && dados.acessoLiberadoMes === mesAtual) {
      alert("Acesso já está liberado para este mês.");
      return (window.location.href = "../principal/laudo.html");
    }

    // Gera QR Code do PIX
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
      iniciarVerificacao(uid, mesAtual); // 🔁 Inicia monitoramento
    } else {
      throw new Error("QR Code não retornado.");
    }

  } catch (err) {
    console.error("Erro ao gerar ou verificar o pagamento:", err);
    document.getElementById("statusMsg").textContent = "Erro ao gerar o QR Code. Tente novamente mais tarde.";
  }
});

// 🔁 Verificação contínua do pagamento
function iniciarVerificacao(uid, mesAtual) {
  let tentativas = 0;
  const maxTentativas = 20; // 10 minutos
  const intervalo = setInterval(async () => {
    tentativas++;

    try {
      const doc = await db.collection("usuarios").doc(uid).get();
      const dados = doc.data();

      if (dados?.acessoLiberadoMes === mesAtual) {
        clearInterval(intervalo);
        document.getElementById("statusMsg").textContent = "✅ Pagamento confirmado! Redirecionando...";
        setTimeout(() => {
          window.location.href = "../principal/laudo.html";
        }, 1500);
      } else if (tentativas >= maxTentativas) {
        clearInterval(intervalo);
        document.getElementById("statusMsg").textContent =
          "⏱️ Tempo limite atingido. Recarregue a página para tentar novamente.";
      }
    } catch (err) {
      console.error("Erro ao verificar status do pagamento:", err);
    }
  }, 30000); // a cada 30s
}
