
import React from 'react';
import DashboardCard from './DashboardCard';
import { ActivityIcon } from './icons';

interface NuclearProjectAnalysisProps {
  t: (key: string) => string;
}

const NuclearProjectAnalysis: React.FC<NuclearProjectAnalysisProps> = ({ t }) => {
  const pageHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise de Sistema Integrado SMR</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        :root {
            --primary-color: #2c3e50; --secondary-color: #3498db;
            --accent-color: #e74c3c; --bg-color: #f8f9fa; --card-bg: #ffffff;
            --text-color: #34495e; --header-color: #ffffff;
        }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background-color: var(--bg-color ); color: var(--text-color); }
        .container { max-width: 1400px; margin: 0 auto; padding: 0; }
        header { background: linear-gradient(135deg, var(--primary-color), #34495e); color: var(--header-color); padding: 30px 20px; text-align: center; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        header h1 { margin: 0; font-size: 2.2em; }
        header p { margin: 5px 0 0; font-size: 1.1em; opacity: 0.9; }
        .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 10px 20px; cursor: pointer; border: 2px solid transparent; background-color: var(--card-bg); color: var(--primary-color); border-radius: 50px; font-weight: 600; transition: all 0.3s ease; }
        .tab:hover { background-color: var(--secondary-color); color: white; }
        .tab.active { background-color: var(--primary-color); color: white; border-color: var(--secondary-color); }
        .content { display: none; background-color: var(--card-bg); padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .content.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        h2 { color: var(--primary-color); border-bottom: 3px solid var(--secondary-color); padding-bottom: 10px; margin-bottom: 20px; font-size: 1.6em; }
        .mermaid { text-align: center; margin: 20px 0; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: var(--primary-color); color: var(--header-color); }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .card { background: #fdfdfd; border-left: 5px solid var(--secondary-color); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card h4 { margin-top: 0; color: var(--primary-color); font-size: 1.1em; }
        .card .value { font-size: 2.0em; font-weight: 700; color: var(--secondary-color); margin: 8px 0; }
        .card .unit { font-size: 1em; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Arquitetura Híbrida de Poligeração Nuclear</h1>
            <p>Análise Integrada: SMR, Ciclos de Potência e Refrigeração de Data Center</p>
        </header>

        <div class="tabs">
            <button class="tab active" onclick="showTab('diagrama_src')">Diagrama SRC</button>
            <button class="tab" onclick="showTab('diagrama_irc')">Diagrama IRC</button>
            <button class="tab" onclick="showTab('analise')">Análise de Desempenho</button>
            <button class="tab" onclick="showTab('glossario')">Glossário</button>
        </div>

        <div id="diagrama_src" class="content active">
            <h2>Diagrama de Fluxo: Configuração SRC (Ciclo Simples Recuperado)</h2>
            <p>Esta configuração prioriza a simplicidade do design, com um único ciclo de compressão e recuperação, enquanto ainda permite uma recuperação de calor em cascata para o ciclo ORC e o chiller.</p>
            <div class="mermaid">
                graph TD;
                    subgraph Legenda; direction LR; style SMR_L fill:#e74c3c,stroke:#c0392b,color:#fff; style SCO2_L fill:#f1c40f,stroke:#f39c12,color:#333; style ORC_L fill:#3498db,stroke:#2980b9,color:#fff; style CHILLER_L fill:#1abc9c,stroke:#16a085,color:#fff; style DC_L fill:#9b59b6,stroke:#8e44ad,color:#fff; SMR_L(SMR); SCO2_L(Ciclo S-CO₂); ORC_L(Ciclo ORC); CHILLER_L(Chiller); DC_L(Data Center); end;
                    subgraph "Fonte Térmica Primária"; style SMR fill:#e74c3c,stroke:#c0392b,color:#fff; SMR(SMR 100 MWₜ); end;
                    subgraph "Ciclo de Potência S-CO₂ (SRC)"; style T_SCO2 fill:#f1c40f,stroke:#f39c12; style C_SCO2 fill:#f1c40f,stroke:#f39c12; style REC_SCO2 fill:#f39c12,stroke:#f1c40f,color:#fff; SMR -- "Q_in: 100 MW" --> T_SCO2(Turbina S-CO₂); T_SCO2 -- "W_bruto: 42 MW" --> G1(Gerador 1); T_SCO2 -- "T: 300°C" --> REC_SCO2(Recuperador); REC_SCO2 -- "T: 150°C" --> IHX(IHX-ORC); IHX -- "T: 95°C" --> PC(Precooler); PC -- "T: 40°C" --> C_SCO2(Compressor); C_SCO2 -- "W_cons: 12 MW" --> T_SCO2; C_SCO2 -- "T: 70°C" --> REC_SCO2; REC_SCO2 -- "T: 280°C" --> SMR; end;
                    subgraph "Ciclo de Potência Secundário (ORC)"; style ORC fill:#3498db,stroke:#2980b9,color:#fff; IHX -- "Q_rec: 15 MW" --> ORC(Ciclo ORC); ORC -- "W_liq: 9.2 MW" --> G2(Gerador 2); end;
                    subgraph "Sistema de Refrigeração"; style CHILLER fill:#1abc9c,stroke:#16a085,color:#fff; style TORRE fill:#bdc3c7,stroke:#95a5a6; PC -- "Q_rec: 8 MW" --> CHILLER(Chiller de Absorção); ORC -- "Q_rec: 5.8 MW" --> CHILLER; CHILLER -- "Q_frio: 16.5 MW" --> DC(Data Center); CHILLER -- "Q_rej: 29.3 MW" --> TORRE(Torre de Resfriamento); end;
                    subgraph "Carga Digital"; style DC fill:#9b59b6,stroke:#8e44ad,color:#fff; DC -- "Calor: 16.5 MW" --> CHILLER; end;
                    subgraph "Balanço Elétrico"; style REDE fill:#2ecc71,stroke:#27ae60,color:#fff; G1[P_liq: 30 MW] --> REDE(Rede Elétrica); G2[P_liq: 9.2 MW] --> REDE; DC -- "Consumo: 18.3 MW" --> REDE; end;
            </div>
        </div>

        <div id="diagrama_irc" class="content">
            <h2>Diagrama de Fluxo: Configuração IRC (Resfriamento Intermediário)</h2>
            <p>Esta configuração aumenta a complexidade com um segundo compressor (recompressão) e múltiplos recuperadores (HTR/LTR) para maximizar a eficiência do ciclo S-CO₂, o que, por sua vez, aumenta o potencial total de recuperação de calor.</p>
            <div class="mermaid">
                graph TD;
                    subgraph Legenda; direction LR; style SMR_L fill:#e74c3c,stroke:#c0392b,color:#fff; style SCO2_L fill:#f1c40f,stroke:#f39c12,color:#333; style ORC_L fill:#3498db,stroke:#2980b9,color:#fff; style CHILLER_L fill:#1abc9c,stroke:#16a085,color:#fff; style DC_L fill:#9b59b6,stroke:#8e44ad,color:#fff; SMR_L(SMR); SCO2_L(Ciclo S-CO₂); ORC_L(Ciclo ORC); CHILLER_L(Chiller); DC_L(Data Center); end;
                    subgraph "Fonte Térmica Primária"; style SMR fill:#e74c3c,stroke:#c0392b,color:#fff; SMR(SMR 100 MWₜ); end;
                    subgraph "Ciclo de Potência S-CO₂ (IRC)"; style T_SCO2 fill:#f1c40f,stroke:#f39c12; style C1 fill:#f1c40f,stroke:#f39c12; style C2 fill:#f1c40f,stroke:#f39c12; style HTR fill:#f39c12,stroke:#f1c40f,color:#fff; style LTR fill:#f39c12,stroke:#f1c40f,color:#fff; style IC fill:#f39c12,stroke:#f1c40f,color:#fff; SMR -- "Q_in: 100 MW" --> HTR(Recuperador Alta Temp.); HTR -- "T: 320°C" --> T_SCO2(Turbina S-CO₂); T_SCO2 -- "W_bruto: 45 MW" --> G1(Gerador 1); T_SCO2 -- "T: 300°C" --> HTR; HTR -- "T: 180°C" --> LTR(Recuperador Baixa Temp.); LTR -- "T: 120°C" --> Split(Divisor de Fluxo); Split -- "60% Fluxo" --> PC(Precooler) --> C1(Compressor Principal); Split -- "40% Fluxo (Bypass)" --> C2(Compressor Recompressão); C1 -- "T: 95°C" --> IC(Intercooler); IC -- "T: 40°C" --> LTR; LTR -- "T: 150°C" --> Merge(Junção de Fluxo); C2 -- "T: 150°C" --> Merge; Merge --> HTR; end;
                    subgraph "Sistema de Refrigeração e Carga"; style CHILLER fill:#1abc9c,stroke:#16a085,color:#fff; style DC fill:#9b59b6,stroke:#8e44ad,color:#fff; IC -- "Q_rec: 10 MW" --> CHILLER(Chiller de Absorção); PC -- "Q_rec: 18 MW" --> CHILLER; LTR -- "Q_rec: 12 MW" --> CHILLER; CHILLER -- "Q_frio: 48 MW" --> DC(Data Center); DC -- "Calor: 48 MW" --> CHILLER; end;
                    subgraph "Balanço Elétrico"; style REDE fill:#2ecc71,stroke:#27ae60,color:#fff; G1[P_liq: 30.8 MW] --> REDE(Rede Elétrica); DC -- "Consumo: 53.3 MW" --> REDE; end;
            </div>
        </div>

        <div id="analise" class="content">
            <h2>Análise de Desempenho Comparativa</h2>
            <div class="grid">
                <div class="card">
                    <h4>Configuração SRC</h4>
                    <div class="value">39.2%</div>
                    <div class="unit">Eficiência Elétrica Líquida</div>
                    <p><strong>Refrigeração:</strong> 41.95 MW  
<strong>Servidores:</strong> ~4,570  
<strong>Complexidade:</strong> Menor</p>
                </div>
                <div class="card">
                    <h4>Configuração IRC</h4>
                    <div class="value">42.8%</div>
                    <div class="unit">Eficiência Elétrica Líquida</div>
                    <p><strong>Refrigeração:</strong> 102 MW  
<strong>Servidores:</strong> ~11,110  
<strong>Complexidade:</strong> Maior</p>
                </div>
            </div>
            <h3>Conclusão da Análise</h3>
            <p>A configuração IRC, embora mais complexa, oferece um ganho significativo tanto em eficiência elétrica (+3.6 pontos percentuais) quanto em capacidade de refrigeração (+143%). A escolha entre os sistemas dependerá de uma análise tecno-econômica, ponderando o custo de capital adicional da configuração IRC contra as receitas aumentadas da venda de eletricidade e da maior capacidade de processamento do data center.</p>
        </div>

        <div id="glossario" class="content">
            <h2>Glossário Técnico</h2>
            <table>
                <thead>
                    <tr><th>Termo</th><th>Função</th><th>Parâmetros Chave</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>SMR</strong></td><td>Fonte térmica primária</td><td>100 MWₜ, 550-650°C</td></tr>
                    <tr><td><strong>Ciclo S-CO₂</strong></td><td>Geração de eletricidade primária</td><td>η ≈ 40-45%, P_max ≈ 28 MPa</td></tr>
                    <tr><td><strong>Ciclo ORC</strong></td><td>Geração elétrica com calor residual</td><td>Fluido: R134a, T_in ≈ 150°C</td></tr>
                    <tr><td><strong>Chiller de Absorção</strong></td><td>Produção de frio com calor residual</td><td>Par: LiBr-H₂O, T_in ≈ 80-120°C, COP ≈ 1.2</td></tr>
                    <tr><td><strong>Data Center</strong></td><td>Carga térmica e de processamento</td><td>NVIDIA HGX, PUE ≈ 1.1-1.15</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Use a try-catch block to handle potential errors if mermaid is not available
        try {
            if (window.mermaid) {
                window.mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
            }
        } catch (e) {
            console.error('Mermaid.js failed to initialize.', e);
        }

        function showTab(tabId) {
            document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            const contentEl = document.getElementById(tabId);
            const tabEl = document.querySelector(\`[onclick="showTab('\${tabId}')"]\`);
            
            if(contentEl) contentEl.classList.add('active');
            if(tabEl) tabEl.classList.add('active');
        }

        // Defer initial tab activation to ensure all elements are loaded
        function activateInitialTab() {
            showTab('diagrama_src');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', activateInitialTab);
        } else {
            activateInitialTab();
        }
    </script>
</body>
</html>
  `;

  return (
    <DashboardCard title={t('nuclear.analysisTitle')} icon={<ActivityIcon className="w-6 h-6" />}>
      <div className="w-full h-[85vh] bg-white rounded-lg overflow-hidden">
        <iframe
          srcDoc={pageHtml}
          title={t('nuclear.analysisIframeTitle')}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </DashboardCard>
  );
};

export default NuclearProjectAnalysis;
