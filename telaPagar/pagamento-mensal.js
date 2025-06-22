firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("email").value = user.email;
    const uid = user.uid;
    const email = user.email;

    fetch("https://us-central1-SEU_PROJETO.cloudfunctions.net/gerarPix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email })
    })
      .then(res => res.json())
      .then(data => {
        const qrImg = document.getElementById("pixImage");
        qrImg.src = "data:image/png;base64," + data.qrCode;
      })
      .catch(err => {
        console.error("Erro ao carregar QR Code:", err);
      });
  } else {
    alert("Você precisa estar logado.");
    window.location.href = "../index.html";
  }
});
