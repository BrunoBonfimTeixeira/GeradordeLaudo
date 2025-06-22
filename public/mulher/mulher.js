document.addEventListener('DOMContentLoaded', function () {
    const patientForm = document.getElementById("patientForm");
    const generateReportBtn = document.getElementById("generateReportBtn");
    const laudoText = document.getElementById("laudoText");
    const reportContainer = document.getElementById("reportContainer");
    const table = document.getElementById("cardiacVolumeTable");

    const volumeInputs = document.querySelectorAll('.volume-input');
    volumeInputs.forEach(input => {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const index = Array.from(volumeInputs).indexOf(input);
                const nextInput = volumeInputs[index + 11];
                if (nextInput) nextInput.focus();
            }
        });
    });

    const calcularSomaLinha = (linha) => {
        const inputs = linha.querySelectorAll('input');
        let total = 0;
        inputs.forEach(input => {
            const valor = parseFloat(input.value);
            if (!isNaN(valor)) total += valor;
        });
        const totalCell = linha.querySelector('td:last-child span');
        if (totalCell) totalCell.textContent = total.toFixed(2);
        return total;
    };

    const linhasTabela = document.querySelectorAll('#cardiacVolumeTable tbody tr');
    linhasTabela.forEach(linha => {
        const inputs = linha.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => calcularSomaLinha(linha));
        });
    });

    function calcASC(peso, altura) {
        return Math.sqrt((peso * altura) / 3600).toFixed(2);
    }

    const marcar = (valor, min, max) => {
        return valor < min || valor > max ? `❌ ${valor.toFixed(1)}` : `✅ ${valor.toFixed(1)}`;
    };

    patientForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const weight = document.getElementById("weight").value;
        const height = document.getElementById("height").value;

        alert(`Paciente: ${name}\nIdade: ${age}\nPeso: ${weight} kg\nAltura: ${height} cm`);
    });

    generateReportBtn.addEventListener("click", function () {
        const name = document.getElementById("name").value;
        const age = parseInt(document.getElementById("age").value);
        const weight = parseFloat(document.getElementById("weight").value);
        const height = parseFloat(document.getElementById("height").value);

        if (!name || !age || !weight || !height) {
            alert("Preencha todos os campos do paciente.");
            return;
        }

        const asc = calcASC(weight, height);

        const volumes = Array.from(linhasTabela).map(calcularSomaLinha);
        const [VE_VDF_Endo, VE_VDF_Epi, VD_VDF_Endo, VE_VSF_Endo, VD_VSF_Endo] = volumes;

        const ve_vdf_indexado = VE_VDF_Endo / asc;
        const ve_vsf_indexado = VE_VSF_Endo / asc;
        const vd_vdf_indexado = VD_VDF_Endo / asc;
        const vd_vsf_indexado = VD_VSF_Endo / asc;

        const ve_fe = ((VE_VDF_Endo - VE_VSF_Endo) / VE_VDF_Endo) * 100;
        const vd_fe = ((VD_VDF_Endo - VD_VSF_Endo) / VD_VDF_Endo) * 100;

        const laudo = `
Laudo de Ressonância Magnética Cardíaca - Mulher

Paciente: ${name} | Idade: ${age} anos | Peso: ${weight} kg | Altura: ${height} cm | ASC: ${asc} m²

🏥 VENTRÍCULO ESQUERDO
- Volume diastólico final (VDF Endo): ${VE_VDF_Endo} mL (VN: 67–155 mL)
- Volume sistólico final (VSF Endo): ${VE_VSF_Endo} mL (VN: 21–76 mL)
- VDF Indexado: ${marcar(ve_vdf_indexado, 41, 77)} mL/m² (VN: 41–77)
- VSF Indexado: ${marcar(ve_vsf_indexado, 14, 39)} mL/m² (VN: 14–39)
- Fração de Ejeção: ${marcar(ve_fe, 53, 100)}% (VN > 53%)

🏥 VENTRÍCULO DIREITO
- Volume diastólico final (VDF Endo): ${VD_VDF_Endo} mL (VN: 80–191 mL)
- Volume sistólico final (VSF Endo): ${VD_VSF_Endo} mL (VN: 23–78 mL)
- VDF Indexado: ${marcar(vd_vdf_indexado, 47, 105)} mL/m² (VN: 47–105)
- VSF Indexado: ${marcar(vd_vsf_indexado, 14, 43)} mL/m² (VN: 14–43)
- Fração de Ejeção: ${marcar(vd_fe, 45, 100)}% (VN > 45%)

📌 Observações:
Átrios com dimensões normais.
Função contrátil global preservada.
Sem alterações segmentares evidentes.
Sem sinais de realce tardio miocárdico.

*Valores de referência: Kawel-Boehm et al. JCMR 2015
        `.trim();

        laudoText.value = laudo;
        reportContainer.style.display = "block";
    });
});
