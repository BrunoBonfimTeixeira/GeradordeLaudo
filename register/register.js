import { auth, db } from '../firebase/firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  doc, setDoc, query, collection, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Confirma se o JS está carregando
console.log("✅ register.js carregado");

// Preenche os dias dinamicamente
const diaSelect = document.getElementById('dia');
for (let i = 1; i <= 31; i++) {
  const opt = document.createElement('option');
  opt.value = i.toString().padStart(2, '0');
  opt.textContent = i;
  diaSelect.appendChild(opt);
}

// Validação de senha
window.validarSenha = function(input) {
  const msg = document.getElementById("senhaMsg");
  if (input.value.length < 6) {
    msg.textContent = "Senha muito curta.";
  } else {
    msg.textContent = "";
  }
};

// Envio do formulário
document.querySelector('.form-card').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim();
  const crm = document.getElementById('crm').value.trim().toUpperCase();
  const dia = document.getElementById('dia').value;
  const mes = document.getElementById('mes').value;
  const ano = document.getElementById('ano').value;
  const genero = document.getElementById('genero').value;
  const email = document.getElementById('contato').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const senha = document.getElementById('senha').value;

  // Validação do CRM
  const regexCRM = /^\d{4,6}-[A-Z]{2}$/;
  if (!regexCRM.test(crm)) {
    alert("Informe um CRM válido no formato 123456-SP.");
    return;
  }

  if (!email.includes('@') || senha.length < 6) {
    alert("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
    return;
  }

  const nascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

  try {
    // Verifica CRM duplicado
    const crmQuery = query(collection(db, "usuarios"), where("crm", "==", crm));
    const crmSnapshot = await getDocs(crmQuery);
    if (!crmSnapshot.empty) {
      alert("Este CRM já está cadastrado. Faça login ou use outro CRM.");
      return;
    }

    // Cria usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      nome,
      sobrenome,
      crm,
      nascimento,
      genero,
      telefone,
      email,
      criadoEm: new Date()
    });

    window.location.href = "../index.html"; // Redireciona para o login


  } catch (error) {
    console.error(error);
    let msg = "Erro ao cadastrar.";
    if (error.code === "auth/email-already-in-use") {
      msg = "Este e-mail já está em uso.";
    } else if (error.code === "auth/invalid-email") {
      msg = "E-mail inválido.";
    } else if (error.code === "auth/weak-password") {
      msg = "A senha precisa ter pelo menos 6 caracteres.";
    }
    alert("❌ " + msg);
  }
});
