import { alertas, alertaPageAtual } from '../sweetalert.js';
import { sair, verificarLogoff, verificarCargoLogado } from '../funcoes.js';
import Global from '../../global.js';
import apiPython from '../../global.js';

document.getElementById('sair').addEventListener('click', async () => {
    sair();
})

// window.addEventListener('load', async () => {

//     verificarLogoff();

//     const cargo = await verificarCargoLogado();

//     if (cargo == 'administrador') {
//         const botaoCadastro = document.getElementById('botaoCad');

//         botaoCadastro.style.display = 'block';
//     }


//     alertas();
// })


// document.getElementById('data').addEventListener('change', async () => {
//     validaData();
// })

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

async function validaData() {
    // Obter a data selecionada pelo usuário:
    const dataSelecionada = document.getElementById("data").value;

    const requisicao = await fetch(`${Global}usuario/pegarDatas`, {
        method: 'POST',
        headers: {
            'Cookies': decodeURIComponent(document.cookie)
        }
    });

    const resposta = await requisicao.json();

    const datasBloqueadas = resposta.datas;

    const inputData = document.getElementById('data');
    const label = document.getElementById('labelDataInvalida');

    var dataInvalida = false;

    for (var i = 0; i < datasBloqueadas.length; i++) {

        // Verificar se a data selecionada está no array de datas bloqueadas:
        if (dataSelecionada == datasBloqueadas[i].data.slice(0, 10)) {
            // Exibir uma mensagem de erro (opcional):
            // alertaPageAtual('warning', 'Data já possui lançamento')
            dataInvalida = true;
            // Limpar o input (opcional):
            document.getElementById("data").value = "";
        } else {

        }
    }

    if (dataInvalida) {
        label.style.display = 'block';
        label.style.color = 'red';
        inputData.style.boxShadow = '0px 0px 10px 5px red';
    } else {
        label.style.display = 'none';
        label.style.color = 'red';
        inputData.style.boxShadow = '0px 0px 0px 0px';
    }
}

async function puxarBanco() {
    // Puxar banco de horas

    const requisicao = await fetch(`${Global}usuario/buscarBanco`, {
        method: 'POST',
        headers: {
            'Cookies': decodeURIComponent(document.cookie)
        }
    });

    const resposta = await requisicao.json();

    return { 'horas': resposta['banco'][0]['horasAcumuladas'], 'situacao': resposta['banco'][0]['situacaoBanco'], 'tempoDaMudanca': resposta['banco'][0]['tempoDaMudanca'], 'situacaoDaMudanca': resposta['banco'][0]['situacaoDaMudanca'] };
}

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

async function somarHorarios(categoria, banco, horarioParaSubtrair) {
    // Separa as horas e minutos de cada horário

    var categoriaParcial = categoria;

    var [bancoHora, bancoMinuto] = banco.split(':').map(Number);
    var [hora1, minuto1] = horarioParaSubtrair.split(':').map(Number);

    minuto1 = minuto1 + (hora1 * 60);

    for (var x = 0; x < minuto1; x++) {


        if (categoriaParcial == 'negativo') {
            if ((bancoHora < 0 && bancoMinuto > 0) || (bancoHora == 0 && bancoMinuto > 0)) {
                bancoMinuto -= 1

            } else if (bancoHora < 0 && bancoMinuto == 0) {
                bancoHora += 1;
                bancoMinuto = 59;
            } else if (bancoHora == 0 && bancoMinuto == 0) {
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

    var horaFormatada = (categoriaParcial == 'positivo') ? `${bancoHora}` : `-${bancoHora}`;

    if (horaFormatada.includes('--')) {
        horaFormatada = horaFormatada.replace('--', '-');
    }

    const horaParaEnviarAoBanco = `${horaFormatada}:${bancoMinuto}`;

    return { 'situacao': categoriaParcial, 'banco': horaParaEnviarAoBanco };

}

async function subtrairHorarios(categoria, banco, horarioParaSubtrair) {
    // Separa as horas e minutos de cada horário

    var categoriaParcial = categoria;

    var [bancoHora, bancoMinuto] = banco.split(':').map(Number);
    var [hora1, minuto1] = horarioParaSubtrair.split(':').map(Number);

    minuto1 = minuto1 + (hora1 * 60);

    for (var x = 0; x < minuto1; x++) {

        if (categoriaParcial == 'positivo') {
            if ((bancoHora > 0 && bancoMinuto > 0) || (bancoHora == 0 && bancoMinuto > 0)) {
                bancoMinuto -= 1

            } else if (bancoHora > 0 && bancoMinuto == 0) {
                bancoHora -= 1;
                bancoMinuto = 59;

            } else if (bancoHora == 0 && bancoMinuto == 0) {
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
    var horaFormatada = (categoriaParcial == 'positivo') ? `${bancoHora}` : `-${bancoHora}`;

    if (horaFormatada.includes('--')) {
        horaFormatada = horaFormatada.replace('--', '-');
    }

    const horaParaEnviarAoBanco = `${horaFormatada}:${bancoMinuto}`;

    return { 'situacao': categoriaParcial, 'banco': horaParaEnviarAoBanco };

}

// Calcula quanto do horário do almoço faltou completar
function tempoRestante(horarioUsuario) {
    // Separa as horas e minutos do horário do usuário
    const [horasUsuario, minutosUsuario] = horarioUsuario.split(':').map(Number);

    // Define o horário alvo (1:30)
    const horasAlvo = 1;
    const minutosAlvo = 30;

    // Calcula a diferença em minutos
    let diferencaMinutos = (horasAlvo * 60 + minutosAlvo) - (horasUsuario * 60 + minutosUsuario);

    // Se a diferença for negativa, significa que o horário alvo já passou
    if (diferencaMinutos < 0) {
        diferencaMinutos += 24 * 60; // Adiciona 24 horas (1440 minutos)
    }

    // Calcula horas e minutos restantes
    const horasRestantes = Math.floor(diferencaMinutos / 60);
    const minutosRestantes = diferencaMinutos % 60;

    // Formata a saída
    return `${horasRestantes}:${minutosRestantes.toString().padStart(2, '0')}`;
}

async function calculoDeHoras(h1, h2) {

    const dados = {
        hora1: h1,
        hora2: h2
    };

    const requisicao = await fetch(`http://localhost:5001/calculos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    });

    const resposta = await requisicao.json();

    if (resposta.status == 'success') {
        window.location.href = '../resumoHoras/resumoHoras.html';
    } else {
        alertas();
    }

}

async function lancarHoras(diaDeBanco) {

    const botaoLancar = document.getElementById('lancarHora');

    const data = document.getElementById('data').value;
    const entrada = document.getElementById('horaEntrada').value;
    const saida = document.getElementById('horaSaida').value;
    const motivo = document.getElementById('motivoHorario').value;
    const descricao = document.getElementById('motivo').value;
    
    const checkbox2 = document.getElementById('compensacao');

    const finalDeSemana = verificarDiaSemana(data);

    // flags para saber se vai ter banco de horas para adicionar ao banco

    // flag para saber se a pessoa passou das 9 horas trabalhadas no dia
    var passouHorarioNormal = false;

    // flag para saber se a pessoa fez uma carga horária menor a exigida
    var faltouCargaHoraria = false;

    var almocoFeito = true;

    var tempoDaMudanca = '';

    var situacaoDaMudanca = '';

    var zerarHoraDoAlmoco = '';

    // carga horária em string
    const cargaDiaria = await subtrairHorarios('positivo', saida, entrada);

    // separando as horas dos minutos e transformando cada um em number
    const [horas, minutos] = cargaDiaria['banco'].split(':').map(Number);

    

    if(motivo == '04 - Atestado Médico') {

        console.log(data);

        if (data != '') {

            const dadosEnviados = {
                data,
                entrada : (entrada == '') ? '00:00' : entrada,
                saida : (saida == '') ? '00:00' : saida,
                cargaDiaria: '00:00',
                motivo,
                descricao : (descricao == '') ? 'Ida ao médico' : descricao,
                banco: (diaDeBanco) ? 'true' : '',
                almocoFeito: almocoFeito,
                tempoDaMudanca : (tempoDaMudanca != '') ? tempoDaMudanca : '00:00',
                situacaoDaMudanca : (situacaoDaMudanca != '') ? situacaoDaMudanca : 'positivo'
            }

            const requisicaoAtestado = await fetch(`${Global}usuario/lancarHora`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookies': decodeURIComponent(document.cookie)
                },
                body: JSON.stringify(dadosEnviados)
            });

            const respostaAtestado = await requisicaoAtestado.json();

            if (respostaAtestado.status == 'success') {
                window.location.href = '../resumoHoras/resumoHoras.html';
            } else {
                alertas();
            }

        } else {
            alertaPageAtual('error', 'Preencha a data do atestado');
        }



    } else {

        if (checkbox2.checked) {
            if (horas > 9 || (horas == 9 && minutos > 15)) {
                passouHorarioNormal = true;

            } else if (horas < 9 || horas == 9 && minutos < 15) {
                faltouCargaHoraria = true;
            }


            if (data != '' && entrada != '' && saida != '' && motivo != '#' && descricao != '') {

                const puxarBancoDeHoras = await removerSegundos();

                var bancoAtual = puxarBancoDeHoras.hora;

                var situacaoBancoHoras = puxarBancoDeHoras.situacao;

                try {

                    if (finalDeSemana) {
                        const horaParaBanco = await somarHorarios(situacaoBancoHoras, bancoAtual, cargaDiaria['banco']);

                        bancoAtual = horaParaBanco.banco;

                        situacaoBancoHoras = horaParaBanco.situacao;

                        tempoDaMudanca = cargaDiaria['banco'];

                        situacaoDaMudanca = 'positivo';

                        console.log('horas do final de semana', horaParaBanco);

                    } else {

                        if (passouHorarioNormal) {
                            var [horaCarga, minutoCarga] = cargaDiaria['banco'].split(':').map(Number);

                            var situacaoCargaHoraria = ((horaCarga > 9) || (horaCarga == 9 && minutoCarga > 0)) ? 'negativo' : 'positivo';

                            // Pega as horas escedidas na carga horária.

                            
                            // const horaAmais = await subtrairHorarios('positivo', cargaDiaria.banco, '09:15');

                            const horaAmais = await calculoDeHoras(cargaDiaria.banco, '09:15'); 

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


                        // if (faltouCargaHoraria) {

                        //     if (diaDeBanco == true) {


                        //         horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, '07:45');

                        //         bancoAtual = horaParaBanco.banco;

                        //         situacaoBancoHoras = horaParaBanco.situacao;

                        //         tempoDaMudanca = '07:45';

                        //         situacaoDaMudanca = 'negativo';

                        //         zerarHoraDoAlmoco = true;


                        //     } else {

                        //         var tempoFaltandoCargaHorariaNormal;

                        //         almocoFeito = true;

                        //         tempoFaltandoCargaHorariaNormal = await calcularDiferencaHorarios(cargaDiaria['banco'], '9:15');

                        //         var horaParaBanco;

                        //         horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, tempoFaltandoCargaHorariaNormal);

                        //         bancoAtual = horaParaBanco.banco;

                        //         situacaoBancoHoras = horaParaBanco.situacao;

                        //         tempoDaMudanca = tempoFaltandoCargaHorariaNormal;

                        //         situacaoDaMudanca = 'negativo';


                        //     }
                        // }



                    }


                    // var cargaParaBanco = cargaDiaria['banco'];

                    // const dadosEnviados = {
                    //     data,
                    //     entrada,
                    //     saida,
                    //     cargaDiaria: cargaParaBanco,
                    //     motivo,
                    //     descricao,
                    //     banco: (diaDeBanco) ? 'true' : '',
                    //     almocoFeito: (zerarHoraDoAlmoco) ? 'banco' :  almocoFeito,
                    //     tempoDaMudanca : (tempoDaMudanca != '') ? tempoDaMudanca : '00:00',
                    //     situacaoDaMudanca : (situacaoDaMudanca != '') ? situacaoDaMudanca : 'positivo'
                    // }


                    // const requisicao = await fetch(`${Global}usuario/lancarHora`, {
                    //     method: 'POST',
                    //     credentials: 'include',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Cookies': decodeURIComponent(document.cookie)
                    //     },
                    //     body: JSON.stringify(dadosEnviados)
                    // });

                    // const resposta = await requisicao.json();

                    // console.log('testanto aqui', bancoAtual, situacaoBancoHoras, tempoDaMudanca, situacaoDaMudanca)

                    // const requisicao2 = await fetch(`${Global}usuario/lancarBanco`, {
                    //     method: 'POST',
                    //     credentials: 'include',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Cookies': decodeURIComponent(document.cookie)
                    //     },
                    //     body: JSON.stringify({ bancoAtual, situacaoBancoHoras, tempoDaMudanca, situacaoDaMudanca })
                    // });


                    // const resposta2 = await requisicao2.json();


                    // sessionStorage.setItem('status', resposta.status);
                    // sessionStorage.setItem('mensagem', resposta.msg);

                    // if (resposta.status == 'success' && resposta2.status == 'success') {
                    //     window.location.href = '../resumoHoras/resumoHoras.html';
                    // } else {
                    //     alertas();
                    //     botaoLancar.setAttribute('disabled', 'false');
                    // }

                } catch (error) {
                    console.log(error);
                    botaoLancar.setAttribute('disabled', 'false');
                }

            } else {
                alertaPageAtual('error', 'Preencha todos os campos');
                botaoLancar.setAttribute('disabled', 'false');
            }

        } else {
            
            if (horas > 9 || (horas === 9 && minutos > 0)) {
                passouHorarioNormal = true;

            } else if (horas < 9) {
                faltouCargaHoraria = true;
            }


            if (data != '' && entrada != '' && saida != '' && motivo != '#' && descricao != '') {

                const puxarBancoDeHoras = await removerSegundos();

                var bancoAtual = puxarBancoDeHoras.hora;

                var situacaoBancoHoras = puxarBancoDeHoras.situacao;

                try {

                    if (finalDeSemana) {
                        const horaParaBanco = await somarHorarios(situacaoBancoHoras, bancoAtual, cargaDiaria['banco']);

                        bancoAtual = horaParaBanco.banco;

                        situacaoBancoHoras = horaParaBanco.situacao;

                        tempoDaMudanca = cargaDiaria['banco'];

                        situacaoDaMudanca = 'positivo';

                        console.log('horas do final de semana', horaParaBanco);

                    } else {

                        if (passouHorarioNormal) {
                            var [horaCarga, minutoCarga] = cargaDiaria['banco'].split(':').map(Number);

                            var situacaoCargaHoraria = ((horaCarga > 9) || (horaCarga == 9 && minutoCarga > 0)) ? 'negativo' : 'positivo';
                            // Pega as horas escedidas na carga horária.
                            const horaAmais = await subtrairHorarios('positivo', cargaDiaria.banco, '09:00');

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


                                horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, '07:30');

                                bancoAtual = horaParaBanco.banco;

                                situacaoBancoHoras = horaParaBanco.situacao;

                                tempoDaMudanca = '07:30';

                                situacaoDaMudanca = 'negativo';

                                zerarHoraDoAlmoco = true;


                            } else {

                                var tempoFaltandoCargaHorariaNormal;

                                almocoFeito = true;

                                tempoFaltandoCargaHorariaNormal = await calcularDiferencaHorarios(cargaDiaria['banco'], '9:00');

                                var horaParaBanco;

                                horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, tempoFaltandoCargaHorariaNormal);

                                bancoAtual = horaParaBanco.banco;

                                situacaoBancoHoras = horaParaBanco.situacao;

                                tempoDaMudanca = tempoFaltandoCargaHorariaNormal;

                                situacaoDaMudanca = 'negativo';

                                // } else {

                                //     almocoFeito = false;

                                //     tempoFaltandoCargaHorariaNormal = await calcularDiferencaHorarios(cargaDiaria['banco'], '9:00');

                                //     if (tempoFaltandoCargaHorariaNormal > '00:00') {

                                //         var horaParaBanco;

                                //         horaParaBanco = await subtrairHorarios(situacaoBancoHoras, bancoAtual, tempoFaltandoCargaHorariaNormal);

                                //         bancoAtual = horaParaBanco.banco;

                                //         situacaoBancoHoras = horaParaBanco.situacao;

                                //         tempoDaMudanca = tempoFaltandoCargaHorariaNormal;

                                //         situacaoDaMudanca = 'negativo';
                                //     }
                                // }

                            }
                        }



                    }


                    // var cargaParaBanco = cargaDiaria['banco'];

                    // const dadosEnviados = {
                    //     data,
                    //     entrada,
                    //     saida,
                    //     cargaDiaria: cargaParaBanco,
                    //     motivo,
                    //     descricao,
                    //     banco: (diaDeBanco) ? 'true' : '',
                    //     almocoFeito: (zerarHoraDoAlmoco) ? 'banco' :  almocoFeito,
                    //     tempoDaMudanca : (tempoDaMudanca != '') ? tempoDaMudanca : '00:00',
                    //     situacaoDaMudanca : (situacaoDaMudanca != '') ? situacaoDaMudanca : '00:00'
                    // }


                    // const requisicao = await fetch(`${Global}usuario/lancarHora`, {
                    //     method: 'POST',
                    //     credentials: 'include',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Cookies': decodeURIComponent(document.cookie)
                    //     },
                    //     body: JSON.stringify(dadosEnviados)
                    // });

                    // const resposta = await requisicao.json();

                    // console.log('testanto aqui', bancoAtual, situacaoBancoHoras, tempoDaMudanca, situacaoDaMudanca)

                    // const requisicao2 = await fetch(`${Global}usuario/lancarBanco`, {
                    //     method: 'POST',
                    //     credentials: 'include',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Cookies': decodeURIComponent(document.cookie)
                    //     },
                    //     body: JSON.stringify({ bancoAtual, situacaoBancoHoras, tempoDaMudanca, situacaoDaMudanca })
                    // });


                    // const resposta2 = await requisicao2.json();


                    // sessionStorage.setItem('status', resposta.status);
                    // sessionStorage.setItem('mensagem', resposta.msg);

                    // if (resposta.status == 'success' && resposta2.status == 'success') {
                    //     // window.location.href = '../resumoHoras/resumoHoras.html';
                    // } else {
                    //     alertas();
                    // }

                } catch (error) {
                    console.log(error);
                }

            } else {
                alertaPageAtual('error', 'Preencha todos os campos');
            }
        }
    }


}

async function removerSegundos() {
    const horario = await puxarBanco();

    const hora = horario['horas'].toString();

    // Divide a string em um array usando ":" como separador
    const partes = hora.split(":");

    // Remove o último elemento do array (os segundos)
    partes.pop();

    // Junta o array novamente usando ":" como separador
    const horaSemSegundos = partes.join(":");

    return { 'hora': horaSemSegundos, 'situacao': horario.situacao, 'tempoDaMudanca': horario.tempoDaMudanca, 'situacaoDaMudanca' : horario.situacaoDaMudanca };

}

document.getElementById('lancarHora').addEventListener('click', () => {
    lancarHoras(false);
});

document.getElementById('diaDeBanco').addEventListener('click', async () => {
    document.getElementById('horaEntrada').value = '00:00';
    document.getElementById('horaSaida').value = '00:00';
    document.getElementById('motivoHorario').value = '01 - Motivo Particular';
    document.getElementById('motivo').value = 'Utilizando banco de horas';


    lancarHoras(true);

})