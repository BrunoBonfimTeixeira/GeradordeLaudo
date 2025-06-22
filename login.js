import { auth, db } from './firebase/firebaseConfig.js';
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, query, where, getDocs, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const identificador = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!identificador || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  let emailParaLogin = identificador;

  try {
    // Se não for um e-mail, tenta achar pelo CRM ou telefone
    const isEmail = identificador.includes('@');
    if (!isEmail) {
      const usersRef = collection(db, "usuarios");

      const q = query(usersRef, where("crm", "==", identificador.toUpperCase()));
      const crmSnapshot = await getDocs(q);

      if (!crmSnapshot.empty) {
        emailParaLogin = crmSnapshot.docs[0].data().email;
      } else {
        const q2 = query(usersRef, where("telefone", "==", identificador));
        const telSnapshot = await getDocs(q2);

        if (!telSnapshot.empty) {
          emailParaLogin = telSnapshot.docs[0].data().email;
        } else {
          throw { code: "auth/user-not-found" };
        }
      }
    }

    // Faz login
    const userCredential = await signInWithEmailAndPassword(auth, emailParaLogin, senha);
    const user = userCredential.user;

    // Verifica se o e-mail está confirmado
    if (!user.emailVerified) {
      alert("⚠️ Verifique seu e-mail antes de acessar o sistema.");
      window.location.href = "../verificarEmail/verificar.html";
      return;
    }

    // Busca no Firestore para verificar se o usuário pagou
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().pagou !== true) {
      window.location.href = "../telaPagar/pagar.html"; // redireciona se não pagou
      return;
    }

    // Se passou em tudo:
    alert("✅ Login realizado com sucesso!");
    window.location.href = "principal/laudo.html";

  } catch (error) {
    console.error(error);
    let msg = "Erro ao fazer login.";
    if (error.code === "auth/user-not-found") {
      msg = "Usuário não encontrado.";
    } else if (error.code === "auth/wrong-password") {
      msg = "Senha incorreta.";
    } else if (error.code === "auth/invalid-email") {
      msg = "Identificador inválido.";
    }
    alert("❌ " + msg);
  }
});
