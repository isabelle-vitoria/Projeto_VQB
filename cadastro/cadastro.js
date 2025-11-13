// campo senha
const senha = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

// campo confirmar senha
const confirmarSenha = document.getElementById("confirmarSenha");
const toggleConfirmar = document.querySelector(".toggleConfirmar");

// olho da senha
toggleSenha.addEventListener("click", () => {
  if (senha.type === "password") {
    senha.type = "text";
    toggleSenha.src = "./imagens/hide.png";
  } else {
    senha.type = "password";
    toggleSenha.src = "./imagens/view.png";
  }
});

// olho do confirmar senha
toggleConfirmar.addEventListener("click", () => {
  if (confirmarSenha.type === "password") {
    confirmarSenha.type = "text";
    toggleConfirmar.src = "./imagens/hide.png";
  } else {
    confirmarSenha.type = "password";
    toggleConfirmar.src = "./imagens/view.png";
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////

const entrar = document.querySelector('#entrar');

entrar.addEventListener('click', async function (event) {
  event.preventDefault(); // impede recarregar a página

  const nome = document.querySelector('#nome').value;
  const email = document.querySelector('#email').value;
  const senha = document.querySelector('#senha').value;
  const confisenha = document.querySelector('#confirmarSenha').value;

  if (nome === "" || email === "" || senha === "" || confisenha === "") {
    alert("Por favor, preencha todos os campos");
    console.log("preencha");
    return;
  }
 
  if (senha !== confisenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const resposta = await fetch("https://back-vqb-2.onrender.com/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        senha: senha,
        email: email
      })
    });

    if (resposta.status === 201) {
      const dados = await resposta.json();
      alert("Cadastrado com sucesso!");

      console.log("Usuário cadastrado:", dados);

      // salva o ID e nome do usuário no localStorage
      localStorage.setItem("idUsuario", dados.id);
      localStorage.setItem("nomeUsuario", dados.nome);
      localStorage.setItem("emailUsuario", dados.email);

      // redireciona para a página de perfil
      window.location.href = "../login/login.html";
    }

      else if(resposta.status === 400){
        alert("Senha fraca demais! Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial")
    }
      else {
      alert("Sua senha está fraca demais!");
      console.log("Erro no cadastro");
    }
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    alert("Erro ao conectar com o servidor.");
  }
});