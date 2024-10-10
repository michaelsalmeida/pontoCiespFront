import { alertaPageAtual } from "../pages/sweetalert.js";

async function sair () {

    console.log('Entrei no logoff')
    const requisicao = await fetch ('https://pontociespapi.onrender.com/usuario/logoff', {
        method : 'POST',
        credentials : 'include',
        headers : {
            'content-type' : 'application/json',
            'Cookies' : decodeURIComponent(document.cookie)
        }
    })

    const resposta = await requisicao.json();

    console.log(resposta);

    if (resposta.status == 'success') {
        const d = new Date();
        d.setTime(d.getTime() + (3*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        console.log(resposta);

        document.cookie = `usuario=${resposta.cookie}; expires=${expires}; path=/;`;

        window.location.href = '../login/index.html';

    } else {
        alertaPageAtual(resposta.status, resposta.msg);
    }

}

async function verificarLogoff () {
    const requisicao = await fetch ('https://pontociespapi.onrender.com/usuario/verificarLogoff', {
        method : 'POST',
        credentials : 'include',
        headers : {
            'content-type' : 'application/json',
            'Cookies' : decodeURIComponent(document.cookie)
        }
    })

    const resposta = await requisicao.json();

    console.log(resposta);

    if (resposta.logoff == 1) {
        sessionStorage.setItem('status', 'error');
        sessionStorage.setItem('mensagem', 'Realize o login novamente')

        window.location.href = '../login/index.html';
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

export { sair, verificarLogoff, verificarCargoLogado };
