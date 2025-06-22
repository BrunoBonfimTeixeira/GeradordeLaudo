import { auth, db } from '../firebase/firebaseConfig.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos da interface
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
const avatarImg = document.getElementById("avatarImg");

function saudacaoHorario() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Verifica login e se pagou
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login/login.html";
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

    if (!docSnap.exists()) {
      console.warn("Usuário não encontrado no Firestore.");
      return;
    }

    const dados = docSnap.data();

    if (!dados.pagou) {
      window.location.href = "telaPagar/pagar.html";
      return;
    }

    const nome = dados.nome || "";
    const sobrenome = dados.sobrenome || "";
    const crm = dados.crm || "";
    const email = dados.email || "";

    const prefixo = dados.genero === 'Feminino' ? 'Dra.' : 'Dr.';
    const saudacao = saudacaoHorario();
    if (saudacaoEl) saudacaoEl.textContent = `${saudacao}, ${prefixo} ${nome}`;
    if (userName) userName.textContent = `${prefixo} ${nome} ${sobrenome}`;
    if (userEmail) userEmail.textContent = email;
    if (userCrm) userCrm.textContent = `CRM: ${crm}`;

    avatarImg.src = user.photoURL || "imagens/avatar-padrao.jpg";

  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
  }
});


// Eventos da interface
heartBtn?.addEventListener("click", () => {
  routineButtons.style.display =
    routineButtons.style.display === "flex" ? "none" : "flex";
});

compareBtn?.addEventListener("click", () => {
  reference1.style.display =
    reference1.style.display === "block" ? "none" : "block";
});

triggerArea?.addEventListener("click", () => {
  sidePanel.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!sidePanel.contains(e.target) && !triggerArea.contains(e.target)) {
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
  window.location.href = "../login/index.html";
});

// Gráfico com Chart.js (opcional)
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
