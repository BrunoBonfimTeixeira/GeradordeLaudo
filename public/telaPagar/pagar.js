document.addEventListener('DOMContentLoaded', () => {
  const pagarBtn = document.getElementById('pagarBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  let planoSelecionado = null;

  // ✅ Redireciona para a tela principal de planos (pagar.html)
  if (pagarBtn) {
    pagarBtn.addEventListener('click', () => {
      window.location.href = './pagar.html';
    });
  }

  // ✅ Redireciona para login (index na raiz)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = '/principal/laudo.html';
    });
  }

  // ✅ Selecionar plano
  window.selecionarPlano = function (plano) {
    planoSelecionado = plano;

    document.querySelectorAll('.btn-plano').forEach(btn => {
      btn.classList.remove('ativo');
    });

    const btnSelecionado = document.querySelector(`.btn-plano[data-plano="${plano}"]`);
    if (btnSelecionado) {
      btnSelecionado.classList.add('ativo');
    }
  };

  // ✅ Simular pagamento e redirecionar
  window.fazerPagamento = function () {
    if (!planoSelecionado) {
      alert("Selecione um plano antes de continuar.");
      return;
    }

    alert(`Redirecionando para pagamento do plano ${planoSelecionado.toUpperCase()}...`);

    if (planoSelecionado === 'mensal') {
      window.location.href = "/telaPagar/pagamento-mensal.html";

    } else if (planoSelecionado === 'anual') {
      window.location.href = './pagamento-anual.html';
    }
  };
});
