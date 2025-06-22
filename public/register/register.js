import { auth, db } from '../firebase/firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  doc, setDoc, query, collection, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ✅ Confirmação de carregamento
console.log("✅ register.js carregado");

// Preenche os dias dinamicamente
const diaSelect = document.getElementById('dia');
for (let i = 1; i <= 31; i++) {
  const opt = document.createElement('option');
  opt.value = i.toString().padStart(2, '0');
  opt.textContent = i;
  diaSelect.appendChild(opt);
}

// ✅ Validação de senha em tempo real
window.validarSenha = function (input) {
  const msg = document.getElementById("senhaMsg");
  if (input.value.length < 6) {
    msg.textContent = "Senha muito curta.";
  } else {
    msg.textContent = "";
  }
};

// ✅ Envio do formulário
document.querySelector('.form-card').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 🔹 Coleta de campos
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

  const nascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

  // 🔸 Validações
  const regexCRM = /^\d{4,6}-[A-Z]{2}$/;
  if (!regexCRM.test(crm)) {
    alert("❌ Informe um CRM válido no formato 123456-SP.");
    return;
  }

  if (!email.includes('@')) {
    alert("❌ E-mail inválido.");
    return;
  }

  if (senha.length < 6) {
    alert("❌ A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    // 🔸 Verifica se o CRM já existe
    const crmQuery = query(collection(db, "usuarios"), where("crm", "==", crm));
    const crmSnapshot = await getDocs(crmQuery);

    if (!crmSnapshot.empty) {
      alert("❌ Este CRM já está cadastrado. Faça login ou use outro CRM.");
      return;
    }

    // 🔸 Cria o usuário no Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // 🔸 Envia e-mail de verificação
    await sendEmailVerification(user);

    // 🔸 Salva no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      nome,
      sobrenome,
      crm,
      nascimento,
      genero,
      telefone,
      email,
      criadoEm: new Date(),
      pagou: false // pode ser usado no controle de pagamento
    });

    alert("✅ Cadastro realizado com sucesso!\nVerifique seu e-mail para ativar sua conta.");
    window.location.href = "../verificarEmail/verificar.html";

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
