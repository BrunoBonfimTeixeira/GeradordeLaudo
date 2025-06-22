// Corrija o caminho conforme a estrutura do seu projeto:
// Se este JS estiver em /verificar/verificar.js, use '../firebase/firebaseConfig.js'
import { auth } from '../firebase/firebaseConfig.js';
import {
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Botão de reenviar verificação
const btnReenviar = document.getElementById('reenviar');
const btnLogout = document.getElementById('logout');

// Reenvia o e-mail de verificação
btnReenviar?.addEventListener('click', async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      alert("✅ E-mail de verificação reenviado com sucesso!");
    } catch (error) {
      console.error("Erro ao reenviar o e-mail:", error);
      alert("❌ Ocorreu um erro ao reenviar o e-mail.");
    }
  } else {
    alert("Usuário não autenticado.");
  }
});

// Botão para voltar ao login
btnLogout?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "../login/login.html";
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    alert("❌ Erro ao sair. Tente novamente.");
  }
});
