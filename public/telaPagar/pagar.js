document.addEventListener('DOMContentLoaded', () => {
  const pagarBtn = document.getElementById('pagarBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  let planoSelecionado = null;

  // Redireciona para a tela de pagamento
  if (pagarBtn) {
    pagarBtn.addEventListener('click', () => {
      window.location.href = '../telaPagar/telaDePagamento.html';
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = '../login/login.html';
    });
  }

  // Seleciona um plano
  window.selecionarPlano = function (plano) {
    planoSelecionado = plano;

    // Remove classe ativa de todos os botões
    document.querySelectorAll('.btn-plano').forEach(btn => {
      btn.classList.remove('ativo');
    });

    // Adiciona a classe ao botão clicado
    const btnSelecionado = document.querySelector(`.btn-plano[data-plano="${plano}"]`);
    if (btnSelecionado) {
      btnSelecionado.classList.add('ativo');
    }
  };

  // Simula o pagamento
  window.fazerPagamento = function () {
    if (!planoSelecionado) {
      alert("Selecione um plano antes de continuar.");
      return;
    }

    alert(`Redirecionando para pagamento do plano ${planoSelecionado.toUpperCase()}...`);

    // Exemplo de redirecionamento baseado no plano
    if (planoSelecionado === 'mensal') {
      window.location.href = 'pagamento-mensal.html';
    } else if (planoSelecionado === 'anual') {
      window.location.href = 'pagamento-anual.html';
    }
  };
});
