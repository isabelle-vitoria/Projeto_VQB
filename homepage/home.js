const menuBtn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");

    menuBtn.addEventListener("click", () => {
      menu.classList.toggle("ativo");
    });

    const id = localStorage.getItem('idUsuario')
    
    const perfil = document.querySelector('.referencia')

    perfil.addEventListener('click', () => {
        (id) ?
        perfil.href = "../perfil/perfil.html" : perfil.href = "../login/login.html"
    })

  document.querySelector(".btnLogout")?.addEventListener("click", () => {
  // Confirma se o usuário quer sair
  const confirmar = confirm("Deseja realmente sair?");
  if (confirmar) {
    // Limpa todo o localStorage
    localStorage.clear();

    // Redireciona para a tela de login
    window.location.href = "../login/login.html";
  }
});