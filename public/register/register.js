import { auth, db } from "../firebase/firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("✅ register.js carregado");

// Preencher dias dinamicamente
const diaSelect = document.getElementById("dia");
for (let i = 1; i <= 31; i++) {
  const opt = document.createElement("option");
  opt.value = i.toString().padStart(2, "0");
  opt.textContent = i;
  diaSelect.appendChild(opt);
}

const form = document.getElementById("cadastroForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const crm = document.getElementById("crm").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const genero = document.getElementById("genero").value;
  const dia = document.getElementById("dia").value;
  const mes = document.getElementById("mes").value;
  const ano = document.getElementById("ano").value;
  const senha = document.getElementById("senha").value;
  const nascimento = `${ano}-${mes}-${dia}`;

  try {
    console.log("🔍 Verificando CRM duplicado...");
    const crmQuery = query(collection(db, "usuarios"), where("crm", "==", crm));
    const querySnapshot = await getDocs(crmQuery);
    if (!querySnapshot.empty) {
      alert("❌ Já existe um usuário com esse CRM.");
      return;
    }

    const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credenciais.user;

    await updateProfile(user, { displayName: `${nome} ${sobrenome}` });

    const userDoc = {
      uid: user.uid,
      nome,
      sobrenome,
      crm,
      email,
      telefone,
      cpf,
      genero,
      nascimento,
      plano: "mensal",
      pagar: false,
      criadoEm: serverTimestamp()
    };

    await setDoc(doc(db, "usuarios", user.uid), userDoc);

    alert("✅ Cadastro salvo no Firestore com sucesso!");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("❌ Erro ao cadastrar:", error);
    alert("❌ Erro ao cadastrar: " + error.message);
  }
});
