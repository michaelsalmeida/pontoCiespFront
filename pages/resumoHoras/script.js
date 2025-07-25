import { alertas, alertaPageAtual } from '../sweetalert.js';
        import { sair, verificarLogoff, verificarCargoLogado } from '../funcoes.js';
        import Global from '../../global.js';

        document.getElementById('sair').addEventListener('click', async () => {
            sair();
        });

        function concertarData (dataRecebida) {

            // Converte a string para um objeto Date
            const data = new Date(dataRecebida);

            // Diminui 1 dia
            data.setDate(data.getDate() + 0);

            // Formata a nova data para string (opcional)
            const novaData = data.toISOString().split('T')[0];

            return novaData;
        }

        document.getElementById('baixarPDF').addEventListener('click', async function() {
            const { jsPDF } = window.jspdf;

            const banco = await removerSegundos();

            console.log(banco);

            const horaBanco = banco.banco;

            var tabela = document.getElementById('tabelaPdf');

            tabela.style.display = 'block';

            /// Capturando a tabela
            html2canvas(document.getElementById('tabelaPdf'), { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4',
                    putOnlyUsedFonts: true,
                    floatPrecision: 16
                });

                const imgWidth = 297 - 20; // Largura A4 menos margem (20mm)
                const pageHeight = 210; // Altura A4 em mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;

                let position = 10; // Margem superior (10mm)
                const horasGuardadas = horaBanco;
                pdf.text(`Banco de horas - ${horasGuardadas}`, 10, position);
                position += 10;

                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Margem esquerda (10mm)
                heightLeft -= pageHeight;




                // Adicionando campos para assinatura
                const assinaturaY = position + imgHeight + 20; // Posição Y para os campos de assinatura
                const assinaturaEspaco = 80; // Espaço entre os campos
                const centralizarX = 105; // Posição X para centralizar os campo
                
                // Desenha as linhas das assinaturas
                pdf.line(centralizarX - 30, assinaturaY, centralizarX + 40, assinaturaY); // Linha 1
                pdf.line(centralizarX + assinaturaEspaco - 30, assinaturaY, centralizarX + assinaturaEspaco + 40, assinaturaY); // Linha 2

                // Adiciona os textos das assinaturas abaixo das linhas
                pdf.text("Funcionário", centralizarX - 10, assinaturaY + 5);
                pdf.text("Empregador", centralizarX + assinaturaEspaco - 10, assinaturaY + 5);

                pdf.save('tabela.pdf'); // Nome do arquivo

                tabela.style.display = 'none';
            });
        });


        window.addEventListener('load', async () => {

                verificarLogoff();

                const cargo = await verificarCargoLogado();

                if (cargo == 'administrador') {
                    const botaoCadastro = document.getElementById('botaoCad');
                    const botaoPesquisa = document.getElementById('botaoPes');

                    botaoCadastro.style.display = 'block';
                    botaoPesquisa.style.display = 'block';
                }
                
                alertas();

                const banco = await removerSegundos(); 

                console.log(`Banco acumulado aqui ${banco}`)

                const divBanco = document.getElementById('bancoAcumulado');

                console.log(banco);

                if (banco.situacao == 'positivo') {
                    divBanco.style.boxShadow = '0px 0px 10px 10px rgba(0, 255, 0, 0.6)';
                    divBanco.style.border = '2px solid rgba(0, 255, 0)';

                } else {
                    divBanco.style.boxShadow = '0px 0px 10px 10px rgba(255, 0, 0, 0.6)';
                    divBanco.style.border = '2px solid rgba(255, 0, 0)';
                }

                document.getElementById('bancoAcumulado').innerText = banco.banco;


        });

        function editarHora (valor) {

            sessionStorage.setItem('idLancamento', valor);
            
            window.location.href = '../editarLancamento/editarLancamento.html';
        }

         function criarTabela(dados) {
            console.log(dados);

            var nome;

            if (dados.length > 0) {
                nome = `Folha de ponto : ${dados[0]['nome']}`;
            } else {
                nome = 'Não encontrado'
            }

            var tabela = `
            <div id="divRelatorio">

            <div id="labelResumo">
                <h1 id="textResumo">${nome}</h1>
            </div>
            <table style="width:100%"><tr>
            <th>Data</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Ida Almoço</th>
            <th>Volta Almoço</th>
            <th>Carga Diária</th>
            <th>Motivo</th>
            <th>Descricao</th>
            <th>x</th>
        </tr>
            </div>    
        `;

        var tabela2 = `
            <div id="divRelatorio">

            <div id="labelResumo">
                <h1 id="textResumo">${nome}</h1>
            </div>
            <table style="width:100%"><tr>
            <th>Data</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Ida Almoço</th>
            <th>Volta Almoço</th>
            <th>Carga Diária</th>
            <th>Motivo</th>
            <th>Descricao</th>
        </tr>
            </div>    
        `;

            if (dados.length <= 0) {
                document.getElementById('semHora').setAttribute('style', 'display: flex;');
            } else {
                
                document.getElementById('semHora').setAttribute('style', 'display: none;');

                var linha = ``;

                var linha2= ``;

                for (var i = 0; i < dados.length; i ++) {
                    const dataRetorno = new Date(dados[i]['data']);

                    const dataArrumada = concertarData(dataRetorno);

                    console.log(`Data arrumada ${dataArrumada}`);

                    // const soData = dataArrumada.toLocaleDateString('pt-BR');

                    linha += `<tr><td><p>${dataArrumada}</p></td><td><p>${dados[i]['entrada']}</p></td><td><p>${dados[i]['saida']}</p></td><td><p>${dados[i]['idaIntervalo']}</p></td><td><p>${dados[i]['voltaIntervalo']}</p></td><td><p>${dados[i]['cargaDiaria']}</p></td><td><p>${dados[i]['motivo']}</p></td><td><p>${dados[i]['descricao']}</p></td><td><button id='edicao' class='puxarId' value = "${dados[i]['idCargaHoraria']}"><i class="fas fa-pencil-alt"></i></button></td></tr>
                    `
                    linha2 += `<tr><td><p>${dataArrumada}</p></td><td><p>${dados[i]['entrada']}</p></td><td><p>${dados[i]['saida']}</p></td><td><p>${dados[i]['idaIntervalo']}</p></td><td><p>${dados[i]['voltaIntervalo']}</p></td><td><p>${dados[i]['cargaDiaria']}</p></td><td><p>${dados[i]['motivo']}</p></td><td><p>${dados[i]['descricao']}</p></td></tr>
                    `
                }
                tabela = tabela + linha + '</table>';
                tabela2 = tabela2 + linha2 + '</table>';
            }

            return [tabela ,tabela2];
        }


        function getCurrentMonthAndYear() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
            const year = today.getFullYear();
            return `${year}-${month}`;
        }

        const dataAtual = getCurrentMonthAndYear();

        async function puxarHorarios (dataEscolhida) {
            try {        
        
                    const requisicao = await fetch (`${Global}usuario/horarios`, {
                        method : 'POST',
                        headers : {
                            'Content-Type':'application/json',
                            'Cookies' : decodeURIComponent(document.cookie)
                        },
                        body: JSON.stringify({ dataEscolhida })
                    })
        
                    const resposta = await requisicao.json();
                    
                    return resposta.horarios;                 
    

            } catch (error) {
                console.log(error)
            }
        }

        async function puxarBanco () {
            // Puxar banco de horas

            const requisicao = await fetch(`${Global}usuario/buscarBanco` , {
                    method : 'POST',
                    headers : {
                        'Cookies' : decodeURIComponent(document.cookie)
                    }
                });

                const resposta = await requisicao.json();

                return { 'horas' : resposta['banco'][0]['horasAcumuladas'], 'situacao' : resposta['banco'][0]['situacaoBanco'] } ;
        }

        async function removerSegundos () {
            const horario = await puxarBanco();

            const hora = horario['horas'].toString();

            // Divide a string em um array usando ":" como separador
            const partes = hora.split(":");

            // Remove o último elemento do array (os segundos)
            partes.pop();

            if(Number(partes[0]) > 100) {
                return false
            } else {

                // Junta o array novamente usando ":" como separador
                const horaSemSegundos = partes.join(":");
    
                return { 'banco' : horaSemSegundos, 'situacao' : horario['situacao'] };
            }

        }
        
        // Função para obter a data atual no formato YYYY-MM

        // Definir o valor máximo para o input de mês
        const mesAnoInput = document.getElementById('data');
        mesAnoInput.max = getCurrentMonthAndYear();



        document.getElementById('data').addEventListener('change', async () => {
            const data = document.getElementById('data').value;

            const dados = await puxarHorarios(data);

            const tab = criarTabela(dados);

            document.getElementById('tabelaContainer').innerHTML = tab[0];

            document.getElementById('tabelaPdf').innerHTML = tab[1];

            const botaoPdf = document.getElementById('botaoPdf');

            botaoPdf.style.display = 'flex';

            var botoes = document.getElementsByClassName('puxarId');

            for (var i = 0; i < botoes.length; i ++) {
                let id = botoes[i].value;

                botoes[i].addEventListener('click', () => {
                    editarHora(id);    
                })
            }
        })