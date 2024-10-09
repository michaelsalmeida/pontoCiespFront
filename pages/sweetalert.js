export async function alertas () {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      if(sessionStorage.getItem('status') && sessionStorage.getItem('mensagem')){
        const status = sessionStorage.getItem('status');
        const mensagem = sessionStorage.getItem('mensagem');

        setTimeout(removerSessionStorage, 1000);
        
        Toast.fire({
            icon: status,
            title: mensagem
        })
        
      }
} 


function removerSessionStorage(){
    sessionStorage.removeItem('status');
    sessionStorage.removeItem('mensagem');
}


export async function alertaPageAtual (status, mensagem) {
  sessionStorage.setItem('status', status);
  sessionStorage.setItem('mensagem', mensagem);

  alertas();
}