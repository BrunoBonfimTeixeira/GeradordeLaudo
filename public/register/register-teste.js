import { auth, db } from "../firebase/firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("✅ register-teste.js carregado");

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const crm = document.getElementById("crm").value.trim().toUpperCase();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const genero = document.getElementById("genero").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !crm || !email || !senha || !genero) {
    return alert("Preencha todos os campos obrigatórios.");
  }

  if (!/^\d{4,6}-[A-Z]{2}$/.test(crm)) return alert("CRM inválido. Use o formato 123456-SP.");
  if (senha.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");

  try {
    console.log("👤 Criando conta...");
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const user = cred.user;

    const titulo = genero === "Feminino" ? "Dra" : "Dr";

    console.log("📄 Salvando no Firestore...");
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      nome,
      crm,
      email,
      telefone,
      genero,
      titulo,
      criadoEm: serverTimestamp(),
      acessoLiberado: false
    });

    console.log("📧 Enviando verificação...");
    await sendEmailVerification(user);

    alert("✅ Cadastro realizado! Verifique seu e-mail.");
    window.location.href = "../verificarEmail/verificar.html";
  } catch (err) {
    console.error("❌ Erro ao cadastrar:", err);
    let msg = "Erro ao cadastrar.";
    if (err.code === "auth/email-already-in-use") msg = "E-mail já está em uso.";
    else if (err.code === "auth/invalid-email") msg = "E-mail inválido.";
    else if (err.code === "auth/weak-password") msg = "Senha fraca.";
    alert("❌ " + msg);
  }
});
