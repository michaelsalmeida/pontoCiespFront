import { alertas, alertaPageAtual } from './pages/sweetalert.js';
        import Global from './global.js';
        
        window.addEventListener('load', async () => {
            alertas();
        })

        document.getElementById('registro').addEventListener('blur', async () => {
            verificarPrimeiroAcesso();
        })

        async function verificarPrimeiroAcesso () {
            console.log('entrei');
            
            let registro = document.getElementById('registro').value;

            if (registro != '') {
                const requisicao = await fetch (`${Global}usuario/verificarPrimeiroRegistro`, {
                    method : 'POST',
                    credentials : 'include',
                    headers : {
                        'content-type' : 'application/json',
                        'Cookies' : decodeURIComponent(document.cookie)
                    },
                    body : JSON.stringify({ registro })
                })
    
                const resposta = await requisicao.json();
    
                console.log(resposta);
    
                if (resposta.senhaNoBanco.senha == 'Ciesp@sul') {
                    sessionStorage.setItem('status', 'info');
                    sessionStorage.setItem('mensagem', 'Primeiro acesso, realize o cadastro da sua senha');
                    localStorage.setItem('registro', registro);
    
                    window.location.href = './pages/primeiroLogin/primeiroLogin.html';
                }

            }


        }

        async function Logar () {
            let registro = document.getElementById('registro').value;
            let senha = document.getElementById('senha').value;

            const requisicao = await fetch (`http://localhost:3000/usuario/login`, {
                method : 'POST',
                credentials : 'include',
                headers : {
                    'content-type' : 'application/json',
                    'Cookies' : decodeURIComponent(document.cookie)
                },
                body : JSON.stringify({ registro, senha })
            })

            const resposta = await requisicao.json();

            console.log(resposta);

            if (resposta.status == 'success') {
                sessionStorage.setItem('nome', resposta.nome);
                
                const d = new Date();
                d.setTime(d.getTime() + (3*60*60*1000));
                let expires = "expires="+ d.toUTCString();
                console.log(resposta);

                document.cookie = `usuario=${resposta.cookie}; expires=${expires}; path=/;`;

                sessionStorage.setItem('modo', 'dark');

                window.location.href = './pages/resumoHoras/resumoHoras.html';

            } else {
                alertaPageAtual(resposta.status, resposta.msg);
            }
        }
        

        document.getElementById('entrar').addEventListener('click', () => { 
            Logar();
        })

        document.addEventListener("keydown", function(event) {
            // Verificando se a tecla pressionada é ENTER
            if (event.key === "Enter") {
                event.preventDefault(); // Evita o envio do formulário, se houver
                document.getElementById("entrar").click(); // Ativa o botão
            }
        });
