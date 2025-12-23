document.addEventListener('DOMContentLoaded', function () {
  const volumeInputs = document.querySelectorAll('.volume-input');
  const linhasTabela = document.querySelectorAll('#cardiacVolumeTable tbody tr');
  const generateReportBtn = document.getElementById("generateReportBtn");
  const laudoText = document.getElementById("laudoText");
const selectFuncaoCardiaca =
  document.getElementById('funcaoCardiaca') ||
  document.getElementById('selectFuncaoCardiaca');
  // Tenta achar tanto pelos ids em inglês quanto em português
const weightInput =
  document.getElementById('weight') || document.getElementById('peso');
const heightInput =
  document.getElementById('height') || document.getElementById('altura');
const ascInput = document.getElementById('asc');

  const planilhaVolumes = document.querySelector('.container-planilha');
  const containerVE = document.querySelector('.container-VEesquerdo');
  const containerVD = document.querySelector('.containerVDdireito');
  const containerAE = document.querySelector('.containerAE');
  const containerAD = document.querySelector('.container-ADdireito');
  const botaoGerador = document.querySelector('.container-botaoGeradordeTexto');

  const selectSexo = document.getElementById('sexo');

  // ================= EDITOR DE LAUDO – INICIALIZAÇÃO =================
  const editor = document.getElementById('editor');

  function focusEditor() {
    editor && editor.focus();
  }

  function exec(cmd, value = null) {
    document.execCommand(cmd, false, value);
    focusEditor();
    updateCharCount();
    saveToLocal();
  }

  function setEditorStyle(prop, value) {
    if (!editor) return;
    editor.style[prop] = value;
    focusEditor();
    saveToLocal();
  }

  function wrapBlock(tagName) {
    document.execCommand('formatBlock', false, tagName);
    focusEditor();
    saveToLocal();
  }

  function updateCharCount() {
    if (!editor) return;
    const text = editor.innerText || '';
    const el = document.getElementById('charCount');
    if (el) el.textContent = text.trim().length + ' caracteres';
  }

  function saveToLocal() {
    if (!editor) return;
    try {
      localStorage.setItem('laudo_editor_html', editor.innerHTML);
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }

  function loadFromLocal() {
    if (!editor) return;
    try {
      const saved = localStorage.getItem('laudo_editor_html');
      if (saved) editor.innerHTML = saved;
    } catch (e) {
      console.warn('Não foi possível recuperar do localStorage:', e);
    }
    updateCharCount();
  }

  // API global pra usar em outras funções (gerar laudo, salvar, etc.)
  window.meuEditorLaudo = {
    getHtml() {
      return editor ? editor.innerHTML : '';
    },
    setHtml(html) {
      if (!editor) return;
      editor.innerHTML = html || '';
      updateCharCount();
      saveToLocal();
    },
    clear() {
      if (!editor) return;
      editor.innerHTML = '';
      updateCharCount();
      saveToLocal();
    }
  };

  // ---- toolbar comandos simples ----
  document.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      exec(cmd);
    });
  });

  // ---- blocos / fonte / espaçamento ----
  const blockFormat = document.getElementById('blockFormat');
  const fontFamily = document.getElementById('fontFamily');
  const fontSize = document.getElementById('fontSize');
  const lineHeight = document.getElementById('lineHeight');

  blockFormat && blockFormat.addEventListener('change', e => {
    const tag = e.target.value;
    wrapBlock(tag === 'p' ? 'p' : tag);
  });

  fontFamily && fontFamily.addEventListener('change', e => {
    setEditorStyle('fontFamily', e.target.value || '');
  });

  fontSize && fontSize.addEventListener('change', e => {
  let value = e.target.value;

  // Se for "Outro...", pede o valor
  if (value === "custom") {
    let input = prompt("Digite o tamanho da fonte (em px):", "20");
    if (!input) return;
    value = input + "px";

    // Atualiza a opção "custom" para mostrar o valor atual
    const opt = fontSize.querySelector('option[value="custom"]');
    if (opt) opt.textContent = `Outro (${input})`;
  }

  applyFontSizeToSelection(value);
});

function applyFontSizeToSelection(sizePx) {
  if (!editor) return;

  // 1. Aplica um fontSize temporário (HTML vai gerar <font size="7">)
  document.execCommand("fontSize", false, "7");

  // 2. Substitui TODOS os <font> recém-criados por <span style="">
  const fonts = editor.querySelectorAll("font[size='7']");
  fonts.forEach(f => {
    const span = document.createElement("span");
    span.style.fontSize = sizePx;
    span.innerHTML = f.innerHTML;
    f.replaceWith(span);
  });

  focusEditor();
  saveToLocal();
}


  lineHeight && lineHeight.addEventListener('change', e => {
    setEditorStyle('lineHeight', e.target.value);
  });

  // ---- cores ----
  const colorInput = document.getElementById('colorInput');
  const bgColorInput = document.getElementById('bgColorInput');
  const btnTextColor = document.getElementById('btnTextColor');
  const btnBgColor = document.getElementById('btnBgColor');

  btnTextColor && btnTextColor.addEventListener('click', () => {
    colorInput && colorInput.click();
  });

  colorInput && colorInput.addEventListener('input', e => {
    exec('foreColor', e.target.value);
  });

  btnBgColor && btnBgColor.addEventListener('click', () => {
    bgColorInput && bgColorInput.click();
  });

  bgColorInput && bgColorInput.addEventListener('input', e => {
    exec('hiliteColor', e.target.value);
  });

  // ---- link / imagem ----
  const btnLink = document.getElementById('btnLink');
  const btnImg = document.getElementById('btnImg');

  btnLink && btnLink.addEventListener('click', () => {
    const url = prompt('Digite a URL (ex: https://...):');
    if (!url) return;
    exec('createLink', url);
  });

  btnImg && btnImg.addEventListener('click', () => {
    const url = prompt('URL da imagem (https):');
    if (!url) return;
    exec('insertImage', url);
  });

  // ---- tabela ----
  const btnTable = document.getElementById('btnTable');
  btnTable && btnTable.addEventListener('click', () => {
    let rows = parseInt(prompt('Número de linhas da tabela:', '3'), 10);
    let cols = parseInt(prompt('Número de colunas da tabela:', '3'), 10);
    if (!rows || !cols || rows <= 0 || cols <= 0) return;

    let html = '<table class="editor-table"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += '<th>Coluna ' + (c + 1) + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td>&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';

    document.execCommand('insertHTML', false, html);
    focusEditor();
    saveToLocal();
    updateCharCount();
  });

  // ---- limpar / ver HTML ----
  const btnClear = document.getElementById('btnClear');
  const btnHtml = document.getElementById('btnHtml');
  let showingHtml = false;

  btnClear && btnClear.addEventListener('click', () => {
    if (!editor) return;
    if (!confirm('Remover TODA a formatação do texto?')) return;
    const plain = editor.innerText;
    editor.innerHTML = plain.replace(/\n/g, '<br>');
    saveToLocal();
    updateCharCount();
  });

  btnHtml && btnHtml.addEventListener('click', () => {
    if (!editor) return;
    showingHtml = !showingHtml;
    if (showingHtml) {
      const html = editor.innerHTML;
      editor.textContent = html;
      editor.style.fontFamily = 'monospace';
    } else {
      const html = editor.textContent;
      editor.innerHTML = html;
      editor.style.fontFamily = '';
    }
    focusEditor();
    saveToLocal();
  });

  // ---- eventos do editor ----
  if (editor) {
    editor.addEventListener('input', () => {
      updateCharCount();
      saveToLocal();
    });

    editor.addEventListener('keyup', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveToLocal();
      }
    });

    loadFromLocal();
  }

  // ... DAQUI PRA BAIXO continua o resto do teu código (selectSexo, cálculos, etc.)


  selectSexo.addEventListener('change', function () {
    const sexoSelecionado = selectSexo.value;
    const masculino = document.querySelectorAll('.sexo-masculino');
    const feminino = document.querySelectorAll('.sexo-feminino');

    if (sexoSelecionado === 'masculino') {
      masculino.forEach(el => el.style.display = '');
      feminino.forEach(el => el.style.display = 'none');
    } else if (sexoSelecionado === 'feminino') {
      masculino.forEach(el => el.style.display = 'none');
      feminino.forEach(el => el.style.display = '');
    } else {
      masculino.forEach(el => el.style.display = 'none');
      feminino.forEach(el => el.style.display = 'none');
    }

    // 🔁 Atualiza o texto do laudo conforme o sexo
    gerarTextoDoLaudo();
  });
function getRotinaLabel() {
    return selectSexo.value === 'feminino' ? 'MULHER ROTINA' : 'HOMEM ROTINA';
  }
  
  function calcASC(peso, altura) {
  if (!peso || !altura || isNaN(peso) || isNaN(altura)) return null;
  return Math.sqrt((peso * altura) / 3600);
}

function atualizarASC() {
  const peso = parseFloat((weightInput?.value || '').replace(',', '.'));
  const altura = parseFloat((heightInput?.value || '').replace(',', '.'));
  const asc = calcASC(peso, altura);

  if (asc && ascInput) {
    ascInput.value = asc.toFixed(2).replace('.', ',');
  } else if (ascInput) {
    ascInput.value = '';
  }
}


 if (weightInput && heightInput) {
  weightInput.addEventListener('input', atualizarASC);
  heightInput.addEventListener('input', atualizarASC);
}



  function calcularSomaLinha(linha) {
    const inputs = linha.querySelectorAll('input');
    let total = 0;
    inputs.forEach(input => {
      const valor = parseFloat(input.value.replace(',', '.'));
      if (!isNaN(valor)) total += valor;
    });
    const totalCell = linha.querySelector('td:last-child span');
    if (totalCell) totalCell.textContent = total.toFixed(1);
    return total;
  }

  function atualizarTotais() {
    linhasTabela.forEach(linha => calcularSomaLinha(linha));
  }

  function atualizarVE() {
  const peso = parseFloat((weightInput?.value || '').replace(',', '.'));
  const altura = parseFloat((heightInput?.value || '').replace(',', '.'));
  const asc = calcASC(peso, altura);

  const vdfEndo = calcularSomaLinha(linhasTabela[0]); // VE VDF Endo
  const vdfEpi = calcularSomaLinha(linhasTabela[1]);  // VE VDF Epi
  const vsfEndo = calcularSomaLinha(linhasTabela[3]); // VE VSF Endo

  const fe = vdfEndo > 0 ? ((vdfEndo - vsfEndo) / vdfEndo) * 100 : 0;
  const volEjetado = vdfEndo - vsfEndo;

  document.getElementById("ve-vdf").value = vdfEndo.toFixed(1);
  document.getElementById("ve-vsf").value = vsfEndo.toFixed(1);
  document.getElementById("ve-vdf-index").value = asc ? (vdfEndo / asc).toFixed(1) : "";
  document.getElementById("ve-vsf-index").value = asc ? (vsfEndo / asc).toFixed(1) : "";
  document.getElementById("ve-fe").value = fe.toFixed(1);
  document.getElementById("ve-vol-ejetado").value = volEjetado.toFixed(1);
  document.getElementById("ve-vol-ejetado-index").value = asc ? (volEjetado / asc).toFixed(1) : "";

  // 🔬 Cálculo da massa
  const massa = 1.05 * (vdfEpi - vdfEndo);
  const massaIndexada = asc ? massa / asc : "";
  const indiceMassa = vdfEndo > 0 ? massa / vdfEndo : "";

  // 🔬 Espessura relativa
  const ddf = parseFloat(document.getElementById("ve-ddf")?.value.replace(",", ".")) || 0;
  const espSeptal = parseFloat(document.getElementById("ve-esp-septal")?.value.replace(",", ".")) || 0;
  const espRelativa = ddf > 0 ? (2 * espSeptal / ddf) : "";

  // 🔬 % RT
  const massaRT = parseFloat(document.getElementById("ve-massa-rt").value.replace(",", ".")) || 0;
  const percentualRT = massa > 0 ? (massaRT / massa) * 100 : "";

  // Preencher campos finais
  document.getElementById("ve-massa").value = massa.toFixed(1);
  document.getElementById("ve-massa-index").value = massaIndexada ? massaIndexada.toFixed(1) : "";
  document.getElementById("ve-indice-massa").value = indiceMassa ? indiceMassa.toFixed(2) : "";
  document.getElementById("ve-esp-relativa").value = espRelativa ? espRelativa.toFixed(2) : "";
  document.getElementById("ve-percentual-rt").value = percentualRT ? percentualRT.toFixed(1) : "";

  destacarCamposVE(); // aplica destaque visual conforme normalidade
}


  function destacarCamposVE() {
  const ve = (id) => parseFloat(document.getElementById(id).value.replace(",", "."));
  const campo = (id) => document.getElementById(id);

  // Referências para mulheres (Kawel-Boehm et al.)
  const referencias = {
    "ve-vdf": [70, 155],
    "ve-vsf": [15, 64],
    "ve-vdf-index": [45, 93],
    "ve-vsf-index": [10, 38],
    "ve-fe": [50, Infinity],
    "ve-vol-ejetado": [47, 99],
    "ve-vol-ejetado-index": [30, 59],
    "ve-massa": [43, 103],
    "ve-massa-index": [30, 59],
    "ve-esp-relativa": [0, 0.42],
    "ve-indice-massa": [0, 1.0]
    // ve-massa-rt e ve-percentual-rt não possuem referência
  };

  for (const id in referencias) {
    const [min, max] = referencias[id];
    const valor = ve(id);
    const input = campo(id);

    if (isNaN(valor)) {
      input.style.backgroundColor = "";
    } else if (valor < min || valor > max) {
      input.style.backgroundColor = "#f88"; // vermelho claro
    } else {
      input.style.backgroundColor = ""; // normal
    }
  }
}
destacarCamposVE();



// ======== SALVAR REFERÊNCIA DA FUNÇÃO CARDÍACA ========
const selectReferencia = document.getElementById('referencia');
const btnSalvarReferencia = document.getElementById('btnSalvarReferencia');

// Carrega referência salva (se houver) ao abrir a página
if (selectReferencia) {
  const refSalva = localStorage.getItem('ref_funcao_cardiaca');
  if (refSalva && selectReferencia.querySelector(`option[value="${refSalva}"]`)) {
    selectReferencia.value = refSalva;
  }
}

if (selectReferencia && btnSalvarReferencia) {
  btnSalvarReferencia.addEventListener('click', () => {
    const valor = selectReferencia.value;
    const texto = selectReferencia.options[selectReferencia.selectedIndex]?.text || '';

    if (!valor) {
      alert('Selecione uma referência antes de salvar.');
      return;
    }

    // Salva no navegador (padrão local para este médico/computador)
    localStorage.setItem('ref_funcao_cardiaca', valor);

    // Feedback visual rápido
    btnSalvarReferencia.classList.add('btn-salvar-ref-ok');
    btnSalvarReferencia.innerHTML = '<i class="fas fa-check"></i> Salvo';

    setTimeout(() => {
      btnSalvarReferencia.classList.remove('btn-salvar-ref-ok');
      btnSalvarReferencia.innerHTML = '<i class="fas fa-bookmark"></i> Salvar ref.';
    }, 2000);
  });
}

 function atualizarVD() {
  const peso = parseFloat((weightInput?.value || '').replace(',', '.'));
  const altura = parseFloat((heightInput?.value || '').replace(',', '.'));
  const asc = calcASC(peso, altura);


  const linhasTabela = document.querySelectorAll('#cardiacVolumeTable tbody tr');
  const vdfEndo = calcularSomaLinha(linhasTabela[2]); // VD VDF Endo
  const vsfEndo = calcularSomaLinha(linhasTabela[4]); // VD VSF Endo

  const fe = vdfEndo > 0 ? ((vdfEndo - vsfEndo) / vdfEndo) * 100 : 0;
  const volEjetado = vdfEndo - vsfEndo;

  // Campos da tabela de resultados finais - VD
  const camposVD = document.querySelectorAll(".bloco-tabela:nth-child(2) input");
  if (camposVD.length >= 7) {
    camposVD[0].value = vdfEndo.toFixed(1);                  // VDF Endo
    camposVD[1].value = vsfEndo.toFixed(1);                  // VSF Endo
    camposVD[2].value = asc ? (vdfEndo / asc).toFixed(1) : ""; // VDF indexado
    camposVD[3].value = asc ? (vsfEndo / asc).toFixed(1) : ""; // VSF indexado
    camposVD[4].value = fe.toFixed(1);                       // FE
    camposVD[5].value = volEjetado.toFixed(1);               // Vol. ejetado
    camposVD[6].value = asc ? (volEjetado / asc).toFixed(1) : ""; // Vol. ejetado indexado
  }
  }

  function atualizarVolumeAE() {
    const area4CH = parseFloat(document.getElementById("ae-area4ch").value);
    const area2CH = parseFloat(document.getElementById("ae-area2ch").value);
    const eixoLongo = parseFloat(document.getElementById("ae-eixo-longo").value);
const asc = calcASC(
  parseFloat((weightInput?.value || '').replace(',', '.')),
  parseFloat((heightInput?.value || '').replace(',', '.'))
);

    if (!isNaN(area4CH) && !isNaN(area2CH) && !isNaN(eixoLongo) && eixoLongo > 0 && asc) {
      const volume = (8 / (3 * Math.PI)) * (area4CH * area2CH) / eixoLongo;
      document.getElementById("ae-volume-index").value = (volume / asc).toFixed(1);
    }
  }

  function atualizarVolumeAD() {
    const area4CH = parseFloat(document.getElementById("area4CH_AD").value);
    const area2CH = parseFloat(document.getElementById("area2CH_AD").value);
const asc = calcASC(
  parseFloat((weightInput?.value || '').replace(',', '.')),
  parseFloat((heightInput?.value || '').replace(',', '.'))
);

    if (!isNaN(area4CH) && !isNaN(area2CH) && asc) {
      const volume = (8 / (3 * Math.PI)) * (area4CH * area2CH) / 4.15;
      document.getElementById("volumeAD").value = volume.toFixed(1);
      document.getElementById("volumeIndexAD").value = (volume / asc).toFixed(1);
      document.getElementById("areaIndex4CH_AD").value = (area4CH / asc).toFixed(1);
    }
  }

  function atualizarTodos() {
  atualizarTotais();
  atualizarVE();
  atualizarVD();
  atualizarVolumeAE();
  atualizarVolumeAD();
}


  volumeInputs.forEach(input => {
    input.addEventListener('input', atualizarTodos);
  });

  ["ae-area4ch", "ae-area2ch", "ae-eixo-longo", "area4CH_AD", "area2CH_AD",
 "weight", "height", "peso", "altura"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', atualizarTodos);
});


  atualizarTodos();


    function gerarTextoDoLaudo() {
    const v = id => document.getElementById(id)?.value || "---";

    const texto = `
    <div class="laudo-container">
    <p><strong>RESSONÂNCIA MAGNÉTICA DE CORAÇÃO</strong></p>

    <p><u><strong>Método</strong></u><br>
    Realizadas sequências de cinerressonância e morfológicas antes da administração endovenosa do meio de contraste paramagnético. Após a sua administração, foram realizadas sequências de perfusão miocárdica, volumétrica do tórax e de realce tardio. Exame realizado em repouso.</p>

    <p><u><strong>Análise</strong></u><br>
    ${getRotinaLabel()}</p>

    <p>Átrios com dimensões normais.<br>
    Átrio esquerdo com diâmetro anteroposterior de ${v("ae-diametro-ap")} cm (VN 2,3–4,3 cm) e volume estimado em ${v("ae-volume-index")} ml/m² (VN 26–52 ml/m²).<br>
    Átrio direito com volume estimado em ${v("volumeIndexAD")} ml/m² (VN até 39 ml/m²) e área indexada de ${v("areaIndex4CH_AD")} cm²/m².</p>

    <p>Ventrículo direito com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.<br>
    Volume diastólico final de ${v("vd-vdf-index")} ml/m² (VN 61–121 ml/m²), volume sistólico final de ${v("vd-vsf-index")} ml/m² (VN 19–59 ml/m²) e fração de ejeção estimada em ${v("vd-fe")} % (VN > 40%).<br>
    Miocárdio ventricular direito com espessura e sinal preservados.</p>

    <p>Ventrículo esquerdo com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.<br>
    Diâmetro diastólico final de ${v("ve-ddf")} cm (VN ≤ 5,8 cm), volume diastólico final de ${v("ve-vdf-index")} ml/m² (VN 57–105 ml/m²), volume sistólico final de ${v("ve-vsf-index")} ml/m² (VN 14–38 ml/m²) e fração de ejeção estimada em ${v("ve-fe")} % (VN > 50%).<br>
    Volume ejetado estimado em ${v("ve-vol-ejetado")} mL.<br>
    Miocárdio ventricular esquerdo com espessura e sinal preservados.<br>
    Espessura de até ${v("ve-esp-septal")} cm na parede septal basal (VN ≤ 1,2 cm).<br>
    Massa estimada em ${v("ve-massa")} g (VN 92–176 g) e em ${v("ve-massa-index")} g/m² (VN 49–85 g/m²).</p>

    <p>Perfusão miocárdica normal, em repouso.<br>
    Não se identifica realce tardio miocárdico.<br>
    Valvas cardíacas sem alterações evidentes ao método.<br>
    Não se observa espessamento ou derrame pericárdico.<br>
    Aorta torácica e tronco pulmonar com calibre normal.</p>

    <p><u><strong>Comentários</strong></u><br>
    Ressonância magnética cardíaca sem anormalidade perceptível.<br>
    Não se identifica realce tardio miocárdico.</p>

    <p><em>*Valores de referência: Kawel-Boehm et al. Journal of Cardiovascular Magnetic Resonance (2015)</em></p>
    </div>
    `;
if (window.meuEditorLaudo) {
  window.meuEditorLaudo.setHtml(texto);
}  }

  // Atualiza o laudo sempre que os inputs mudarem
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", gerarTextoDoLaudo);
  });

  // Atualiza também quando mudar o sexo ou função
  ['sexo', 'referencia', 'selectFuncaoCardiaca'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', gerarTextoDoLaudo);
  });


  
  volumeInputs.forEach(input => {
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const currentCell = input;
      const allRows = Array.from(linhasTabela);
      
      // Descobre a célula atual
      let rowIndex = -1;
      let cellIndex = -1;
      allRows.forEach((row, rIdx) => {
        const cells = Array.from(row.querySelectorAll("input"));
        const index = cells.indexOf(currentCell);
        if (index !== -1) {
          rowIndex = rIdx;
          cellIndex = index;
        }
      });

      // Vai para a célula da linha seguinte (mesma coluna)
      if (rowIndex !== -1 && cellIndex !== -1 && allRows[rowIndex + 1]) {
        const nextRowCells = Array.from(allRows[rowIndex + 1].querySelectorAll("input"));
        if (nextRowCells[cellIndex]) {
          nextRowCells[cellIndex].focus();
        }
      }
    }
  });
});


 function atualizarVisibilidade() {
  const modo = selectFuncaoCardiaca.value;

  // ✅ Linha extra da planilha (VD VDF Epi) — precisa existir no HTML com este id:
  // <tr id="row-vd-vdf-epi" style="display:none">...</tr>
  const rowVdVdfEpi = document.getElementById('row-vd-vdf-epi');

  // 👉 Por padrão, a planilha FICA visível
  planilhaVolumes.style.display = 'block';

  // ✅ por padrão a linha extra fica escondida
  if (rowVdVdfEpi) rowVdVdfEpi.style.display = 'none';

  // Oculta containers de resultado
  containerVE.style.display = 'none';
  containerVD.style.display = 'none';
  containerAE.style.display = 'none';
  containerAD.style.display = 'none';
  botaoGerador.style.display = 'none';

  const containerValoresReferencia = document.querySelector('.valores-referencia-box');
  const divMapas = document.querySelector('.mapa-alerta');
  if (containerValoresReferencia) containerValoresReferencia.style.display = 'none';
  if (divMapas) divMapas.style.display = 'none';

  // Esconde todas as linhas de todas as tabelas finais
  const todasTabelas = document.querySelectorAll(
    '.container-VEesquerdo table, .containerVDdireito table, .containerAE table, .container-ADdireito table'
  );
  todasTabelas.forEach(tabela => {
    tabela.querySelectorAll('tr').forEach(linha => (linha.style.display = 'none'));
  });
// Sempre que mudar de modo, se não for "valores", restaura a planilha normal
if (modo !== "valores") {
  sairModoValoresFinais();
}

  // --- MODO MANUAL ---
  if (modo === "manual") {
    containerVE.style.display = 'block';
    containerAE.style.display = 'block';
    containerAD.style.display = 'block';
    botaoGerador.style.display = 'flex';

    todasTabelas.forEach(tabela => {
      tabela.querySelectorAll('tr').forEach(linha => {
        if (linha.querySelector('input.input-manual')) linha.style.display = '';
      });
    });
  }

  // --- MODO MANUAL COM VD (mostra a linha VD VDF Epi + mostra o bloco VD) ---
  else if (modo === "manual_vd") {
    // ✅ mostra linha extra na planilha
    if (rowVdVdfEpi) rowVdVdfEpi.style.display = '';

    containerVE.style.display = 'block';
    containerVD.style.display = 'block'; // ✅ VD aparece nesse modo
    containerAE.style.display = 'block';
    containerAD.style.display = 'block';
    botaoGerador.style.display = 'flex';

    todasTabelas.forEach(tabela => {
      tabela.querySelectorAll('tr').forEach(linha => {
        if (linha.querySelector('input.input-manual')) linha.style.display = '';
      });
    });
  }

  // --- MODO VALORES ---
 else if (modo === "valores") {
  // ✅ entra no modo “Valores Finais” (coluna FINAL automática)
  entrarModoValoresFinais();

  containerVE.style.display = 'block';
  containerAE.style.display = 'block';
  containerAD.style.display = 'block';
  botaoGerador.style.display = 'flex';

  todasTabelas.forEach(tabela => {
    tabela.querySelectorAll('tr').forEach(linha => {
      if (linha.querySelector('input.input-manual')) linha.style.display = '';
    });
  });
}


  // --- MODO APP ---
  else if (modo === "app") {
    containerAE.style.display = 'block';
    containerAD.style.display = 'block';
    if (containerValoresReferencia) containerValoresReferencia.style.display = 'block';
    if (divMapas) divMapas.style.display = 'block';
    botaoGerador.style.display = 'flex';

    todasTabelas.forEach(tabela => {
      tabela.querySelectorAll('tr').forEach(linha => (linha.style.display = ''));
    });
  }

  if (modo === "valores") {
  mostrarSomenteColunaPlanilha(1);
} else {
  mostrarTodasColunasPlanilha();
}

}

let _backupColuna1 = null;

function entrarModoValoresFinais() {
  const tabela = document.getElementById('cardiacVolumeTable');
  if (!tabela) return;

  const linhasBody = tabela.querySelectorAll('tbody tr');
  const header = tabela.querySelector('thead tr');

  // 1) Backup da coluna 1 (pra não perder os dados do usuário)
  _backupColuna1 = [];
  linhasBody.forEach((tr, idx) => {
    const inputs = tr.querySelectorAll('td input.volume-input');
    // coluna 1 = inputs[0]
    const col1 = inputs[0];
    _backupColuna1[idx] = col1 ? col1.value : '';
  });

  // 2) Preenche a coluna 1 com o TOTAL da linha
  linhasBody.forEach((tr) => {
    // Usa sua função existente calcularSomaLinha(tr)
    const total = calcularSomaLinha(tr);

    const inputs = tr.querySelectorAll('td input.volume-input');
    if (inputs[0]) inputs[0].value = Number(total).toFixed(1);
  });

  // 3) Esconde colunas 2..14 e (opcional) esconde a coluna Total
  // Estrutura do header: [Volumes][1..14][Total]
  // Índices de célula: 0=Volumes, 1=col1, ..., 14=col14, 15=Total
  const esconderTotal = true;

  if (header) {
    header.querySelectorAll('th').forEach((th, i) => {
      if (i === 0 || i === 1) th.style.display = '';
      else if (esconderTotal && i === 15) th.style.display = 'none';
      else th.style.display = 'none';
    });

    // Renomeia o cabeçalho da coluna 1 pra ficar “FINAL”
    const thCol1 = header.children[1];
    if (thCol1) thCol1.textContent = 'FINAL';
  }

  linhasBody.forEach((tr) => {
    tr.querySelectorAll('th, td').forEach((cell, i) => {
      if (i === 0 || i === 1) cell.style.display = '';
      else if (esconderTotal && i === 15) cell.style.display = 'none';
      else cell.style.display = 'none';
    });
  });
}

function sairModoValoresFinais() {
  const tabela = document.getElementById('cardiacVolumeTable');
  if (!tabela) return;

  const linhasBody = tabela.querySelectorAll('tbody tr');
  const header = tabela.querySelector('thead tr');

  // 1) Restaura coluna 1 com o backup
  if (_backupColuna1) {
    linhasBody.forEach((tr, idx) => {
      const inputs = tr.querySelectorAll('td input.volume-input');
      if (inputs[0]) inputs[0].value = _backupColuna1[idx] ?? '';
    });
  }
  _backupColuna1 = null;

  // 2) Mostra todas as colunas de volta
  if (header) {
    header.querySelectorAll('th').forEach(th => (th.style.display = ''));
    // Volta o texto do cabeçalho 1 para "1"
    const thCol1 = header.children[1];
    if (thCol1) thCol1.textContent = '1';
  }

  linhasBody.forEach((tr) => {
    tr.querySelectorAll('th, td').forEach(cell => (cell.style.display = ''));
  });

  // Recalcula totais visuais (span do Total) depois que voltou ao normal
  atualizarTotais();
}

function mostrarSomenteColunaPlanilha(colunaIndex) {
  const tabela = document.getElementById('cardiacVolumeTable');
  if (!tabela) return;

  const linhas = tabela.querySelectorAll('tr');

  linhas.forEach(linha => {
    const celulas = linha.children;

    // Percorre todas as colunas
    for (let i = 1; i < celulas.length - 1; i++) {
      if (i === colunaIndex) {
        celulas[i].style.display = '';
      } else {
        celulas[i].style.display = 'none';
      }
    }
  });
}
function mostrarTodasColunasPlanilha() {
  const tabela = document.getElementById('cardiacVolumeTable');
  if (!tabela) return;

  tabela.querySelectorAll('th, td').forEach(celula => {
    celula.style.display = '';
  });
}

const copiarLaudoBtn = document.getElementById('copiarLaudo');

copiarLaudoBtn.addEventListener('click', function () {
  const html = window.meuEditorLaudo ? window.meuEditorLaudo.getHtml() : '';

  const temp = document.createElement('textarea');
  temp.value = html;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);

  alert("Laudo copiado com sucesso!");
});


  selectFuncaoCardiaca.addEventListener('change', atualizarVisibilidade);

  atualizarVisibilidade();

  const blocos = document.querySelectorAll('.bloco-tabela');

blocos.forEach(function (bloco) {
  const header = bloco.querySelector('.bloco-header');
  if (!header) return;

  header.addEventListener('click', function () {
    bloco.classList.toggle('fechado');
  });
});
  
});
