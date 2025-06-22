import { auth, db } from '../firebase/firebaseConfig.js';
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

    const userCredential = await signInWithEmailAndPassword(auth, emailParaLogin, senha);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("⚠️ Verifique seu e-mail antes de acessar o sistema.");
      window.location.href = "https://brunobonfimteixeira.github.io/GeradordeLaudo/verificarEmail/verificar.html";
      return;
    }

    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().pagou !== true) {
      window.location.href = "https://brunobonfimteixeira.github.io/GeradordeLaudo/telaPagar/pagar.html";
      return;
    }

    alert("✅ Login realizado com sucesso!");
    window.location.href = "https://brunobonfimteixeira.github.io/GeradordeLaudo/principal/laudo.html";

  } catch (error) {
    console.error(error);
    console.error(error.message); // Sugestão extra
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
