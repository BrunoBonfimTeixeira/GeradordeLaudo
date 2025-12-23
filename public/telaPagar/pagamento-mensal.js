import { auth } from "../firebase/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Mostrar nome do usuário logado na tela
onAuthStateChanged(auth, (user) => {
  const nomeEl = document.getElementById("nomeUsuario");
  
  if (user) {
    const nomeUsuario = user.displayName || user.email || "Usuário sem nome";
    nomeEl.textContent = `Olá, ${nomeUsuario}! Confirme seu pagamento abaixo.`;
  } else {
    nomeEl.textContent = "Olá! Faça login para continuar.";
  }
});

// Botão fechar
document.getElementById("closeBtn").addEventListener("click", () => {
  window.location.href = "/principal/laudo.html";
});

// Botão "Já Realizei o Pagamento"
document.getElementById("confirmarPagamento").addEventListener("click", () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Você precisa estar logado para confirmar o pagamento.");
    return;
  }

  const nomeUsuario = user.displayName || user.email || "Usuário sem nome";

  // Envia e-mail via Formsubmit
  fetch("https://formsubmit.co/ajax/nobruwel@hotmail.com", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      nome: nomeUsuario,
      mensagem: "O usuário confirmou o pagamento da mensalidade."
    })
  })
  .then(() => {
    alert("Obrigado! Seu pagamento será verificado em breve.");
    window.location.href = "/principal/laudo.html";
  })
  .catch(error => {
    alert("Erro ao notificar. Por favor, tente novamente.");
    console.error("Erro ao enviar email:", error);
  });
});

// Botão copiar código Pix
document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("pixCode");
  code.select();
  code.setSelectionRange(0, 99999); // Compatibilidade com mobile
  document.execCommand("copy");
  alert("Código Pix copiado com sucesso!");
});
