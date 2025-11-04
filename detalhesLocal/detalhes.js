const params = new URLSearchParams(window.location.search);
const id = params.get("id"); // ID do local na URL
const detalhes = document.getElementById("detalhes");

        // Função simples pra voltar pra página anterior
        document.getElementById("btnVoltar").addEventListener("click", () => {
            window.history.back();
        });

if (id) {
  fetch(`http://192.168.1.27:3000/locais/${id}`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar o lugar");
      return response.json();
    })
    .then(lugar => {
      const horacorreta = formatarHorario(lugar.horario_funcionamento || "—");
      const numCorreto = formatarContato(lugar.contato || "—");

      detalhes.innerHTML = `
        <h1>${lugar.nome_local}</h1>
        <p><strong class="categoria">Categoria:</strong> ${lugar.categoria || "—"}</p>

        <div class="foto" 
             style="background-image: url('${lugar.imagem || ""}');
                    background-size: cover; 
                    background-position: center;">
        </div>

        <section class="info">
          <h2>Descrição:</h2>
          <p>${lugar.descricao || "—"}</p>

          <h2>Horário de funcionamento:</h2>
          <p>${horacorreta}</p>

          <h2>Endereço:</h2>
          <p>${lugar.endereco || "—"}</p>

          <h2>Contato:</h2>
          <p>${numCorreto}</p>
        </section>
      `;

      // salva ID atual no localStorage (usado nos comentários)
      localStorage.setItem("idLocalAtual", id);

      // carrega os comentários do local
      carregarComentarios(id);
    })
    .catch(error => {
      console.error(error);
      detalhes.innerHTML = "<p>Erro ao carregar os detalhes do lugar.</p>";
    });
} else {
  detalhes.innerHTML = "<p>Nenhum ID encontrado.</p>";
}

//FUNÇÕES AUXILIARES

function formatarHorario(horario) {
  if (!horario || horario.length < 9) return horario;
  const inicio = horario.slice(0, 5);
  const fim = horario.slice(5);
  return `${inicio} às ${fim}`;
}

function formatarContato(contato) {
  if (!contato || contato.length < 5) return contato;
  const inicio = contato.slice(0, 2);
  const fim = contato.slice(2);
  return `(${inicio}) ${fim}`;
}


// Carregar comentários
async function carregarComentarios(id_local) {
  try {
    console.log("to aqui"+ id_local)
    const resp = await fetch(`http://192.168.1.27:3000/comentarios/${id_local}`);
    const comentarios = await resp.json();

    const container = document.querySelector("#comentarios");

    comentarios.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("comentario");
      div.innerHTML = `
        <p><strong>${c.nome_usuario}</strong> — ${new Date(c.data_criacao).toLocaleString("pt-BR")}</p>
        <p>${c.texto}</p>
      `;
      // botão excluir (somente se admin ou autor)
      const funcao = localStorage.getItem("funcao");
      const idUsuario = parseInt(localStorage.getItem("idUsuario"));
      if (funcao === "admin" || c.id_usuario === idUsuario) {
        const btn = document.createElement("button");
        btn.textContent = "Excluir";
        btn.classList.add("btnExcluir");
        btn.dataset.id = c.id;
        div.appendChild(btn);
      }

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
  }
}

// Enviar comentário
document.getElementById("form")?.addEventListener("click", async (e) => {
  e.preventDefault();

  const idUsuario = localStorage.getItem("idUsuario");
  const idLocal = localStorage.getItem("idLocalAtual");
  const textoInput = document.getElementById("texto");
  const texto = textoInput.value.trim();
console.log(idLocal, idUsuario, texto)
  if (!idUsuario) return alert("É preciso estar logado para comentar.");
  if (!texto) return alert("Digite algo antes de enviar!");

  try {
    const res = await fetch("http://192.168.1.27:3000/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_local: idLocal,
        texto:texto,
      })
    });

    if (res.status == 201) {
      textoInput.value = "";
      carregarComentarios(idLocal);
      return;
    } else {
      alert("Erro ao enviar comentário.");
      
    }
  } catch (error) {
    console.error("Erro:", error);
  }
});

// Excluir comentário
document.addEventListener("click", async e => {
  if (e.target.classList.contains("btnExcluir")) {
    const idComentario = e.target.dataset.id;
    const idUsuario = parseInt(localStorage.getItem("idUsuario"));
    const funcao = localStorage.getItem("funcao");

    try {
      const resp = await fetch(`http://192.168.1.27:3000/comentarios/${idComentario}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: idUsuario, funcao })
      });

      if (resp.ok) {
        alert("Comentário excluído!");
        e.target.parentElement.remove();
      } else {
        const erro = await resp.json();
        alert(erro.erro || "Erro ao excluir comentário.");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  }
});