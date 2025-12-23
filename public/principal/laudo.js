import { auth, db } from '../firebase/firebaseConfig.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userCrm = document.getElementById("userCrm");
const saudacaoEl = document.getElementById("saudacao");
const sidePanel = document.getElementById("sidePanel");
const triggerArea = document.getElementById("triggerArea");
const heartBtn = document.getElementById("heartBtn");
const routineButtons = document.getElementById("routineButtons");
const compareBtn = document.getElementById("compareBtn");
const reference1 = document.getElementById("reference1");
const homemBtn = document.getElementById("homemBtn");
const mulherBtn = document.getElementById("mulherBtn");
const logoutBtn = document.getElementById("logoutBtn");
const mensalidadeInfo = document.getElementById("mensalidadeInfo");
const btnPagamento = document.getElementById("btnPagamento");

function saudacaoHorario() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// 🔐 Autenticação
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "/index.html");
  if (!user.emailVerified) {
    alert("⚠️ Verifique seu e-mail antes de usar o sistema.");
    await signOut(auth);
    return;
  }

  try {
    const docSnap = await getDoc(doc(db, "usuarios", user.uid));
    if (!docSnap.exists()) return console.warn("Usuário não encontrado.");

    const dados = docSnap.data();
    const hoje = new Date();
    const expiracao = new Date(dados.dataExpiracao);
    const diasRestantes = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));

    // 🎯 MENSALIDADE
    if (mensalidadeInfo && btnPagamento) {
      if (!dados.dataExpiracao) {
        mensalidadeInfo.innerHTML = `🔒 <strong>Você ainda não ativou sua mensalidade</strong>`;
        mensalidadeInfo.style.color = "orange";
        btnPagamento.textContent = "💳 Pagar Mensalidade";
        btnPagamento.style.display = "block";
      } else if (diasRestantes > 0) {
        mensalidadeInfo.innerHTML = `🕒 Sua mensalidade expira em <strong>${diasRestantes} dia(s)</strong>`;
        mensalidadeInfo.style.color = "#00ffcc";
        btnPagamento.style.display = "block";
      } else {
        mensalidadeInfo.innerHTML = `🔒 <strong>Mensalidade vencida</strong>`;
        mensalidadeInfo.style.color = "red";
        btnPagamento.textContent = "💳 Renovar Mensalidade";
        btnPagamento.style.display = "block";
      }
    }

    // 🔒 BLOQUEIA BOTÕES
    if (diasRestantes <= 0) {
      compareBtn?.classList.add("locked-btn");
      compareBtn && (compareBtn.disabled = true);
      heartBtn?.classList.add("locked-btn");
      heartBtn && (heartBtn.disabled = true);
    }

    // ✅ DADOS DO MÉDICO
    const prefixo = dados.genero === 'Feminino' ? 'Dra.' : 'Dr.';
    const saudacao = saudacaoHorario();
    if (saudacaoEl) saudacaoEl.textContent = `${saudacao}, ${prefixo} ${dados.nome}`;
    if (userName) userName.textContent = `${prefixo} ${dados.nome} ${dados.sobrenome || ''}`;
    if (userEmail) userEmail.textContent = dados.email;
    if (userCrm) userCrm.textContent = `CRM: ${dados.crm}`;
    // NÃO USAR .src SE avatarImg FOR DIV
    // avatarImg.innerHTML = "👨‍⚕️"; // se quiser mudar avatar

  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
  }
});

// 🧠 EVENTOS
heartBtn?.addEventListener("click", () => {
  // se a mensalidade estiver OK, esse botão não estará disabled
  window.location.href = "../homem/homem.html";
});


compareBtn?.addEventListener("click", () => {
  reference1.style.display =
    reference1.style.display === "block" ? "none" : "block";
});

triggerArea?.addEventListener("click", () => {
  sidePanel.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (
    !sidePanel.contains(e.target) &&
    triggerArea &&
    !triggerArea.contains(e.target)
  ) {
    sidePanel.classList.remove("open");
  }
});

homemBtn?.addEventListener("click", () => {
  window.location.href = "../homem/homem.html";
});

mulherBtn?.addEventListener("click", () => {
  window.location.href = "../mulher/mulher.html";
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/index.html";
});

btnPagamento?.addEventListener("click", () => {
  window.location.href = "/telaPagar/pagar.html";

});

// 📊 CHART
const ctx = document.getElementById('myChart')?.getContext('2d');
if (ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
      datasets: [{
        label: 'Dados de Paciente',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
