document.getElementById('pagarBtn').addEventListener('click', () => {
  window.location.href = '../telaPagar/telaDePagamento.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = '../index.html';
});

let planoSelecionado = null;

    function selecionarPlano(plano) {
      planoSelecionado = plano;
      document.querySelectorAll('.btn-plano').forEach(btn => btn.classList.remove('ativo'));
      document.querySelector(`.btn-plano[onclick*="${plano}"]`).classList.add('ativo');
    }

    function fazerPagamento() {
      if (!planoSelecionado) {
        alert("Selecione um plano antes de continuar.");
        return;
      }
      alert("Redirecionando para pagamento do plano " + planoSelecionado.toUpperCase() + "...");
      // Aqui você pode redirecionar para sua API de pagamento
    }