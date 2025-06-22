    import { auth } from './firebase/firebaseConfig.js';
    import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

    document.getElementById('recuperar').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const msg = document.getElementById('mensagem');
      try {
        await sendPasswordResetEmail(auth, email);
        msg.textContent = "✅ Verifique seu e-mail!";
        msg.style.color = "lightgreen";
      } catch (e) {
        msg.textContent = "❌ Erro: " + e.message;
        msg.style.color = "salmon";
      }
    });

    document.getElementById('voltar').addEventListener('click', () => {
      window.location.href = "index.html"; // ou ajuste o caminho conforme sua estrutura
    });