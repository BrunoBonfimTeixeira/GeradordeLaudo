import { auth, db } from './firebase/firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Formulário de login
document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert("⚠️ Preencha todos os campos.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // 🔍 Verifica se está cadastrado no Firestore
    const docRef = doc(db, "usuarios", user.uid);
    console.time("Firestore read"); // ⏱️ Inicia medição
    const docSnap = await getDoc(docRef);
    console.timeEnd("Firestore read"); // ⏱️ Finaliza medição

    if (!docSnap.exists()) {
      alert("⚠️ Usuário não está cadastrado no sistema.");
      return;
    }

    // 🔁 Redireciona conforme o e-mail
    if (user.email === "nobruwel@hotmail.com") {
      window.location.href = "/admin/admin.html";
    } else {
      window.location.href = "/principal/laudo.html";
    }

  } catch (error) {
    console.error("Erro no login:", error);

    let msg = "Erro ao fazer login.";
    switch (error.code) {
      case "auth/user-not-found":
        msg = "Usuário não encontrado.";
        break;
      case "auth/wrong-password":
        msg = "Senha incorreta.";
        break;
      case "auth/invalid-email":
        msg = "Email inválido.";
        break;
    }

    alert("❌ " + msg);
  }
});
