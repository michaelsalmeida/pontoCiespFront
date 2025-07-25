import { alertas, alertaPageAtual } from '../sweetalert.js';
        import { sair, verificarLogoff, verificarCargoLogado } from '../funcoes.js';
        import Global from '../../global.js';

        document.getElementById('sair').addEventListener('click', async () => {
            sair();
        })

        async function somarHorarios(categoria, banco, horarioParaSubtrair) {
            // Separa as horas e minutos de cada horário

            var categoriaParcial = categoria;
            
            var [bancoHora, bancoMinuto] = banco.split(':').map(Number);
            var [hora1, minuto1] = horarioParaSubtrair.split(':').map(Number);

            minuto1 = minuto1 + (hora1 * 60);
            
            for (var x = 0; x < minuto1; x ++) {
                

                if (categoriaParcial == 'negativo') {
                    if ((bancoHora < 0 && bancoMinuto > 0) || (bancoHora == 0 && bancoMinuto > 0)) {
                        bancoMinuto -= 1

                    } else if (bancoHora < 0 && bancoMinuto == 0) {
                        bancoHora += 1;
                        bancoMinuto = 59;
                    } else if (bancoHora == 0  && bancoMinuto == 0) {
                        categoriaParcial = 'positivo';
                        bancoMinuto += 1;
                    }

                } else {
                    if (bancoMinuto < 59) {
                        bancoMinuto += 1;
                    } else {
                        bancoMinuto = 0;
                        bancoHora += 1;
                    }
                }
            }

            const horaFormatada = (categoriaParcial == 'positivo') ? `${bancoHora}` : `-${bancoHora}`;

            const horaParaEnviarAoBanco =  `${horaFormatada}:${bancoMinuto}`;

            return {'situacao' : categoriaParcial, 'banco' : horaParaEnviarAoBanco};

        }

        async function subtrairHorarios(categoria, banco, horarioParaSubtrair) {
            // Separa as horas e minutos de cada horário

            var categoriaParcial = categoria;
            
            var [bancoHora, bancoMinuto] = banco.split(':').map(Number);
            var [hora1, minuto1] = horarioParaSubtrair.split(':').map(Number);

            console.log(bancoHora, bancoMinuto);

            minuto1 = minuto1 + (hora1 * 60);
            
            for (var x = 0; x < minuto1; x ++) {

                if (categoriaParcial == 'positivo') {
                    if ((bancoHora > 0 && bancoMinuto > 0) || (bancoHora == 0 && bancoMinuto > 0)) {
                        bancoMinuto -= 1

                    } else if (bancoHora > 0 && bancoMinuto == 0) {
                        bancoHora -= 1;
                        bancoMinuto = 59;
                        
                    } else if (bancoHora == 0  && bancoMinuto == 0) {
                        categoriaParcial = 'negativo';
                        bancoMinuto += 1;
                    }

                } else {
                    if (bancoMinuto < 59) {
                        bancoMinuto += 1;
                    } else {
                        bancoMinuto = 0;
                        bancoHora -= 1;
                    }
                }
            }

            console.log(bancoHora, bancoMinuto);

            var horaFormatada = (categoriaParcial == 'positivo') ? `${bancoHora}` : `-${bancoHora}`;

            if (horaFormatada.includes('--')) {
                horaFormatada = horaFormatada.replace('--', '-');
            }

            const horaParaEnviarAoBanco =  `${horaFormatada}:${bancoMinuto}`;

            return {'situacao' : categoriaParcial, 'banco' : horaParaEnviarAoBanco};

        }

        async function puxarDadosDoHorario () {
            const idLancamento = sessionStorage.getItem('idLancamento');

            const data = document.getElementById('data');
            const entrada = document.getElementById('horaEntrada');
            const saida = document.getElementById('horaSaida');
            const motivo = document.getElementById('motivoHorario');
            const descricao = document.getElementById('motivo');

            const requisicao = await fetch (`${Global}usuario/puxarDadosHorario`, {
                method : 'POST',
                    credentials : 'include',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Cookies' : decodeURIComponent(document.cookie)
                },
                body : JSON.stringify({idLancamento})
            })

            const resposta = await requisicao.json();

            sessionStorage.setItem('carga', resposta['dados'][0]['cargaDiaria']);

            sessionStorage.setItem('almocoFeito', resposta['dados'][0]['idaIntervalo']);
            
            const dataFormatada = resposta['dados'][0]['data'].split('T')[0];

            sessionStorage.setItem('dataPuxada', dataFormatada);

            sessionStorage.setItem('tempoDaMudanca', resposta['dados'][0]['tempoMudanca']);

            sessionStorage.setItem('situacaoDaMudanca', resposta['dados'][0]['situacaoMudanca']);
            
            console.log(resposta);

            data.value = dataFormatada;
            entrada.value = resposta['dados'][0]['entrada'];
            saida.value = resposta['dados'][0]['saida'];
            motivo.value = resposta['dados'][0]['motivo'];
            descricao.value = resposta['dados'][0]['descricao'];

            const requisicao2 = await fetch (`${Global}usuario/buscarBanco`, {
                method : 'POST',
                    credentials : 'include',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Cookies' : decodeURIComponent(document.cookie)
                },
                body : JSON.stringify({idLancamento})
            })

            const resposta2 = await requisicao2.json();

            sessionStorage.setItem('bancoAcumulado', resposta2['banco'][0]['horasAcumuladas']);
            sessionStorage.setItem('situacao', resposta2['banco'][0]['situacaoBanco']);
            
        }


        window.addEventListener('load', async () => {

            verificarLogoff();

            puxarDadosDoHorario();

            const cargo = await verificarCargoLogado();

            if (cargo == 'administrador') {
                const botaoCadastro = document.getElementById('botaoCad');
                const botaoPesquisa = document.getElementById('botaoPes');

                botaoCadastro.style.display = 'block';
                botaoPesquisa.style.display = 'block';
            }

            const data = document.getElementById('data').value;

            console.log(`Data puxada ${data}`);
            
            alertas();
        })

        document.getElementById('motivoHorario').addEventListener('change', () => {
            console.log(document.getElementById('motivoHorario').value);
        })

        async function reverterBanco (bancoAtual, situacaoAtual, tempoDaMudanca, situacaoDaMudanca) {

            console.log('Dados da reversão', bancoAtual, situacaoAtual, tempoDaMudanca, situacaoDaMudanca);
            
            var bancoRevertido;
            
            if (situacaoDaMudanca == 'positivo') {
                bancoRevertido = await subtrairHorarios(situacaoAtual, bancoAtual, tempoDaMudanca);
            } else {
                bancoRevertido = await somarHorarios(situacaoAtual, bancoAtual, tempoDaMudanca);
            }
            
            console.log('Banco mudado', bancoRevertido);

            return bancoRevertido;

        }

        async function deletarHora () {
            const idCargaHoraria = sessionStorage.getItem('idLancamento');

            const requisicao = await fetch (`${Global}usuario/apagarHorario`, {
                        method : 'POST',
                        credentials : 'include',
                        headers : {
                            'Content-Type' : 'application/json',
                            'Cookies' : decodeURIComponent(document.cookie)
                        },
                        body : JSON.stringify({ idCargaHoraria })
                    });


            const resposta = await requisicao.json();

            console.log(resposta);

            return resposta;

        }

        function verificarDiaSemana(data) {
            // Cria um objeto Date a partir da data fornecida
            const dia = new Date(data);
            
            // Obtém o dia da semana (0 = domingo, 6 = sábado)
            const diaDaSemana = dia.getDay();

            // Verifica se é sábado ou domingo
            if (diaDaSemana === 5 || diaDaSemana === 6) {
                return true;
            } else {
                return false;
            }
        }

        document.getElementById('apagarHora').addEventListener('click', async () => {
            lancarHoras('false', true);
            const funcionou = await deletarHora();

            if(funcionou['status'] == 'success') {

                sessionStorage.setItem('status', funcionou.status);
                sessionStorage.setItem('mensagem', funcionou.msg);

                window.location.href = '../resumoHoras/resumoHoras.html';
            }
        })

        async function calcularDiferencaHorarios(horaInicial, horaFinal) {
            // Divide as strings de hora em horas e minutos
            const [horaInicialH, horaInicialM] = horaInicial.split(':').map(Number);
            const [horaFinalH, horaFinalM] = horaFinal.split(':').map(Number);

            // Cria objetos Date para os horários inicial e final
            const dataInicial = new Date();
            dataInicial.setHours(horaInicialH, horaInicialM, 0, 0);
            const dataFinal = new Date();
            dataFinal.setHours(horaFinalH, horaFinalM, 0, 0);

            // Calcula a diferença em milissegundos
            const diferencaEmMilissegundos = dataFinal - dataInicial;

            // Converte a diferença para horas
            const diferencaEmHoras = diferencaEmMilissegundos / (1000 * 60 * 60);

            // Formata a diferença em horas para HH:MM
            const horas = Math.floor(diferencaEmHoras);
            const minutos = Math.floor((diferencaEmHoras - horas) * 60);
            const resultado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

            return resultado;
        }

        async function lancarHoras (diaDeBanco, apagarHora) {
            
            const dataDaEdicao = sessionStorage.getItem('dataPuxada');
            const finalDeSemana = verificarDiaSemana(dataDaEdicao);
            var tempoDaMudanca = sessionStorage.getItem('tempoDaMudanca');
            var situacaoDaMudanca = sessionStorage.getItem('situacaoDaMudanca');

            const puxarBancoDeHorasAtual = await removerSegundos();

            console.log('banco puxado agora')
            console.log(puxarBancoDeHorasAtual)

            const puxarBancoDeHoras = await reverterBanco(puxarBancoDeHorasAtual.hora, puxarBancoDeHorasAtual.situacao, tempoDaMudanca, situacaoDaMudanca);
            
            console.log(puxarBancoDeHoras);


            var bHora = puxarBancoDeHoras.banco;
            var bSituacao = puxarBancoDeHoras.situacao;
            var btempoDaMudanca = tempoDaMudanca;
            var bSituacaoDaMudanca = (situacaoDaMudanca = 'positivo' ) ? 'negativo' : 'positivo';

            console.log('oia aqui');

            console.log(bHora, bSituacao, btempoDaMudanca, bSituacaoDaMudanca);

            const requisicao0 = await fetch (`${Global}usuario/lancarBanco`, {
                method : 'POST',
                credentials : 'include',
                headers : {
                    'Content-Type' : 'application/json',
                    'Cookies' : decodeURIComponent(document.cookie)
                },
                body : JSON.stringify({ 'bancoAtual' : bHora, 'situacaoBancoHoras' : bSituacao, 'tempoDaMudanca' : btempoDaMudanca, 'situacaoDaMudanca' : bSituacaoDaMudanca  })
            });
    
    
            const resposta0 = await requisicao0.json();


            console.log('banco revertido')
            console.log(puxarBancoDeHoras)

            tempoDaMudanca = '';
            situacaoDaMudanca = '';

            const checkbox = document.getElementById('minhaCheckbox');

            var compensacao = '09:00';
            var compensacaoFaltouCarga = '07:30';

            if (checkbox.checked) {
                compensacao = '09:15';
                compensacaoFaltouCarga = '07:45';
            }

            if (apagarHora == false) {

                const data = document.getElementById('data').value;
                const entrada = document.getElementById('horaEntrada').value;
                const saida = document.getElementById('horaSaida').value;
                const motivo = document.getElementById('motivoHorario').value;
                const descricao = document.getElementById('motivo').value;
                const idLancamento = sessionStorage.getItem('idLancamento');
                // flags para saber se vai ter banco de horas para adicionar ao banco
    
                
    
                const finalDeSemanaDataModificada = verificarDiaSemana(data);
    
    
                // flag para saber se a pessoa passou das 9 horas trabalhadas no dia
                var passouHorarioNormal = false;
    
                // flag para saber se a pessoa fez uma carga horária menor a exigida
                var faltouCargaHoraria = false;
    
                // carga horária em string
                const cargaDiaria = await subtrairHorarios('positivo', saida, entrada);
    
               
    
                // separando as horas dos minutos e transformando cada um em number
                const [horas, minutos] = cargaDiaria['banco'].split(':').map(Number);
            
                if(checkbox.checked) {
                    if(horas > 9 || (horas == 9 && minutos > 15)) {            
                        passouHorarioNormal = true;
        
                    } else if (horas < 9 || horas == 9 && minutos < 15) {
                        faltouCargaHoraria = true;
                    }
                } else {
                    if(horas > 9 || (horas === 9 && minutos > 0)) {            
                        passouHorarioNormal = true;
        
                    } else if (horas < 9) {
                        faltouCargaHoraria = true;
                    }
                }
    
                if (data != '' && entrada != '' && saida != '' && motivo != '#' && descricao != '') {
    
                    var bancoAtual = puxarBancoDeHoras.banco;
    
                    var situacaoBancoHoras = puxarBancoDeHoras.situacao;
    
                    try {
    
                        if (finalDeSemanaDataModificada) {
    
                            const horaParaBanco = await somarHorarios(situacaoBancoHoras, bancoAtual, cargaDiaria['banco']);
    
                            bancoAtual = horaParaBanco.banco;
        
                            situacaoBancoHoras = horaParaBanco.situacao;
    
                            tempoDaMudanca = cargaDiaria['banco'];
    
                            situacaoDaMudanca = 'positivo';
    
                            console.log('horas do final de semana', horaParaBanco);
    
                        } else {
    
                            if (passouHorarioNormal) {
                                console.log(compensacao);
                                var [horaCarga, minutoCarga] = cargaDiaria['banco'].split(':').map(Number);
        
                                var situacaoCargaHoraria = ((horaCarga > 9) || (horaCarga == 9 && minutoCarga > 0)) ? 'negativo' : 'positivo';
                                // Pega as horas escedidas na carga horária.
                                const horaAmais = await subtrairHorarios('positivo', cargaDiaria.banco, compensacao);
            
                                // Pega a quantidade de horas já acumuladas no banco de dados
                                // const bancoAtual = await removerSegundos(); 
                                
                                const [horaBanco, minutoBanco] = bancoAtual.split(':').map(Number);
            
                                // Verifica se as horas acumuladas no banco já estão no limide e 40
                                    
                                const horaParaBanco = await somarHorarios(situacaoBancoHoras, bancoAtual, horaAmais.banco);
    
                                bancoAtual = horaParaBanco.banco;
    
                                situacaoBancoHoras = horaParaBanco.situacao;
                                
                                tempoDaMudanca = horaAmais.banco;
    
                                situacaoDaMudanca = 'positivo';
                            
                            } 
        
          
                            if (faltouCargaHoraria) {
        
                                if (diaDeBanco == true) {
        
                                    console.log(situacaoBancoHoras, bancoAtual);
        
                                    horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, compensacaoFaltouCarga);
        
                                    bancoAtual = horaParaBanco.banco;
        
                                    situacaoBancoHoras = horaParaBanco.situacao;
    
                                    tempoDaMudanca = compensacaoFaltouCarga;
    
                                    situacaoDaMudanca = 'negativo';
        
                                    console.log(situacaoBancoHoras);
        
                                } else {
        
                                    var tempoFaltandoCargaHorariaNormal;
        
                                    console.log('Foi checkado')

                                    tempoFaltandoCargaHorariaNormal = await calcularDiferencaHorarios(cargaDiaria['banco'], compensacaoFaltouCarga);
    
                                    var horaParaBanco;
                                        
                                    horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, tempoFaltandoCargaHorariaNormal);
            
                                    bancoAtual = horaParaBanco.banco;
            
                                    situacaoBancoHoras = horaParaBanco.situacao;

                                    tempoDaMudanca = tempoFaltandoCargaHorariaNormal;

                                    situacaoDaMudanca = 'negativo';
    
                                    
                                }
        
            
                            }
                        }
        
                    
    
                        var cargaParaBanco = cargaDiaria['banco'];
    
                        var resposta1;
    
                        const dadosEnviados = {
                            idLancamento,
                            data,
                            entrada,
                            saida,
                            cargaDiaria : cargaParaBanco,
                            motivo,
                            descricao,
                            banco: (diaDeBanco) ? 'true' : '',
                            almocoFeito: true,
                            tempoDaMudanca : (tempoDaMudanca != '') ? tempoDaMudanca : '00:00',
                            situacaoDaMudanca : (situacaoDaMudanca != '') ? situacaoDaMudanca : 'positivo'
                        }
    
                        if (data != dataDaEdicao) {
    
                            deletarHora();
    
                            const requisicao = await fetch (`${Global}usuario/lancarHora`, {
                                method : 'POST',
                                credentials : 'include',
                                headers : {
                                    'Content-Type' : 'application/json',
                                    'Cookies' : decodeURIComponent(document.cookie)
                                },
                                body : JSON.stringify(dadosEnviados)
                            });
                
                            resposta1 = await requisicao.json();
    
    
                            console.log('Indo para o banco', bancoAtual, situacaoBancoHoras); 
                        } else {
                            const requisicao = await fetch (`${Global}usuario/editarHorario`, {
                                method : 'POST',
                                credentials : 'include',
                                headers : {
                                    'Content-Type' : 'application/json',
                                    'Cookies' : decodeURIComponent(document.cookie)
                                },
                                body : JSON.stringify(dadosEnviados)
                            });
                
                            resposta1 = await requisicao.json();
        
        
                            console.log('Indo para o banco', bancoAtual, situacaoBancoHoras);
    
                        }
                        
    
                        const requisicao2 = await fetch (`${Global}usuario/lancarBanco`, {
                            method : 'POST',
                            credentials : 'include',
                            headers : {
                                'Content-Type' : 'application/json',
                                'Cookies' : decodeURIComponent(document.cookie)
                            },
                            body : JSON.stringify({ bancoAtual, situacaoBancoHoras, tempoDaMudanca, situacaoDaMudanca  })
                        });
    
    
                        const resposta2 = await requisicao2.json();
                        
                        if (resposta1.status == 'success' && resposta2.status == 'success') {
                            sessionStorage.setItem('status', resposta1.status);
                            sessionStorage.setItem('mensagem', resposta1.msg);
                            window.location.href = '../resumoHoras/resumoHoras.html';
                        } else {
                            alertas();
                        }
    
                    } catch (error) {
                        console.log(error)
                    } 
                         
                } else {
                    alertaPageAtual('error', 'Preencha todos os campos')
                }
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

                return { 'horas' : resposta['banco'][0]['horasAcumuladas'], 'situacao' : resposta['banco'][0]['situacaoBanco'], 'tempoDaMudanca' : resposta['banco'][0]['tempoDaMudanca'], 'situacaoDaMudanca' : resposta['banco'][0]['situacaoDaMudanca'] } ;
        }

        async function removerSegundos () {
            const horario = await puxarBanco();

            const hora = horario['horas'].toString();

            // Divide a string em um array usando ":" como separador
            const partes = hora.split(":");

            // Remove o último elemento do array (os segundos)
            partes.pop();

            // Junta o array novamente usando ":" como separador
            const horaSemSegundos = partes.join(":");

            return { 'hora' : horaSemSegundos, 'situacao' : horario.situacao, 'tempoDaMudanca' : horario.tempoDaMudanca, 'situacaoDaMudanca' : horario.situacaoDaMudanca };

        }


        document.getElementById('lancarHora').addEventListener('click', () => {
            lancarHoras('', false);
        })