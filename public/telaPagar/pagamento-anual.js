 document.getElementById("closeBtn").addEventListener("click", () => {
      window.location.href = "/principal/laudo.html";
    });

    document.getElementById("confirmarPagamento").addEventListener("click", () => {
      alert("Obrigado! Seu pagamento será verificado em breve.");
      window.location.href = "/principal/laudo.html";
    });

    document.getElementById("copyBtn").addEventListener("click", () => {
      const code = document.getElementById("pixCode");
      code.select();
      code.setSelectionRange(0, 99999);
      document.execCommand("copy");
      alert("Código Pix copiado com sucesso!");
    });