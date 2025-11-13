document.addEventListener("DOMContentLoaded", () => {
  const linkPerfil = document.getElementById("linkPerfil");

  linkPerfil.addEventListener("click", (e) => {
    e.preventDefault(); // evita ir direto

    const idUsuario = localStorage.getItem("idUsuario");

    if (idUsuario) {
      // usuário logado → vai pro perfil
      window.location.href = "../perfil/perfil.html";
    } else {
      // usuário não logado → vai pro login
      window.location.href = "../login/login.html";
    }
  });
});

async function carregarLugares() {
  try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const cidade = urlParams.get("cidade");

    const local = document.querySelector("#local");
    local.innerText = cidade;

    const response = await fetch(`https://back-vqb-2.onrender.com/cidades/${cidade}`);
    if (!response.ok) throw new Error("Erro ao buscar os lugares");

    const lugares = await response.json();
    const container = document.getElementById("container-lugares");
    container.innerHTML = "";

    lugares.forEach((lugar) => {
      const card = document.createElement("div");
      card.classList.add("lugar-card");

      card.innerHTML = `
        <img src="${lugar.imagem}" alt="${lugar.nome_local}">
        <div class="lugar-info">
          <h3>${lugar.nome_local}</h3>
          <p>${lugar.categoria}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `../detalhesLocal/detalhes.html?id=${lugar.id_local}`;
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar os lugares:", error);
  }
}

document.addEventListener("DOMContentLoaded", carregarLugares);