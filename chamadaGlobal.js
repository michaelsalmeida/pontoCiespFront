var password = '';

export function setPassword(newPassword) {
    console.log(`nova senha ${newPassword}`)
    password = newPassword; // Função para modificar a variável
}

export function getPassword() {
    return password; // Função para acessar o valor da variável
}
