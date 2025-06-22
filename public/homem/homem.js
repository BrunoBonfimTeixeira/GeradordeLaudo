// homem.js

document.addEventListener('DOMContentLoaded', function () {
  const volumeInputs = document.querySelectorAll('.volume-input');
  const linhasTabela = document.querySelectorAll('#cardiacVolumeTable tbody tr');
  const generateReportBtn = document.getElementById("generateReportBtn");
const laudoModal = document.getElementById("laudoModal");
const closeModalBtn = document.getElementById("closeModalBtn");

generateReportBtn.addEventListener("click", function () {
  gerarTextoDoLaudo();
  laudoModal.style.display = "block";
});

closeModalBtn.addEventListener("click", function () {
  laudoModal.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target === laudoModal) {
    laudoModal.style.display = "none";
  }
});


function toggleBloco(botaoId, conteudoId, iconeId) {
    const botao = document.getElementById(botaoId);
    const conteudo = document.getElementById(conteudoId);
    const icone = document.getElementById(iconeId);

    botao.addEventListener('click', function () {
      const isHidden = conteudo.classList.contains('conteudo-escondido');
      conteudo.classList.toggle('conteudo-escondido');

      icone.classList.toggle('fa-chevron-down', isHidden);
      icone.classList.toggle('fa-chevron-up', !isHidden);

      const labelBase = botao.textContent.replace(/Mostrar|Esconder/g, '').trim();
      botao.innerHTML = `<i id="${iconeId}" class="fas ${isHidden ? 'fa-chevron-up' : 'fa-chevron-down'}"></i> ${isHidden ? 'Esconder' : 'Mostrar'} ${labelBase}`;
    });
  }

  toggleBloco("btnExpandirVE", "conteudoVE", "iconeSetaVE");
  toggleBloco("btnExpandirVD", "conteudoVD", "iconeSetaVD");
  toggleBloco("btnExpandirAE", "conteudoAE", "iconeSetaAE");
  toggleBloco("btnExpandirAD", "conteudoAD", "iconeSetaAD");


  // Eventos para pular inputs com Enter
  volumeInputs.forEach((input, index) => {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const nextInput = volumeInputs[index + 11];
        if (nextInput) nextInput.focus();
      }
    });
  });

  function calcASC(peso, altura) {
    return Math.sqrt((peso * altura) / 3600);
  }

  function calcularSomaLinha(linha) {
    const inputs = linha.querySelectorAll('input');
    let total = 0;
    inputs.forEach(input => {
      const valor = parseFloat(input.value.replace(",", "."));
      if (!isNaN(valor)) total += valor;
    });
    const totalCell = linha.querySelector('td:last-child span');
    if (totalCell) totalCell.textContent = total.toFixed(2);
    return total;
  }

  function atualizarVE() {
    const peso = parseFloat(document.getElementById("weight").value);
    const altura = parseFloat(document.getElementById("height").value);
    const asc = peso && altura ? calcASC(peso, altura) : null;

    const vdfEndo = calcularSomaLinha(linhasTabela[0]);
    const vsfEndo = calcularSomaLinha(linhasTabela[3]);

    const fe = vdfEndo > 0 ? ((vdfEndo - vsfEndo) / vdfEndo) * 100 : 0;
    const volEjetado = vdfEndo - vsfEndo;

    document.getElementById("ve-vdf").value = vdfEndo.toFixed(1);
    document.getElementById("ve-vsf").value = vsfEndo.toFixed(1);
    document.getElementById("ve-vdf-index").value = asc ? (vdfEndo / asc).toFixed(1) : "";
    document.getElementById("ve-vsf-index").value = asc ? (vsfEndo / asc).toFixed(1) : "";
    document.getElementById("ve-fe").value = fe.toFixed(1);
    document.getElementById("ve-vol-ejetado").value = volEjetado.toFixed(1);
    document.getElementById("ve-vol-ejetado-index").value = asc ? (volEjetado / asc).toFixed(1) : "";
  }

  function atualizarVD() {
    const peso = parseFloat(document.getElementById("weight").value);
    const altura = parseFloat(document.getElementById("height").value);
    const asc = peso && altura ? calcASC(peso, altura) : null;

    const vdfEndo = calcularSomaLinha(linhasTabela[2]);
    const vsfEndo = calcularSomaLinha(linhasTabela[4]);

    const fe = vdfEndo > 0 ? ((vdfEndo - vsfEndo) / vdfEndo) * 100 : 0;
    const volEjetado = vdfEndo - vsfEndo;

    const inputs = document.querySelectorAll(".containerVDdireito input");
    inputs[0].value = vdfEndo.toFixed(1);
    inputs[1].value = vsfEndo.toFixed(1);
    inputs[2].value = asc ? (vdfEndo / asc).toFixed(1) : "";
    inputs[3].value = asc ? (vsfEndo / asc).toFixed(1) : "";
    inputs[4].value = fe.toFixed(1);
    inputs[5].value = volEjetado.toFixed(1);
    inputs[6].value = asc ? (volEjetado / asc).toFixed(1) : "";
  }

  function calcularVolumeAE() {
    const area4CH = parseFloat(document.getElementById("ae-area4ch").value);
    const area2CH = parseFloat(document.getElementById("ae-area2ch").value);
    const eixoLongo = parseFloat(document.getElementById("ae-eixo-longo").value);

    if (!isNaN(area4CH) && !isNaN(area2CH) && !isNaN(eixoLongo) && eixoLongo > 0) {
      return (8 / (3 * Math.PI)) * (area4CH * area2CH) / eixoLongo;
    }
    return null;
  }

  function atualizarVolumeAE() {
    const volume = calcularVolumeAE();
    const display = document.getElementById("volumeAEDisplay");
    const indexado = document.getElementById("ae-volume-index");
    const peso = parseFloat(document.getElementById("weight").value);
    const altura = parseFloat(document.getElementById("height").value);
    const asc = peso && altura ? calcASC(peso, altura) : null;

    if (volume && asc) {
      display.textContent = `Volume: ${volume.toFixed(1)} mL`;
      display.classList.remove("text-muted");
      indexado.value = (volume / asc).toFixed(1);
    } else {
      display.textContent = "Volume: Valor incompleto";
      display.classList.add("text-muted");
      indexado.value = "";
    }
  }

  function calcularVolumeAD() {
    const area4CH = parseFloat(document.getElementById("area4CH_AD").value.replace(",", "."));
    const area2CH = parseFloat(document.getElementById("area2CH_AD").value.replace(",", "."));
    const altura = parseFloat(document.getElementById("height").value);
    const peso = parseFloat(document.getElementById("weight").value);
    const ASC = peso && altura ? calcASC(peso, altura) : null;

    const volume = (8 / (3 * Math.PI)) * (area4CH * area2CH) / 4.15;

    if (!isNaN(volume)) {
      document.getElementById("volumeAD").value = volume.toFixed(1);
      if (ASC) {
        document.getElementById("volumeIndexAD").value = (volume / ASC).toFixed(1);
        document.getElementById("areaIndex4CH_AD").value = (area4CH / ASC).toFixed(1);
      }
    }
  }

  function atualizarMassaVE() {
    const peso = parseFloat(document.getElementById("weight").value);
    const altura = parseFloat(document.getElementById("height").value);
    const asc = peso && altura ? calcASC(peso, altura) : null;

    const ddf = parseFloat(document.getElementById("ve-ddf").value);
    const septal = parseFloat(document.getElementById("ve-esp-septal").value);
    const infero = parseFloat(document.getElementById("ve-esp-inferolateral").value);

    const vdfEpi = calcularSomaLinha(linhasTabela[1]);
    const vdfEndo = calcularSomaLinha(linhasTabela[0]);
    const massa = vdfEpi - vdfEndo;

    document.getElementById("ve-massa").value = massa.toFixed(1);
    document.getElementById("ve-massa-index").value = asc ? (massa / asc).toFixed(1) : "";
    document.getElementById("ve-indice-massa").value = vdfEndo ? (massa / vdfEndo).toFixed(2) : "";

    if (!isNaN(ddf) && !isNaN(septal) && !isNaN(infero)) {
      const parede = (septal + infero) / 2;
      document.getElementById("ve-esp-relativa").value = ((2 * parede) / ddf).toFixed(2);
    }
  }


  
  function atualizarPercentualRT() {
    const massa = parseFloat(document.getElementById("ve-massa").value);
    const massaRT = parseFloat(document.getElementById("ve-massa-rt").value);
    const output = document.getElementById("ve-percentual-rt");

    if (!isNaN(massa) && !isNaN(massaRT)) {
      output.value = ((massaRT / massa) * 100).toFixed(1);
    } else {
      output.value = "";
    }
  }

  function atualizarTodos() {
    atualizarVE();
    atualizarVD();
    atualizarVolumeAE();
    calcularVolumeAD();
    atualizarMassaVE();
  }

  linhasTabela.forEach(linha => {
    linha.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        calcularSomaLinha(linha);
        atualizarTodos();
      });
    });
  });

  ["weight", "height"].forEach(id => {
    document.getElementById(id).addEventListener("input", atualizarTodos);
  });

  ["ae-area4ch", "ae-area2ch", "ae-eixo-longo"].forEach(id => {
    document.getElementById(id).addEventListener("input", atualizarVolumeAE);
  });

  ["area4CH_AD", "area2CH_AD"].forEach(id => {
    document.getElementById(id).addEventListener("input", calcularVolumeAD);
  });

  ["ve-ddf", "ve-esp-septal", "ve-esp-inferolateral"].forEach(id => {
    document.getElementById(id).addEventListener("input", atualizarMassaVE);
  });

  ["ve-massa", "ve-massa-rt"].forEach(id => {
    document.getElementById(id).addEventListener("input", atualizarPercentualRT);
  });

function gerarTextoDoLaudo() {
    const v = id => document.getElementById(id)?.value || "---";

    laudoText.value = `RESSONÂNCIA MAGNÉTICA DE CORAÇÃO\n\nMétodo  \nRealizadas sequências de cinerressonância e morfológicas antes da administração endovenosa do meio de contraste paramagnético. Após a sua administração, foram realizadas sequências de perfusão miocárdica, volumétrica do tórax e de realce tardio. Exame realizado em repouso.\n\nAnálise  \nHOMEM ROTINA\n\nÁtrios com dimensões normais.  \nÁtrio esquerdo com diâmetro anteroposterior de ${v("ae-diametro")} cm (VN 2,3–4,3 cm) e volume estimado em ${v("ae-volume-index")} ml/m² (VN 26–52 ml/m²).  \nÁtrio direito com volume estimado em ${v("volumeIndexAD")} ml/m² (VN até 39 ml/m²) e área indexada de ${v("areaIndex4CH_AD")} cm²/m².\n\nVentrículo direito com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.  \nVolume diastólico final de ${v("vd-vdf-index")} ml/m² (VN 61–121 ml/m²), volume sistólico final de ${v("vd-vsf-index")} ml/m² (VN 19–59 ml/m²) e fração de ejeção estimada em ${v("vd-fe")} % (VN > 40%).  \nMiocárdio ventricular direito com espessura e sinal preservados.\n\nVentrículo esquerdo com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.  \nDiâmetro diastólico final de ${v("ve-ddf")} cm (VN ≤ 5,8 cm), volume diastólico final de ${v("ve-vdf-index")} ml/m² (VN 57–105 ml/m²), volume sistólico final de ${v("ve-vsf-index")} ml/m² (VN 14–38 ml/m²) e fração de ejeção estimada em ${v("ve-fe")} % (VN > 50%).  \nVolume ejetado estimado em ${v("ve-vol-ejetado")} mL.  \nMiocárdio ventricular esquerdo com espessura e sinal preservados.  \nEspessura de até ${v("ve-esp-septal")} cm na parede septal basal (VN ≤ 1,2 cm).  \nMassa estimada em ${v("ve-massa")} g (VN 92–176 g) e em ${v("ve-massa-index")} g/m² (VN 49–85 g/m²).\n\nPerfusão miocárdica normal, em repouso.  \nNão se identifica realce tardio miocárdico.  \nValvas cardíacas sem alterações evidentes ao método.  \nNão se observa espessamento ou derrame pericárdico.  \nAorta torácica e tronco pulmonar com calibre normal.\n\nComentários  \nRessonância magnética cardíaca sem anormalidade perceptível.  \nNão se identifica realce tardio miocárdico.\n\n*Valores de referência: Kawel-Boehm et al. Journal of Cardiovascular Magnetic Resonance (2015)`;
  }
});
