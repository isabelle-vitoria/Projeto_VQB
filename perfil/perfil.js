document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o ID do usuário existe no localStorage
  const userId = localStorage.getItem("idUsuario");

  if (!userId) {
    alert("Você precisa estar logado para acessar esta página.");
    // Redireciona para a tela de login
    window.location.href = "../login/login.html";
    return; // impede execução do resto da página
  }

  // Se o ID existir, a página continua normalmente
  console.log("Usuário logado, ID:", userId);
});

document.getElementById("btnLogout")?.addEventListener("click", () => {
  // Confirma se o usuário quer sair
  const confirmar = confirm("Deseja realmente sair?");
  if (confirmar) {
    // Limpa todo o localStorage
    localStorage.clear();

    // Redireciona para a tela de login
    window.location.href = "../login/login.html";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  // =================== DADOS DO USUÁRIO ===================
  const idUsuario = localStorage.getItem("idUsuario");
  const nomeLocal = localStorage.getItem("nome");
  const emailLocal = localStorage.getItem("email");
  const descricaoLocal = localStorage.getItem("descricao");
  const fotoLocal = localStorage.getItem("fotoPerfil");

  const perfilDiv = document.getElementById("profile");

  console.log(idUsuario)

  // Busca dados do usuário no servidor
  try {
    const resposta = await fetch(`https://back-vqb-2.onrender.com/perfil/${idUsuario}`);
    if (!resposta.ok) throw new Error("Erro ao buscar usuário");
    const dados = await resposta.json();
    console.log(dados)
    const nomeUsuario = dados.nome_usuario || dados.nome || nomeLocal;
    const emailUsuario = dados.email || emailLocal;
    const descricaoUsuario = dados.biografia || descricaoLocal || "Sem bio ainda";
    const fotoPadrao = "https://cdn-icons-png.flaticon.com/512/6596/6596121.png";
    const fotoUsuario =
    (dados.foto_usuario && dados.foto_usuario.trim() !== "" ? dados.foto_usuario : null) ||
    (fotoLocal && fotoLocal.trim() !== "" ? fotoLocal : null) ||
    fotoPadrao;
    localStorage.setItem("fotoPerfil", fotoUsuario);

    // Atualiza localStorage
    localStorage.setItem("nome", nomeUsuario);
    localStorage.setItem("email", emailUsuario);
    localStorage.setItem("descricao", descricaoUsuario);
    localStorage.setItem("fotoPerfil", fotoUsuario);

    renderizarPerfil(perfilDiv, nomeUsuario, emailUsuario, descricaoUsuario, fotoUsuario);
  } catch (erro) {
    console.log("Erro ao buscar da API, usando localStorage:", erro);
    renderizarPerfil(
      perfilDiv,
      nomeLocal || 'Nome do usuário',
      emailLocal || "email@email.com",
      descricaoLocal || "clique em Editar bio",
      fotoLocal || "../img/avatar.png"
    );
  }

  // =================== CARREGAR LOCAIS ===================
  const container = document.querySelector(".lugares-container");
  await carregarLocaisDoUsuario(container, idUsuario);

  // =================== FUNÇÕES AUXILIARES ===================

  function renderizarPerfil(container, nome, email, descricao, foto) {
    container.innerHTML = `
      <div class="perfil-topo">
        <img src="${foto || "../perfil/imagens/sem-foto.png"}" id="foto-preview" class="avatar" alt="foto de perfil">
        <div class="dados">
          <h2>${nome}</h2>
          <p>${email}</p>
          <p id="bio-text"><i> ${descricao}</i></p>
          <textarea id="bio-input" style="display:none;">${descricao}</textarea>
          <button id="btnEditarBio">Editar Bio</button>
        </div>
      </div>

      <div class="foto-upload">
        <label for="foto">Alterar foto</label>
        <input type="file" id="foto">
      </div>
    `;

    // Editar bio
    const btnEditarBio = document.getElementById("btnEditarBio");
    const bioText = document.getElementById("bio-text");
    const bioInput = document.getElementById("bio-input");

    btnEditarBio.addEventListener("click", async () => {
      if (bioInput.style.display === "none") {
        bioInput.style.display = "block";
        bioText.style.display = "none";
        btnEditarBio.textContent = "Salvar Bio";
      } else {
        const novaBio = bioInput.value;
        console.log(novaBio)
        try {
          const resp = await fetch(`https://back-vqb-2.onrender.com/usuario/descricao/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao: novaBio })
          });
          if (resp.status == 200) {
          
          }
        } catch (err) {
          console.error("Erro ao atualizar bio:", err);
        }
        bioInput.style.display = "none";
        bioText.style.display = "block";
        btnEditarBio.textContent = "Editar Bio";
        localStorage.setItem("descricao", novaBio);
        window.location.reload();

      }
    });

    // Upload de foto
    const inputFoto = document.getElementById("foto");
    inputFoto.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        document.getElementById("foto-preview").src = base64;
        localStorage.setItem("fotoPerfil", base64);
        console.log(idUsuario)
        try {
          await fetch(`https://back-vqb-2.onrender.com/usuario/foto/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto_usuario: base64 })
          });
          alert("Foto atualizada com sucesso!");
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function carregarLocaisDoUsuario(container, idUsuario) {
    try {
      container.innerHTML = "";
      let resposta, locais;

      if (idUsuario == 1) {
        resposta = await fetch(`https://back-vqb-2.onrender.com/locais`);
      } else {
        resposta = await fetch(`https://back-vqb-2.onrender.com/locais/usuario/${idUsuario}`);
      }

      locais = await resposta.json();

      if (locais.length === 0) {
        container.innerHTML = `
          <div class="sem-lugares">
            <p class="titulo">Você ainda não adicionou nenhum lugar!</p>
            <div class="adicionar-lugar" id="btnAdicionar">
              <p>Clique aqui <span class="plus">+</span> para adicionar</p>
            </div>
          </div>
        `;
        document.getElementById("btnAdicionar").addEventListener("click", () => {
          window.location.href = "../inserir/inserir.html";
        });
        return;
      }

      // Renderiza cada local
      locais.forEach((lugar) => {
        const div = document.createElement("div");
        div.classList.add("lugar-card");

        div.innerHTML = `
          <div class="lugar-thumb">
            <img src="${lugar.imagem || "../img/semfoto.png"}" alt="${lugar.nome_local}" class="thumb-img">
          </div>
          <div class="lugar-info">
            <h3>${lugar.nome_local}</h3>
            <p class="categoria">${lugar.categoria}</p>
          </div>
          <div class="acoes">
            <button class="btn-editar">Editar</button>
            <button class="btn-excluir">Excluir</button>
          </div>
        `;

        // Eventos dos botões
        div.querySelector(".btn-editar").addEventListener("click", () => editarLocal(lugar.id_local));
        div.querySelector(".btn-excluir").addEventListener("click", () => excluirLocal(lugar.id_local));

        container.appendChild(div);
      });
    } catch (erro) {
      console.error("Erro ao carregar locais:", erro);
      container.innerHTML = "<p>Erro ao carregar seus locais.</p>";
    }
  }

  // =================== FUNÇÕES GLOBAIS ===================
  async function excluirLocal(idLocal) {
    const confirmar = confirm("Tem certeza que deseja excluir este local?");
    if (!confirmar) return;

    try {
      const resp = await fetch(`https://back-vqb-2.onrender.com/locais/${idLocal}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idUsuario }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.erro || "Erro ao excluir local.");
        return;
      }

      alert("Local excluído com sucesso!");
      carregarLocaisDoUsuario(document.querySelector(".lugares-container"), idUsuario);
    } catch (erro) {
      console.error("Erro ao excluir local:", erro);
      alert("Erro ao excluir local.");
    }
  }

  function editarLocal(idLocal) {
    localStorage.setItem("localParaEditar", idLocal);
    window.location.href = "../inserir/inserir.html";
  }
});

  (function () {
    const btnAdd = document.getElementById("btnAddLocalFloat");
    if (!btnAdd) return;

    btnAdd.addEventListener("click", () => {
      // Garante que não fique com dados antigos de edição
      localStorage.removeItem("localParaEditar");

      // Redireciona para página de inserção limpa
      window.location.href = "../inserir/inserir.html";
    });
  })();

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