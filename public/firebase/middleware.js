import { auth, db } from '../firebase/firebaseConfig';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function protegerPagina({ redirecionarPara = "../login/login.html", aoNegarPagamento = "../telaPagar/pagar.html" }) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = redirecionarPara;
      return;
    }

    if (!user.emailVerified) {
      alert("⚠️ Verifique seu e-mail antes de usar o sistema.");
      await signOut(auth);
      return;
    }

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !docSnap.data().pagou) {
        window.location.href = aoNegarPagamento;
        return;
      }

      // ✅ Usuário autorizado! Você pode continuar carregando a página.

    } catch (error) {
      console.error("Erro ao validar usuário:", error);
      window.location.href = redirecionarPara;
    }
  });
}
