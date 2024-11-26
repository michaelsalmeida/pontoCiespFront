import { alertas, alertaPageAtual } from '../sweetalert.js';
        import Global from '../../global.js';
        
        window.addEventListener('load', async () => {
            alertas();
        })

        async function atualizarSenha () {
            let senha = document.getElementById('senha').value;
            let confSenha = document.getElementById('confSenha').value;
            let registro = localStorage.getItem('registro');

            if (senha == confSenha) {

                const requisicao = await fetch (`${Global}usuario/atualizarSenha`, {
                    method : 'POST',
                    credentials : 'include',
                    headers : {
                        'content-type' : 'application/json',
                        'Cookies' : decodeURIComponent(document.cookie)
                    },
                    body : JSON.stringify({ senha, registro })
                })
    
                const resposta = await requisicao.json();
    
                console.log(resposta);
    
                if (resposta.status == 'success') {
                    sessionStorage.setItem('status', 'success');
                    sessionStorage.setItem('mensagem', 'Nova senha cadastrada. Realize o login novamente');

                    localStorage.removeItem('registro');
    
                    window.location.href = '../../index.html';
    
                } else {
                    alertaPageAtual(resposta.status, resposta.msg);
                }
            } else {
                alertaPageAtual('error', 'Senhas não coincidem');
            }

        }
        

        document.getElementById('entrar').addEventListener('click', () => { 
            atualizarSenha();
        })