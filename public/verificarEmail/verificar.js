// Importa a configuração do Firebase
import { auth } from '../firebase/firebaseConfig.js';

// Importa funções específicas do Firebase Auth (compatível com modular SDK)
import {
  sendEmailVerification,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

// Seleciona os botões
const btnReenviar = document.getElementById('reenviar');
const btnLogout = document.getElementById('logout');

// 📧 Reenviar e-mail de verificação
btnReenviar?.addEventListener('click', async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("❌ Nenhum usuário autenticado.");
    return;
  }

  try {
    await sendEmailVerification(user);
    alert("✅ E-mail de verificação reenviado com sucesso!");
  } catch (error) {
    console.error("Erro ao reenviar o e-mail:", error);
    alert("❌ Erro ao reenviar e-mail de verificação.");
  }
});

// 🔓 Sair e voltar para o login
btnLogout?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("❌ Erro ao sair. Tente novamente.");
  }
});
