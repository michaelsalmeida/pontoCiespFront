import { alertas, alertaPageAtual } from '../sweetalert.js';

        import { sair, verificarLogoff } from '../funcoes.js';

        window.addEventListener('load', async () => {

            verificarLogoff();

            const cargo = await verificarCargoLogado();

            console.log(cargo)

            if (cargo == 'administrador') {
                const botaoCadastro = document.getElementById('botaoCad');

                botaoCadastro.style.display = 'block';
            }

            alertas();
        })

        document.getElementById('sair').addEventListener('click', async () => {
            sair();
        })

        function teste () {
            const tipo = document.getElementById('cargo').value;
            console.log(tipo)
        }

        async function verificarSenhaMestre (senha) {
            const requisicao = await fetch (`https://pontociespapi.onrender.com/usuario/verificarSenhaMestre`, {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({ senha }) 
                });
    
            const resposta = await requisicao.json();

            console.log(resposta);

            if ( resposta.status == 'success') {
                entrar();
            } else {
                Swal.fire({
                    title: "Senha incorreta",
                    showClass: {
                        popup: `
                        animate__animated
                        animate__fadeInUp
                        animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                        animate__animated
                        animate__fadeOutDown
                        animate__faster
                        `
                    }
                });
            }
        }

        async function verificarCargoLogado () {
            const requisicao = await fetch ('https://pontociespapi.onrender.com/usuario/verificarCargoLogado', {
                        method : 'POST',
                        headers : {
                            'Content-Type':'application/json',
                            'Cookies' : decodeURIComponent(document.cookie)
                        },
                    })
        
            const resposta = await requisicao.json();

            return resposta.tipo;
        }

        async function tipoFuncionario () {
            const tipo = document.getElementById('cargo').value;

            const cargoCerto = await verificarCargoLogado();
            
            if (cargoCerto == 'administrador') {
                if (tipo == 'funcionario') {
                    entrar();
                } else {

                        const { value: password } = await Swal.fire({
                            title: "Cadastro de um novo Administrador",
                            input: "password",
                            inputLabel: "Digite a senha mestre",
                            inputPlaceholder: "Enter your password",
                            inputAttributes: {
                                maxlength: "10",
                                autocapitalize: "off",
                                autocorrect: "off"
                            }
                        });
                        if (password) {
                            verificarSenhaMestre(password);
                        }
                        
                    }
            } else {
                alertaPageAtual('error', 'Cadastro só são feitos por administradores');
            }
        }

        async function entrar () {
            const registro = document.getElementById('registro').value;
            const nome = document.getElementById('nome').value;
            const sobrenome = document.getElementById('sobrenome').value;
            const email = document.getElementById('email').value;
            const tipo = document.getElementById('cargo').value;

            const dadosEnviados = {
                registro : registro,
                nome : nome,
                sobrenome : sobrenome,
                email : email, 
                tipo : tipo
            };

            console.log(dadosEnviados);

            const requisicao = await fetch (`https://pontociespapi.onrender.com/usuario/cadastro`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(dadosEnviados) 
            });

            const resposta = await requisicao.json();
            
            if (resposta.status == 'success') {
                sessionStorage.setItem('status', resposta.status);
                sessionStorage.setItem('mensagem', resposta.msg);

                window.location.href = '../resumoHoras/resumoHoras.html';
                
            } else {
                alertaPageAtual(resposta.status, resposta.msg);
            }
        }

        document.getElementById('cadastrar').addEventListener('click', () => {
            tipoFuncionario();
        })

        document.getElementById('cargo').addEventListener('change', () => {
            teste();
        })

        function fechaModal() {
            document.getElementById('modal').setAttribute('style', 'none');
        }

        document.getElementById('fechaModal').addEventListener('click', () => {
            fechaModal();
        })