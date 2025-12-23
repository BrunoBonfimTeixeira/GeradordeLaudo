import { db } from "../firebase/firebaseConfig.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usuariosTabela = document.getElementById("usuariosTabela");

async function carregarUsuarios() {
  const snapshot = await getDocs(collection(db, "usuarios"));

  snapshot.forEach((docSnap) => {
    const dados = docSnap.data();
    const tr = document.createElement("tr");

    const dataAtual = dados.dataExpiracao
      ? new Date(dados.dataExpiracao).toISOString().split("T")[0]
      : "";

    tr.innerHTML = `
      <td>${dados.nome || ""}</td>
      <td>${dados.email || ""}</td>
      <td>${dados.crm || ""}</td>
      <td>${dados.plano || "Mensal"}</td>
      <td><input type="date" class="inputData" value="${dataAtual}"></td>
      <td><button class="btn-salvar" data-uid="${docSnap.id}">Salvar</button></td>
    `;

    usuariosTabela.appendChild(tr);
  });

  document.querySelectorAll(".btn-salvar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-uid");
      const row = btn.closest("tr");
      const novaData = row.querySelector(".inputData").value;

      if (!novaData) return alert("📅 Escolha uma data de vencimento.");

      try {
        await updateDoc(doc(db, "usuarios", uid), {
          dataExpiracao: novaData
        });
        alert("✅ Acesso liberado até " + novaData);
      } catch (err) {
        console.error(err);
        alert("❌ Erro ao atualizar a data.");
      }
    });
  });
}

carregarUsuarios();
