const senha = document.getElementById("d2");
const toggle = document.getElementById("toggleSenha");

toggle.addEventListener("click", () => {
  if (senha.type === "password") {
    senha.type = "text";
    toggle.src = "./imagens/hide.png"; // mostra a senha (ícone de olho aberto)
  } else {
    senha.type = "password";
    toggle.src = "./imagens/view.png"; // esconde a senha (ícone de olho fechado)
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
const entrar = document.querySelector('#entrar');

entrar.addEventListener('click', async function (event) {
  event.preventDefault();

  const email = document.querySelector('#d1').value;
  const senha = document.querySelector('#d2').value;

  if (email === "" || senha === "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  try {
    const resposta = await fetch(`http://192.168.1.27:3000/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const usuario = await resposta.json();
    console.log(usuario)
    if (resposta.status == 200) {
      // salva os dados do usuário
      localStorage.setItem("idUsuario", usuario.id_usuario);
      localStorage.setItem("nome", usuario.nome_usuario);
      localStorage.setItem("email", usuario.email);
      localStorage.setItem("descricao", usuario.descricao || "");
      
      // redireciona conforme a função
      if (usuario.funcao === "admin") {
        window.location.href = "../homepage/index.html";
      } else {
        window.location.href = "../homepage/index.html";
      }
    } else {
      alert("Usuário ou senha incorretos!");
    }

  } catch (erro) {
    console.error("Erro no login:", erro);
    alert("Erro ao tentar fazer login");
  }
});