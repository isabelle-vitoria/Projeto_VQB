// inserir.js
(() => {
  // -------------------------
  // Utils / estado
  // -------------------------
  let imagemBase64 = ""; // variável global para armazenar a imagem (preview / envio)

  function getDiasSelecionados() {
    const selecionados = document.querySelectorAll('.dias-checkbox input[type="checkbox"]:checked');
    return Array.from(selecionados).map(dia => dia.value);
  }

  function setDiasSelecionadosString(diasString) {
    // recebe "domingo,segunda,..." ou array
    const diasArr = Array.isArray(diasString) ? diasString : (diasString ? diasString.split(",") : []);
    document.querySelectorAll('.dias-checkbox input[type="checkbox"]').forEach(chk => {
      chk.checked = diasArr.includes(chk.value);
    });
  }

  (function() {
    const btnVoltar = document.getElementById("btnVoltarPerfil");
    if (!btnVoltar) return;

    btnVoltar.addEventListener("click", () => {
      // Limpa o localParaEditar, pra garantir que o inserir volte vazio
      localStorage.removeItem("localParaEditar");

      // Redireciona para a página de perfil
      window.location.href = "../perfil/perfil.html";
    });
  })();

  function safeQuery(selector) {
    return document.querySelector(selector);
  }

  // -------------------------
  // DOMContentLoaded principal
  // -------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    // elementos que podem ou não existir dependendo do HTML
    const inputImagem = document.getElementById("imagem-local"); // input file (novo)
    const preview = document.getElementById("preview") || document.getElementById("previewImagem"); // preview id usado em lugares diferentes
    const categorias = document.querySelectorAll(".cat");
    const salvarBtn = document.getElementById("salvar") || document.getElementById("btnSalvar"); // botão de salvar/atualizar
    const checkBoxesDias = document.querySelectorAll('.dias-checkbox input[type="checkbox"]');

    // -------------- Preview imagem --------------
    if (inputImagem) {
      inputImagem.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            if (preview) preview.src = event.target.result; // mostra a imagem
            imagemBase64 = event.target.result; // guarda a imagem em base64
          };
          reader.readAsDataURL(file); // converte para Base64
        }
      });
    }

    // -------------- Categorias (toggle visual) --------------
    if (categorias && categorias.length) {
      categorias.forEach(btn => {
        btn.addEventListener("click", () => {
          categorias.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }

    // -------------- Logs de dias selecionados (opcional) --------------
    if (checkBoxesDias && checkBoxesDias.length) {
      checkBoxesDias.forEach(chk => {
        chk.addEventListener("click", () => {
          const dias = getDiasSelecionados().join(",");
          console.log("Dias selecionados:", dias);
        });
      });
    }

    // -------------- Carregar se for edição --------------
    const idLocalParaEditar = localStorage.getItem("localParaEditar");
    if (idLocalParaEditar) {
      try {
        const resp = await fetch(`http://192.168.1.27:3000/locais/${idLocalParaEditar}`);
        if (!resp.ok) throw new Error("Erro ao buscar local para edição");
        const local = await resp.json();

        // Mapear vários possíveis ids de campo no seu HTML (compatibilidade)
        const nomeEl = document.getElementById("nome") || document.getElementById("nome_local");
        const categoriaEl = document.getElementById("categoria");
        const descricaoEl = document.getElementById("descricao");
        const enderecoEl = document.getElementById("endereco");
        const cidadeEl = document.getElementById("cidade");
        const contatoEl = document.getElementById("contato");
        const abreEl = document.getElementById("abre");
        const fechaEl = document.getElementById("fecha");

        if (nomeEl) nomeEl.value = local.nome_local || local.nome || "";
        if (categoriaEl) {
          // se você usa um select/input com id="categoria"
          categoriaEl.value = local.categoria || "";
        }
        if (descricaoEl) descricaoEl.value = local.descricao || "";
        if (enderecoEl) enderecoEl.value = local.endereco || "";
        if (cidadeEl) cidadeEl.value = local.cidade || "";
        if (contatoEl) contatoEl.value = local.contato || "";

        // horário: tenta partir se estiver salvo como "HH:MM-HH:MM" ou "HH:MMHH:MM"
        if (local.horario_funcionamento) {
          const hf = local.horario_funcionamento;
          if (hf.includes("-")) {
            const [a, b] = hf.split("-");
            if (abreEl) abreEl.value = a;
            if (fechaEl) fechaEl.value = b;
          } else if (hf.length >= 8) {
            // ex: "08:0017:00" -> pega primeira e segunda parte
            if (abreEl) abreEl.value = hf.slice(0, 5);
            if (fechaEl) fechaEl.value = hf.slice(5, 10);
          } else {
            // fallback: deixa como veio
            if (abreEl) abreEl.value = local.hora_abre || "";
            if (fechaEl) fechaEl.value = local.hora_fecha || "";
          }
        }

        // imagens / preview
        if (local.imagem) {
          if (preview) preview.src = local.imagem;
          imagemBase64 = local.imagem; // mantém a imagem atual para envio se não trocar
        }

        // dias (assumindo string "domingo,segunda,...")
        if (local.dias) {
          setDiasSelecionadosString(local.dias);
        }

        // Se você usa botões .cat (visuais), setar active na que casar com a categoria
        if (categorias && categorias.length && local.categoria) {
          categorias.forEach(b => {
            const texto = (b.innerText || b.textContent || "").trim();
            if (texto.toLowerCase() === (local.categoria || "").toLowerCase()) {
              b.classList.add("active");
            } else {
              b.classList.remove("active");
            }
          });
        }

        // ajustar texto do botão salvar (se existir)
        if (salvarBtn) salvarBtn.textContent = "Salvar Alterações";
      } catch (erro) {
        console.error("Erro ao carregar local para edição:", erro);
        alert("Erro ao carregar dados do local para edição.");
      }
    }

    // -------------- Função que coleta dados do formulário --------------
    function coletarDadosDoFormulario() {
      const nomeEl = document.getElementById("nome") || document.getElementById("nome_local");
      const categoriaEl = document.getElementById("categoria");
      const descricaoEl = document.getElementById("descricao");
      const enderecoEl = document.getElementById("endereco");
      const cidadeEl = document.getElementById("cidade");
      const contatoEl = document.getElementById("contato");
      const abreEl = document.getElementById("abre");
      const fechaEl = document.getElementById("fecha");

      const categoriaAtiva = document.querySelector(".cat.active")?.innerText?.trim() || (categoriaEl ? categoriaEl.value.trim() : null);
      const dias = getDiasSelecionados(); // array
      const horario = (abreEl?.value || "") + (fechaEl?.value || ""); // mantém seu formato original

      return {
        id_usuario: localStorage.getItem("idUsuario"),
        nome_local: nomeEl ? nomeEl.value.trim() : "",
        categoria: categoriaAtiva || null,
        endereco: enderecoEl ? enderecoEl.value.trim() : "",
        cidade: cidadeEl ? cidadeEl.value.trim() : "",
        horario_funcionamento: horario,
        descricao: descricaoEl ? descricaoEl.value.trim() : "",
        contato: contatoEl ? contatoEl.value.trim() : "",
        imagem: imagemBase64 || "",
        dias: dias.join(","),
      };
    }

    // -------------- Envio (novo local / editar) --------------
    async function handleSalvar(e) {
    e?.preventDefault();

  const idLocal = localStorage.getItem("localParaEditar");
  const dados = coletarDadosDoFormulario();

  try {
    const url = idLocal 
      ? `http://192.168.1.27:3000/locais/${idLocal}`
      : "http://192.168.1.27:3000/novolocal";

    const method = idLocal ? "PUT" : "POST";

    const resp = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.erro || (idLocal ? "Erro ao atualizar local" : "Erro ao cadastrar local"));
    }

    alert(idLocal ? "Local atualizado com sucesso!" : "Local cadastrado com sucesso!");

    if (idLocal) {
      localStorage.removeItem("localParaEditar");
    } else {
      limparFormulario();
    }

    window.location.href = "../perfil/perfil.html";
    
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Falha na comunicação com o servidor.");
  }
}

// Função para limpar campos do formulário
function limparFormulario() {
  const campos = ["nome", "nome_local", "descricao", "abre", "fecha", "contato", "endereco"];
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  if (preview) preview.src = "";
  document.querySelectorAll('.dias-checkbox input[type="checkbox"]').forEach(chk => chk.checked = false);
  categorias.forEach(b => b.classList.remove("active"));
  imagemBase64 = "";
}
    // -------------- Agregar listener ao botão salvar (se existir) --------------
    if (salvarBtn) {
      salvarBtn.addEventListener("click", handleSalvar);
    } else {
      // caso o botão seja um <form> com submit, previna e conecte
      const form = document.querySelector("form");
      if (form) form.addEventListener("submit", handleSalvar);
    }

  }); // DOMContentLoaded end

})(); // IIFE end
